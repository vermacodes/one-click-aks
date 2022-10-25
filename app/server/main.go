package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/nbari/violetear"
)

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

	cmd := exec.Command("/home/ashish/git/one-click-aks/apply.sh", "tf")
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

	cmd := exec.Command("/home/ashish/git/one-click-aks/destroy.sh", "tf")
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

func handleRequests() {
	router := violetear.New()
	router.HandleFunc("/apply", apply)
	router.HandleFunc("/destroy", destroy)
	router.HandleFunc("/test", test)
	router.HandleFunc("/loginstatus", validateLogin)
	router.HandleFunc("/accountlist", accountList)
	router.HandleFunc("/accountshow", accountShow)
	router.HandleFunc("/login", accountLogin)
	log.Fatal(http.ListenAndServe(":8080", router))
}

func main() {
	handleRequests()
}
