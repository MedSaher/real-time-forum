package view

import "sync"

type Error struct {
	StatusCode int
	ErrMessage string
	Mutex      *sync.Mutex
}

func (e *Error) ErrBroadCast(status int, errMsg string) *Error {
	errorMsg := Error{
		Mutex: &sync.Mutex{},
	}
	errorMsg.Mutex.Lock()
	errorMsg.StatusCode = status
	errorMsg.ErrMessage = errMsg
	errorMsg.Mutex.Unlock()

	return &errorMsg

}