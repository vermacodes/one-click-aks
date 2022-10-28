package main

import (
	"log"
	"os"
)

func setEnvironmentVariable(key string, value string) {
	err := os.Setenv(key, value)
	if err != nil {
		log.Fatal(err)
	}
}
