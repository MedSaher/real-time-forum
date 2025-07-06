package view

import "sync"

type Error struct {
	StatusCode int
	ErrMessage string
	Mutex      *sync.Mutex
}
