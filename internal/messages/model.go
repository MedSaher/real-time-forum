package messages

import "time"

// create a message model to ease working with messages:
type Message struct {
	Id         int    `json:"id"`
	Content    string `json:"content"`
	SenderId   string    
	RecieverId string    `json:"receiver_id"`
	IsRead     bool   `json:"is_read"`
	CreatedAt  time.Time `json:"created_at"`
}

