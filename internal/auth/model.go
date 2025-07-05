package auth

import "time"

// User represents a registered user in the system.
type User struct {
    ID           string    // UUID
    Nickname     string
    Age          int
    Gender       string
    FirstName    string
    LastName     string
    Email        string
    PasswordHash string    // Hashed password
    CreatedAt    time.Time
}

// RegisterInput is the expected data from a registration request.
type RegisterInput struct {
    Nickname  string `json:"nickname"`
    Age       int    `json:"age"`
    Gender    string `json:"gender"`
    FirstName string `json:"first_name"`
    LastName  string `json:"last_name"`
    Email     string `json:"email"`
    Password  string `json:"password_hash"`
}

// LoginInput contains data needed to authenticate a user.
type LoginInput struct {
    Identifier string `json:"identifier"` // Could be email or nickname
    Password   string `json:"password"`
}
