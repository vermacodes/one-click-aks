package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os/exec"

	"github.com/gin-gonic/gin"
)

type Preference struct {
	AzureRegion string `json:"azureRegion"`
}

func putPreferenceInRedis(preference Preference) {

	rdb := newRedisClient()

	json, err := json.Marshal(preference)
	if err != nil {
		log.Println("Not able to marsharl preference to json while puting in redis", err)
		return
	}
	rdb.Set(ctx, "preference", json, 0)
}

func getPreferenceFromRedis() Preference {

	rdb := newRedisClient()

	val, err := rdb.Get(ctx, "preference").Result()
	if err != nil {
		log.Println("Not able to get preference from redis", err)
		return Preference{}
	}

	preference := Preference{}
	if err = json.Unmarshal([]byte(val), &preference); err != nil {
		log.Println("Not able to unmarshal preference we got from redis", err)
		return Preference{}
	}

	return preference
}

func putPreference(c *gin.Context) {
	var preference Preference
	if err := c.BindJSON(&preference); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	if setPreference(preference, getStorageAccountName()) {
		c.IndentedJSON(http.StatusOK, preference)
	} else {
		c.Status(http.StatusInternalServerError)
	}
}

func getPreferenceFromBlob() Preference {
	out, err := exec.Command("bash", "-c", "az storage blob download -c tfstate -n preference.json --account-name "+getStorageAccountName()+" --file /tmp/file > /dev/null 2>&1 && cat /tmp/file && rm /tmp/file").Output()
	if err != nil {
		log.Println("Error getting preferences from storage exec command failed", err)
		return Preference{}
	}
	preference := Preference{}
	if err = json.Unmarshal(out, &preference); err != nil {
		log.Println("Error getting preferences from storage not able to unmarshal the output.", err)
		return Preference{}
	}
	return preference
}

func getPreference(c *gin.Context) {

	// First look for it in Redis.
	preference := getPreferenceFromRedis()
	if (Preference{} != preference) {
		c.IndentedJSON(http.StatusOK, preference)
		return
	}

	log.Println("Preference not found in redis. Checking storage now")
	// Get from blob if not found in Redis.
	preference = getPreferenceFromBlob()
	if (Preference{} == preference) {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, preference)
}

func setPreference(preference Preference, accountName string) bool {

	out, err := json.Marshal(preference)
	if err != nil {
		log.Println("Error marshaling json")
		return false
	}

	log.Println("Command : ", "bash", "-c", "echo '"+string(out)+"' | az storage blob upload --data @- -c tfstate -n preference.json --account-name "+accountName+" --overwrite")

	_, err = exec.Command("bash", "-c", "echo '"+string(out)+"' | az storage blob upload --data @- -c tfstate -n preference.json --account-name "+accountName+" --overwrite").Output()
	if err != nil {
		log.Println("Error creating default preferences", err)
		return false
	}

	// Add preference to Redis too
	putPreferenceInRedis(preference)

	return true
}

func defaultPreference(accountName string) {
	var preference = Preference{
		AzureRegion: "East US",
	}
	setPreference(preference, accountName)
}
