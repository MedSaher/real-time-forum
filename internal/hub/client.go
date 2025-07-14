package hub

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan []byte
	Hub    *Hub
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		go func(newClientID string) {
			msg := Message{Type: "online_users"}
			data, err := json.Marshal(msg)
			if err != nil {
				log.Println("Failed to marshal message:", err)
				return
			}

			// Send to all clients *except* the newly connected one
			for uid, cl := range c.Hub.Clients {
				select {
				case cl.Send <- data:
				default:
					close(cl.Send)
					delete(c.Hub.Clients, uid)
				}
			}
		}(c.UserID)
		c.Conn.Close()
	}()
	for {
		_, msg, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
		fmt.Println(string(msg))
		c.Hub.Broadcast <- msg
	}
}

func (c *Client) WritePump() {
	for msg := range c.Send {
		err := c.Conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			c.Hub.Unregister <- c
			break
		}
	}
}
