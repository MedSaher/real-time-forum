package users

import (
	"database/sql"
	"errors"
	"fmt"
)

type UsersRepository interface {
	GetAllUsers(id string) ([]*User, error)
	GetUserIdBySession(token string) (string, error)
}

func NewRepository(db *sql.DB) UsersRepository {
	return &sqliteUsersRepo{db: db}
}

type sqliteUsersRepo struct {
	db *sql.DB
}

// Get all users:
func (r *sqliteUsersRepo) GetAllUsers(myID string) ([]*User, error) {
	query := `
    SELECT id, nickname, unread_count
    FROM (
        -- Users who have chatted with me
        SELECT 
            u.id, 
            u.nickname, 
            MAX(pm.created_at) AS last_message_time,
            (
                SELECT COUNT(*) 
                FROM private_messages 
                WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0
            ) AS unread_count
        FROM users u
        JOIN private_messages pm
            ON (u.id = pm.sender_id AND pm.receiver_id = ?) 
            OR (u.id = pm.receiver_id AND pm.sender_id = ?)
        WHERE u.id != ?
        GROUP BY u.id

        UNION ALL

        -- Users who have NOT chatted with me
        SELECT 
            u.id, 
            u.nickname, 
            NULL as last_message_time,
            0 as unread_count
        FROM users u
        WHERE u.id != ? AND u.id NOT IN (
            SELECT 
                CASE 
                    WHEN pm.sender_id = ? THEN pm.receiver_id
                    ELSE pm.sender_id
                END
            FROM private_messages pm
            WHERE pm.sender_id = ? OR pm.receiver_id = ?
        )
    ) AS all_users
    ORDER BY 
        last_message_time IS NULL,       
        last_message_time DESC,        
        LOWER(nickname) ASC;
    `

	rows, err := r.db.Query(
		query,
		myID, myID, myID, myID, // For first subquery (unread count, joins, filter)
		myID, myID, myID, myID, // For second subquery (not-in logic)
	)
	if err != nil {
		return nil, fmt.Errorf("query error: %v", err)
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		chatUser := &User{}
		if err := rows.Scan(&chatUser.UserId, &chatUser.Nickname, &chatUser.UnreadCount); err != nil {
			return nil, err
		}

		// For now, you can determine online status elsewhere (e.g., session map)
		chatUser.Status = false

		users = append(users, chatUser)
	}

	return users, nil
}

func (r *sqliteUsersRepo) GetUserIdBySession(token string) (string, error) {
	query := `SELECT UserId FROM Session WHERE UUID = ?`

	var userId string
	err := r.db.QueryRow(query, token).Scan(&userId)
	if err != nil {
		return "", errors.New("error retrieving data")
	}

	return userId, nil
}
