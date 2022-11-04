package main

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Blob struct {
	Name string `xml:"Name" json:"name"`
	Url  string `xml:"Url" json:"url"`
}

// Ok. if you noted that the its named blob and should be Blobs. I've no idea whose fault is this.
// Read more about the API https://learn.microsoft.com/en-us/rest/api/storageservices/list-blobs?tabs=azure-ad#request
type Blobs struct {
	Blob []Blob `xml:"Blob" json:"blob"`
}

type EnumerationResults struct {
	Blobs Blobs `xml:"Blobs" json:"blobs"`
}

func listSharedTemplates(c *gin.Context) {

	var blobs EnumerationResults

	url := "https://ashisverma.blob.core.windows.net/repro-project-templates?restype=container&comp=list"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Accept", "application/json")
	req.Header.Add("User-Agent", "Thunder Client (https://www.thunderclient.com)")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println("Body : ", string(body))

	err := xml.Unmarshal(body, &blobs)
	if err != nil {
		fmt.Println("Error : ", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	jsonString, err := json.Marshal(blobs)
	if err != nil {
		fmt.Println("Error : ", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	fmt.Println(string(jsonString))

	c.IndentedJSON(http.StatusOK, blobs.Blobs)
}
