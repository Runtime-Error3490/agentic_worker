package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

type LoginPayload struct {
	Platform   string `json:"platform"`
	Username   string `json:"username,omitempty"`
	Password   string `json:"password"`
	Identifier string `json:"identifier,omitempty"`
}
type TextAIRequest struct {
	Text string `json:"text"`
}

type TextAIResponse struct {
	Text string `json:"text"`
}

type geminiRequest struct {
	Contents []struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"contents"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
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
	//path changed
	if payload.Platform == "linkedin" {
		pythonURL = "https://agentic-worker-1.onrender.com/login-linkedin"
		forwardBody, _ = json.Marshal(map[string]string{
			"username": payload.Username,
			"password": payload.Password,
		})
	} else if payload.Platform == "twitter" {
		pythonURL = "https://agentic-worker-1.onrender.com/login-twitter"
		forwardBody, _ = json.Marshal(map[string]string{
			"identifier": payload.Identifier,
			"password":   payload.Password,
		})
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
func textAIHandler(w http.ResponseWriter, r *http.Request) {
	log.Print("Received text AI request")
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY environment variable not set.")
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	var req TextAIRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid payload"}`, http.StatusBadRequest)
		return
	}
	log.Print("Calling Gemini AI with prompt: ", req.Text)
	generated, err := callGemini(apiKey, req.Text)
	if err != nil {
		log.Printf("AI call failed: %v", err)
		http.Error(w, `{"error":"AI service error"}`, http.StatusInternalServerError)
		return
	}
	log.Print("AI response: ", generated)
	json.NewEncoder(w).Encode(TextAIResponse{Text: generated})
}
func callGemini(apiKey, prompt string) (string, error) {

	reqBody := geminiRequest{
		Contents: []struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		}{
			{
				Parts: []struct {
					Text string `json:"text"`
				}{
					{Text: prompt},
				},
			},
		},
	}

	buf, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	endpoint := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=%s",
		apiKey,
	)
	httpReq, err := http.NewRequest("POST", endpoint, bytes.NewReader(buf))
	if err != nil {
		return "", fmt.Errorf("new request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Printf("Raw Gemini JSON: %s\n", bodyBytes)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("bad status: %s -- %s", resp.Status, bodyBytes)
	}

	var apiResp geminiResponse
	if err := json.Unmarshal(bodyBytes, &apiResp); err != nil {
		return "", fmt.Errorf("unmarshal response: %w", err)
	}

	if len(apiResp.Candidates) == 0 || len(apiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no generated text in response")
	}
	return apiResp.Candidates[0].Content.Parts[0].Text, nil
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/login", loginHandler)
	mux.HandleFunc("/api/textai", textAIHandler)
	handler := corsMiddleware(mux)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // only for local dev; Render will always set PORT
	}
	fmt.Println("Go API listening on http://localhost:" + port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
