package post

import "time"

// Declare a model to represent the Post and ease data exchange between backend and frontend:
type Post struct {
	Title        string   `json:"title"`
	Content      string   `json:"content"`
	AuthorID     string   `json:"authorId"`
	Timestamp    string   `json:"time"`
	LikeCount    int      `json:"likeCount"`
	DislikeCount int      `json:"dislikeCount"`
	Categories   []string `json:"categories"`
}
type PostDTO struct {
	ID              int       `json:"id"`
	NickName        string    `json:"nickname"`
	Title           string    `json:"title"`
	Content         string    `json:"content"`
	AuthorID        int       `json:"authorId"`
	Timestamp       time.Time `json:"time"`
	LikeCount       int       `json:"likeCount"`
	DislikeCount    int       `json:"dislikeCount"`
	CategoryName    string    `json:"categoryName"`
	AuthorFirstName string    `json:"authorFirstName"`
	AuthorLastName  string    `json:"authorLastName"`
}

// Create the comment model:
type Comment struct {
	Id        int    `json:"id"`
	Content   string `json:"comment"`
	AuthorID  string `json:"author_id"`
	NickName  string `json:"nick_name"`
	PostId    string `json:"post_id"`
	CreatedAt string `json:"created_at"`
}
