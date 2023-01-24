package entity

type RedisService interface {
	ResetServerCache() error
}

type RedisReposiroty interface {
	ResetServerCache() error
}
