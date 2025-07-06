package users

import "database/sql"

type UsersRepository interface {
	GetAllUsers() ([]*User, error)
}

func newRepository(db *sql.DB) UsersRepository {
	return &sqliteUsersRepo{db: db}
}

type sqliteUsersRepo struct {
	db *sql.DB
}

func (r *sqliteUsersRepo) GetAllUsers() ([]*User, error){
	rows, err := r.db.Query("SELECT * FROM User")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var Users []*User
	for rows.Next() {
		user := &User{}
		if err := rows.Scan(&user.UserId, &user.Nickname); err != nil {
			return nil, err
		}
		Users = append(Users, user)
	}
	return Users, nil
}