package hub

type Service struct {
	wsRepo WSRepository
}

func NewService(repo WSRepository) *Service {
	return &Service{wsRepo: repo}
}
