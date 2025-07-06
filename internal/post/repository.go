package post

import (
	"database/sql"
	"errors"
)

type PostRepository interface {
	CreatePost(post *Post) (*PostDTO, error)
	GetUserIdBySession(token string) (string, error)
}

type sqlitePostRepo struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) PostRepository {
	return &sqlitePostRepo{db: db}
}

func (r *sqlitePostRepo) CreatePost(post *Post) (*PostDTO, error) {

	// Insert the new post into the Post table
	query := `INSERT INTO Post (Title, Content, AuthorID)
          VALUES (?, ?, ?)`
	result, err := r.db.Exec(query, post.Title, post.Content, post.AuthorID)
	if err != nil {
		return nil, err
	}

	// Get the last inserted ID
	lastID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// Fetch the newly inserted post details
	query = `SELECT Post.ID, Title, Content, AuthorID, Timestamp, LikeCount, DislikeCount, 
                    users.first_name, users.last_name 
             FROM Post
             INNER JOIN users ON users.ID = Post.AuthorID
             WHERE Post.ID = ?`

	var postDTO PostDTO
	err = r.db.QueryRow(query, lastID).Scan(
		&postDTO.ID, &postDTO.Title, &postDTO.Content, &postDTO.AuthorID,
		&postDTO.Timestamp, &postDTO.LikeCount, &postDTO.DislikeCount,
		&postDTO.AuthorFirstName, &postDTO.AuthorLastName)
	if err != nil {
		return nil, err
	}

	// Return the full postDTO details including author and timestamp
	return &postDTO, nil
}
func (r *sqlitePostRepo) GetUserIdBySession(token string) (string, error) {
	query := `SELECT UserId FROM Session WHERE UUID = ?`

	var userId string
	err := r.db.QueryRow(query, token).Scan(&userId)
	if err != nil {
		return "", errors.New("error retrieving data")
	}

	return userId, nil
}
