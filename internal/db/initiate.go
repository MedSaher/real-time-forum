package database

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// Schema definition:
const schema = `
CREATE TABLE IF NOT EXISTS User (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    ProfilePicture TEXT
);
CREATE TABLE IF NOT EXISTS Category (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT
);
CREATE TABLE IF NOT EXISTS Post (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Content TEXT NOT NULL,
    AuthorID INTEGER NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    LikeCount INTEGER DEFAULT 0,
    DislikeCount INTEGER DEFAULT 0,
    FOREIGN KEY (AuthorID) REFERENCES User (ID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS PostCategory (
    PostID INTEGER NOT NULL,
    CategoryID INTEGER NOT NULL,
    PRIMARY KEY (PostID, CategoryID),
    FOREIGN KEY (PostID) REFERENCES Post (ID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Category (ID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Comment (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Content TEXT NOT NULL,
    AuthorID INTEGER NOT NULL,
    PostID INTEGER NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    LikeCount INTEGER DEFAULT 0,
    DislikeCount INTEGER DEFAULT 0,
    FOREIGN KEY (AuthorID) REFERENCES User (ID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES Post (ID) ON DELETE CASCADE
);
CREATE TABLE Vote (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    PostID INTEGER DEFAULT NULL,
    CommentID INTEGER DEFAULT NULL,
    Value INTEGER CHECK (Value IN (1, -1)),
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User (ID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES Post (ID) ON DELETE CASCADE,
    FOREIGN KEY (CommentID) REFERENCES Comment (ID) ON DELETE CASCADE,
    UNIQUE (UserID, PostID),
    UNIQUE (UserID, CommentID)
);
CREATE TABLE IF NOT EXISTS Session (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    UUID TEXT NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User (ID) ON DELETE CASCADE
);
INSERT INTO Category (Name, Description) VALUES 
('Technology', 'Discussions about programming, software, hardware, and emerging tech trends.'),
('Gaming', 'A place to discuss video games, gaming consoles, and e-sports.'),
('Science & Education', 'Topics related to scientific discoveries, research, and learning resources.'),
('Lifestyle & Health', 'Conversations about fitness, mental health, diet, and daily life.'),
('Entertainment', 'Movies, TV shows, music, and celebrity news discussions.'),
('General Discussion', 'A category for off-topic discussions and community interactions.');
`

// Create the database schema:
func CreateSchema() error {
	// Create the database schema:
	db, err := sql.Open("sqlite3", "forum_db.db")
	if err != nil {
		return err
	}

	// Create tables if they do not exist
	_, err = db.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}
	return nil
}
