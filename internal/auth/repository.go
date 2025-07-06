package auth

import (
	"database/sql"
	"errors"
	"strconv"
	"time"
)

type UserRepository interface {
	FindByIdentifier(identifier string) (*User, error) // email or nickname
	CreateSession(token string, userId string) (string, error)
	FindByNickname(nickname string) (*User, error)
	FindByEmail(email string) (*User, error)
	GetUserIdBySession(token string) (string, error)
	GetUserNameById(userId string) (string, error)
	CreateUser(user *User) error
}

type sqliteUserRepo struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &sqliteUserRepo{db: db}
}

func (r *sqliteUserRepo) CreateUser(user *User) error {
	query := `INSERT INTO users (nickname, age, gender, first_name, last_name, email, password_hash, created_at)
	          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := r.db.Exec(query, user.Nickname, user.Age, user.Gender, user.FirstName, user.LastName, user.Email, user.PasswordHash, time.Now())
	if err != nil {
		return err
	}

	lastID, err := result.LastInsertId()
	if err != nil {
		return err
	}
	id := strconv.Itoa(int(lastID))
	user.ID = id
	return nil
}

func (r *sqliteUserRepo) FindByEmail(email string) (*User, error) {
	return r.findUser("email", email)
}

func (r *sqliteUserRepo) FindByNickname(nickname string) (*User, error) {
	return r.findUser("nickname", nickname)
}

func (r *sqliteUserRepo) FindByIdentifier(identifier string) (*User, error) {
	// Try email first, then nickname
	user, err := r.FindByEmail(identifier)
	if err == nil {
		return user, nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return r.FindByNickname(identifier)
	}
	return nil, err
}

func (r *sqliteUserRepo) findUser(field, value string) (*User, error) {
	user := &User{}
	query := `SELECT id, nickname, age, gender, first_name, last_name, email, password_hash, created_at
              FROM users WHERE ` + field + ` = ? LIMIT 1`
	row := r.db.QueryRow(query, value)
	err := row.Scan(&user.ID, &user.Nickname, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *sqliteUserRepo) CreateSession(token string, userId string) (string, error) {
	// Set session expiry time (e.g., 24 hours from now)
	expiresAt := time.Now().Add(24 * time.Hour)

	// Insert new session into the database
	query := `
        INSERT INTO Session (UserID, UUID, ExpiresAt)
        VALUES (?, ?, ?)
    `

	_, err := r.db.Exec(query, userId, token, expiresAt)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (r *sqliteUserRepo) GetUserIdBySession(token string) (string, error) {
	query := `SELECT UserId FROM Session WHERE UUID = ?`

	var userId string
	err := r.db.QueryRow(query, token).Scan(&userId)
	if err != nil {
		return "", errors.New("error retrieving data")
	}

	return userId, nil
}

func (r *sqliteUserRepo) GetUserNameById(userId string) (string, error) {
	query := `SELECT nickname FROM Users WHERE id = ?`

	var userName string
	err := r.db.QueryRow(query, userId).Scan(&userName)

	if err != nil {
		return "", errors.New("error retrieving data")
	}

	return userName, nil
}
