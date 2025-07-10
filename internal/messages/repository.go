package messages

import (
	"database/sql"
	"errors"
	"fmt"
)

// MessageRepositoryLayer defines the interface contract
type MessageRepositoryLayer interface {
	InsertMessage(m *Message) error
	GetChatHistory(client string, guest int, offset int, limit int) ([]*Message, error)
	GetLastMessage(user1ID, user2ID int) (*Message, error)
	MarkMessagesAsRead(senderID, receiverID int) error
	GetUnreadMessageCount(userID int) (int, error)
	GetUnreadMessages(userID int) ([]*Message, error) 
	GetUserIdBySession(token string) (string, error)
	GetUserById(id string) bool
}

// MessageRepository is the concrete implementation
type MessageRepository struct {
	db *sql.DB
}

// NewRepository returns a new repository instance (fix: return pointer)
func NewRepository(dataBase *sql.DB) MessageRepositoryLayer {
	return &MessageRepository{db: dataBase}
}

// InsertMessage inserts a new message into the database
func (r *MessageRepository) InsertMessage(message *Message) error {
	query := `INSERT INTO private_messages(content, sender_id, receiver_id, is_read) VALUES(?, ?, ?, ?)`
	_, err := r.db.Exec(query, message.Content, message.SenderId, message.RecieverId, message.IsRead)
	return err
}

// GetChatHistory returns the chat history between two users
func (r *MessageRepository) GetChatHistory(client string, guest, offset, limit int) ([]*Message, error) {
	query := `
	SELECT ID, content, sender_id, receiver_id, is_read, created_at
	FROM private_messages
	WHERE (sender_id = ? AND receiver_id = ?)
	   OR (sender_id = ? AND receiver_id = ?)
	ORDER BY ID DESC
	LIMIT ? OFFSET ?
	`

	rows, err := r.db.Query(query, client, guest, guest, client, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*Message

	for rows.Next() {
		msg := &Message{}
		if err := rows.Scan(&msg.Id, &msg.Content, &msg.SenderId, &msg.RecieverId, &msg.IsRead, &msg.CreatedAt); err != nil {
			return nil, err
		}
		fmt.Println(msg.RecieverId)
		messages = append(messages, msg)
	}

	return messages, nil
}

// GetLastMessage retrieves the most recent message between two users
func (r *MessageRepository) GetLastMessage(client, guest int) (*Message, error) {
	query := `
	SELECT ID, content, sender_id, receiver_id, is_read, created_at
	FROM private_messages
	WHERE (sender_id = ? AND receiver_id = ?)
	   OR (sender_id = ? AND receiver_id = ?)
	ORDER BY created_at DESC
	LIMIT 1;
	`

	row := r.db.QueryRow(query, client, guest, guest, client)

	msg := &Message{}
	err := row.Scan(&msg.Id, &msg.Content, &msg.SenderId, &msg.RecieverId, &msg.IsRead, &msg.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return msg, nil
}

// MarkMessagesAsRead marks unread messages as read between two users
func (r *MessageRepository) MarkMessagesAsRead(senderID, receiverID int) error {
	query := `
	UPDATE private_messages 
	SET is_read = 1 
	WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
	`
	_, err := r.db.Exec(query, senderID, receiverID)
	if err != nil {
		return fmt.Errorf("failed to mark messages as read: %w", err)
	}
	return nil
}

// GetUnreadMessageCount returns the number of unread messages for a user
func (r *MessageRepository) GetUnreadMessageCount(userID int) (int, error) {
	query := `
	SELECT COUNT(*) 
	FROM private_messages 
	WHERE receiver_id = ? AND is_read = 0
	`
	var count int
	err := r.db.QueryRow(query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get unread message count: %w", err)
	}
	return count, nil
}

// GetUnreadMessages fetches all unread messages for a user
func (r *MessageRepository) GetUnreadMessages(userID int) ([]*Message, error) {
	query := `
	SELECT ID, content, sender_id, receiver_id, is_read, created_at 
	FROM private_messages 
	WHERE receiver_id = ? AND is_read = 0 
	ORDER BY created_at ASC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get unread messages: %w", err)
	}
	defer rows.Close()

	var messages []*Message
	for rows.Next() {
		msg := &Message{}
		if err := rows.Scan(&msg.Id, &msg.Content, &msg.SenderId, &msg.RecieverId, &msg.IsRead, &msg.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	return messages, nil
}

// GetUserIdBySession retrieves the user ID linked to a session token
func (r *MessageRepository) GetUserIdBySession(token string) (string, error) {
	query := `SELECT UserId FROM Session WHERE UUID = ?`

	var userId string
	err := r.db.QueryRow(query, token).Scan(&userId)
	if err != nil {
		return "", errors.New("error retrieving data")
	}

	return userId, nil
}

func (r *MessageRepository) GetUserById(id string) bool {
	query := `SELECT id FROM users WHERE id = ?`
	var dummy string
	err := r.db.QueryRow(query, id).Scan(&dummy)
	return err == nil
}
