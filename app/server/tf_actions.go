package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
)

type clusterconfig struct {
	NetworkPlugin string `json:"networkPlugin"`
}

func test(c *gin.Context) {

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	cmd := exec.Command("/home/ashish/git/one-click-aks/script.sh")
	rPipe, wPipe, err := os.Pipe()
	if err != nil {
		log.Fatal(err)
	}
	cmd.Stdout = wPipe
	cmd.Stderr = wPipe
	if err := cmd.Start(); err != nil {
		log.Fatal(err)
	}

	go writeOutput(w, rPipe)
	cmd.Wait()
	wPipe.Close()
}

func apply(c *gin.Context) {

	var cluster clusterconfig
	if err := c.BindJSON(&cluster); err != nil {
		return
	}

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	setEnvironmentVariable("resource_group_name", "repro-project")
	setEnvironmentVariable("storage_account_name", getStorageAccountName())
	setEnvironmentVariable("container_name", "tfstate")
	setEnvironmentVariable("tf_state_file_name", "terraform.tfstate")
	setEnvironmentVariable("TF_VAR_network_plugin", cluster.NetworkPlugin)

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/apply.sh", "tf",
		os.ExpandEnv("$ROOT_DIR"),
		os.ExpandEnv("$resource_group_name"),
		os.ExpandEnv("$storage_account_name"),
		os.ExpandEnv("$container_name"),
		os.ExpandEnv("$tf_state_file_name"))

	rPipe, wPipe, err := os.Pipe()
	if err != nil {
		log.Fatal(err)
	}
	cmd.Stdout = wPipe
	cmd.Stderr = wPipe
	if err := cmd.Start(); err != nil {
		log.Fatal(err)
	}

	go writeOutput(w, rPipe)
	cmd.Wait()
	wPipe.Close()
}

func destroy(c *gin.Context) {

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	setEnvironmentVariable("resource_group_name", "repro-project")
	setEnvironmentVariable("storage_account_name", getStorageAccountName())
	setEnvironmentVariable("container_name", "tfstate")
	setEnvironmentVariable("tf_state_file_name", "terraform.tfstate")

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/destroy.sh", "tf",
		os.ExpandEnv("$ROOT_DIR"),
		os.ExpandEnv("$resource_group_name"),
		os.ExpandEnv("$storage_account_name"),
		os.ExpandEnv("$container_name"),
		os.ExpandEnv("$tf_state_file_name"))

	rPipe, wPipe, err := os.Pipe()
	if err != nil {
		log.Fatal(err)
	}
	cmd.Stdout = wPipe
	cmd.Stderr = wPipe
	if err := cmd.Start(); err != nil {
		log.Fatal(err)
	}
	go writeOutput(w, rPipe)
	cmd.Wait()
	wPipe.Close()
}

func writeOutput(w gin.ResponseWriter, input io.ReadCloser) {

	fmt.Println("Writing Output")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	in := bufio.NewScanner(input)
	for in.Scan() {
		fmt.Fprintf(w, "%s\n", in.Text())
		fmt.Println(in.Text())
		flusher.Flush()
	}
	input.Close()
}
