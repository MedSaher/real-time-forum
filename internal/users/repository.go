package users

import (
	"database/sql"
	"errors"
)

type UsersRepository interface {
	GetAllUsers() ([]*User, error)
	GetUserIdBySession(token string) (string, error)
}

func NewRepository(db *sql.DB) UsersRepository {
	return &sqliteUsersRepo{db: db}
}

type sqliteUsersRepo struct {
	db *sql.DB
}

func (r *sqliteUsersRepo) GetAllUsers() ([]*User, error) {
	rows, err := r.db.Query("SELECT id, nickname FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var Users []*User
	for rows.Next() {
		user := &User{}
		if err := rows.Scan(&user.UserId, &user.Nickname); err != nil {
			return nil, err
		}
		user.Status = false
		Users = append(Users, user)
	}
	return Users, nil
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
