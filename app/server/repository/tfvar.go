package repository

import "github.com/vermacodes/one-click-aks/app/server/entity"

type redisTfvarRepository struct{}

func NewRedisTfvarRepository() entity.TfvarRepository {
	return &redisTfvarRepository{}
}

func (r *redisTfvarRepository) Get() (string, error) {
	return getRedis("tfvar")
}

func (r *redisTfvarRepository) Put(tfvar string) (string, error) {
	err := setRedis("tfvar", tfvar)
	return tfvar, err
}
