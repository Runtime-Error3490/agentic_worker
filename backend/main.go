package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type LoginPayload struct {
	Platform   string `json:"platform"`
	Username   string `json:"username,omitempty"`
	Password   string `json:"password"`
	Identifier string `json:"identifier,omitempty"`
}

// Middleware to handle CORS
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload LoginPayload
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Decide which Python endpoint to hit
	var pythonURL string
	var forwardBody []byte

	if payload.Platform == "linkedin" {
		pythonURL = "http://localhost:8000/login-linkedin"
		forwardBody, _ = json.Marshal(map[string]string{
			"username": payload.Username,
			"password": payload.Password,
		})
		fmt.Print("LinkedIn login payload: ", string(forwardBody))
	} else if payload.Platform == "twitter" {
		pythonURL = "http://localhost:8000/login-twitter"
		forwardBody, _ = json.Marshal(map[string]string{
			"identifier": payload.Identifier,
			"password":   payload.Password,
		})
		fmt.Print("Twitter login payload: ", string(forwardBody))
	} else {
		http.Error(w, "Unsupported platform", http.StatusBadRequest)
		return
	}

	// Forward to Python
	resp, err := http.Post(pythonURL, "application/json", bytes.NewBuffer(forwardBody))
	if err != nil {
		http.Error(w, "Failed to call Python service", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read Python response
	body, _ := io.ReadAll(resp.Body)

	// Return Python response to frontend
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/login", loginHandler)
	handler := corsMiddleware(mux)
	fmt.Println("Go API listening on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
