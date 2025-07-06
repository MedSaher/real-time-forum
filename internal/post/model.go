package post

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
	ID              int    `json:"id"`
	Title           string `json:"title"`
	Content         string `json:"content"`
	AuthorID        int    `json:"authorId"`
	Timestamp       string `json:"time"`
	LikeCount       int    `json:"likeCount"`
	DislikeCount    int    `json:"dislikeCount"`
	CategoryName    string `json:"categoryName"`
	AuthorFirstName string `json:"authorFirstName"`
	AuthorLastName  string `json:"authorLastName"`
}
