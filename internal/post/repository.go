package post

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
)

type PostRepository interface {
	CreatePost(post *Post) (*PostDTO, error)
	GetUserIdBySession(token string) (string, error)
	GetAllPosts() ([]*PostDTO, error)
	CreateComment(postId string, authorId string, comment string) error
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

func (r *sqlitePostRepo) GetAllPosts() ([]*PostDTO, error) {

	query := `
	SELECT 
		Post.ID, 
		Post.Title, 
		Post.Content, 
		Post.AuthorID, 
		Post.Timestamp, 
		Post.LikeCount, 
		Post.DislikeCount, 
		IFNULL(GROUP_CONCAT(DISTINCT Category.Name), '') AS Categories, 
		users.nickname,
		users.first_name, 
		users.last_name 
	FROM Post
	INNER JOIN users ON users.id = Post.AuthorID
	LEFT JOIN PostCategory ON Post.ID = PostCategory.PostID
	LEFT JOIN Category ON PostCategory.CategoryID = Category.ID
	GROUP BY 
		Post.ID, Post.Title, Post.Content, Post.AuthorID, Post.Timestamp, 
		Post.LikeCount, Post.DislikeCount, users.nickname, 
		users.first_name, users.last_name
	ORDER BY Post.ID DESC;`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	var posts []*PostDTO
	for rows.Next() {
		post := &PostDTO{}
		if err := rows.Scan(
			&post.ID,
			&post.Title,
			&post.Content,
			&post.AuthorID,
			&post.Timestamp,
			&post.LikeCount,
			&post.DislikeCount,
			&post.CategoryName,
			&post.NickName,
			&post.AuthorFirstName,
			&post.AuthorLastName,
		); err != nil {
			fmt.Println(post.Timestamp)
			return nil, fmt.Errorf("row scan error: %w", err)
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func (r *sqlitePostRepo) CreateComment(postId string, authorId string, content string) error {
	query := `INSERT INTO Comment (Content, AuthorID, PostID, Timestamp, LikeCount, DislikeCount) VALUES (?, ?, ?, ?, 0, 0)`
	_, err := r.db.Exec(query, content, authorId, postId, time.Now().Format(time.RFC3339))
	if err != nil {
		return err
	}
	return nil
}
