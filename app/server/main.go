package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/nbari/violetear"
)

type Status struct {
	Status string `json:"status"`
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func test(w http.ResponseWriter, r *http.Request) {

	enableCors(&w)
	w.WriteHeader(http.StatusOK)

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

func apply(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	w.WriteHeader(http.StatusOK)

	fmt.Fprintf(w, "Applying")

	setEnvironmentVariable("resource_group_name", "repro-project")
	setEnvironmentVariable("storage_account_name", getStorageAccountName())
	setEnvironmentVariable("container_name", "tfstate")
	setEnvironmentVariable("tf_state_file_name", "terraform.tfstate")

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/apply.sh", "tf",
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

func destroy(w http.ResponseWriter, r *http.Request) {

	enableCors(&w)
	w.WriteHeader(http.StatusOK)

	fmt.Fprintf(w, "Destroying")

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/destroy.sh", "tf", os.ExpandEnv("$ROOT_DIR"))
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

func writeOutput(w http.ResponseWriter, input io.ReadCloser) {

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

func status(w http.ResponseWriter, e *http.Request) {
	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	status := Status{}
	status.Status = "OK"

	statusJson, err := json.Marshal(status)
	if err != nil {
		log.Println(err)
	}

	w.Write(statusJson)
}

func handleRequests() {
	router := violetear.New()
	router.HandleFunc("/apply", apply)
	router.HandleFunc("/destroy", destroy)
	router.HandleFunc("/test", test)
	router.HandleFunc("/loginstatus", validateLogin)
	router.HandleFunc("/accountlist", accountList)
	router.HandleFunc("/accountshow", accountShow)
	router.HandleFunc("/login", accountLogin)
	router.HandleFunc("/status", status)
	router.HandleFunc("/healthz", status)
	router.HandleFunc("/getstaterg", getResourceGroup)
	router.HandleFunc("/getstatestorageaccount", getStorageAccount)
	router.HandleFunc("/createstaterg", createResourceGroup)
	router.HandleFunc("/createstatestorageaccount", createStorageAccunt)
	router.HandleFunc("/getcontainer", getContainerApi)
	router.HandleFunc("/createcontainer", createBlobContainer)
	log.Fatal(http.ListenAndServe(":8080", router))
}

func main() {
	handleRequests()
}
