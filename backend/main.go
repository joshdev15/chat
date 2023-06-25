package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

// Global Constants
const (
	maxReadLimit  = 512
	maxWriteLimit = 10 * time.Second
	pingPeriod    = time.Minute
	pongWait      = pingPeriod + (10 * time.Second)
)

// Global Variables
var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  2048,
		WriteBufferSize: 2048,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

// Client Struct
type Client struct {
	Nickname     string
	Hub          Hub
	Conn         websocket.Conn
	QueueMessage chan Message
}

func (c *Client) Write() {
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, isOpen := <-c.QueueMessage:
			if !isOpen {
				return
			}

			c.Conn.SetWriteDeadline(time.Now().Add(maxWriteLimit))
			if err := c.Conn.WriteJSON(message); err != nil {
				log.Println("No se pudo escribir el mensaje", err)
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(maxWriteLimit))
			if err := c.Conn.WriteMessage(websocket.PingMessage, []byte("Ping")); err != nil {
				log.Println("No se pudo escribir el mensaje", err)
				return
			}
		}
	}
}

func (c *Client) Read() {
	c.Conn.SetReadLimit(maxReadLimit)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))

	c.Conn.SetPongHandler(func(ping string) error {
		fmt.Println("Pong:", c.Nickname, ping)
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		message := Message{}
		if err := c.Conn.ReadJSON(&message); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("No se pudo leer el mensaje", err)
			}

			c.Hub.unregister <- c
			c.Conn.Close()
			return
		}

		c.Hub.broadcast <- message
	}
}

// Hub Struct
type Hub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	broadcast  chan Message
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan Message, 2),
	}
}

func (h *Hub) Run() {
	for {
		select {
		// Registra (agrega) un cliente a el canal de clientes
		case client := <-h.register:
			h.clients[client.Nickname] = client

		// Elimina (borra) un cliente del canal de clientes
		case client := <-h.unregister:
			if _, ok := h.clients[client.Nickname]; ok {
				delete(h.clients, client.Nickname)
				close(client.QueueMessage)
			}

		// Nuevo mensaje
		case message := <-h.broadcast:
			for nickname, client := range h.clients {
				if message.Nickname != nickname {
					// Sí client.QueueMessage no es done, entonces
					// ejecuta el caso por defecto
					select {
					case client.QueueMessage <- message:
					default:
						delete(h.clients, client.Nickname)
						close(client.QueueMessage)
					}
				}

			}
		}
	}
}

// Message struct
type Message struct {
	Nickname string `json:"nickname,omitempty"`
	Content  string `json:"content,omitempty"`
}

// WSHandler
func HandleWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	fmt.Println("Method", r.Method)

	nickname := r.URL.Query()["nickname"]

	fmt.Printf("User %v is connected\n", nickname)

	if len(nickname) != 1 {
		w.WriteHeader(http.StatusBadRequest)
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	newClient := &Client{
		Nickname:     nickname[0],
		Hub:          *hub,
		Conn:         *conn,
		QueueMessage: make(chan Message, 2),
	}

	newClient.Hub.register <- newClient
	go newClient.Write()
	go newClient.Read()
}

// Main
func main() {
	hubInstance := NewHub()
	go hubInstance.Run()

	serveMux := http.NewServeMux()

	serveMux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		HandleWS(hubInstance, w, r)
	})

	log.Println("running server http://localhost:8080")
	handler := cors.Default().Handler(serveMux)
	log.Fatal(http.ListenAndServe(":8080", handler))
}
