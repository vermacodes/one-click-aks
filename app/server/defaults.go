package main

import "log"

func onAuthDefaults() {
	loginStatus := validateLoginService()
	if !loginStatus.IsLoggedIn {
		return
	}
	if _, err := setDefaultTfvarService(); err != nil {
		log.Println("Not able to set default tfvar")
		return
	}
}