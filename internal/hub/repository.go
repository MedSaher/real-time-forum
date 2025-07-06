package hub

import (
	"database/sql"
	"errors"
)

type WSRepository interface {
	GetUserIdBySession(session_token string) (string, error)
}

func NewWSRepository(db *sql.DB) WSRepository {
	return &sqliteRepo{db: db}
}

type sqliteRepo struct {
	db *sql.DB
}

func (r *sqliteRepo) GetUserIdBySession(session_token string) (string, error) {
	query := `SELECT UserId FROM Session WHERE UUID = ?`

	var userId string
	err := r.db.QueryRow(query, session_token).Scan(&userId)
	if err != nil {
		return "", errors.New("error retrieving data")
	}

	return userId, nil

}
