package entity

type RedisService interface {
	ResetServerCache() error
}

type RedisRepository interface {
	ResetServerCache() error
}
