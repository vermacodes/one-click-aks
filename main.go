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

func apply(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Applying")

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

func destroy(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Applying")

	cmd := exec.Command("/home/ashish/git/one-click-aks/destroy.sh", "aks-standard-lb-2")
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
		fmt.Fprintf(w, "\n", in.Text())
		fmt.Println(in.Text())
		flusher.Flush()
	}
	input.Close()
}

func welcome(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello Mom!")

	fmt.Println("Endpoint Hit: welcome")
	cmd := exec.Command("/home/ashish/git/one-click-aks/apply.sh", "aks-standard-lb-2")
	stdout, _ := cmd.StdoutPipe()

	fmt.Println("Starting command")
	// if err := cmd.Run(); err != nil {
	// 	fmt.Println("Something brokedown : ", err)
	// }

	cmd.Start()

	scanner := bufio.NewScanner(stdout)
	//scanner.Split(bufio.ScanLines)
	for scanner.Scan() {
		m := scanner.Text()
		fmt.Println(m)
	}

	//cmd.Wait()

	fmt.Println("Command Ended")
}

func handleRequests() {
	router := violetear.New()
	router.HandleFunc("/apply", apply)
	router.HandleFunc("/destroy", destroy)
	log.Fatal(http.ListenAndServe(":8080", router))
}

func main() {
	handleRequests()
}
