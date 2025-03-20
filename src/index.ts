import express from "express"
import cors from "cors"
import router from "./router"
import http from "http"
import socketio from "socket.io"
import { User } from "./controllers/userController"
import { EventEmitter } from "events"

const PORT = process.env.PORT || 8000

const app = express()
const server = http.createServer(app)
const io = new socketio.Server(server, {
    cors: {
        origin: '*',
    }
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

export const Emitter = new EventEmitter();

type Message = {
    username: string
    message: string
    type: string
}

const last30messages: Message[] = []

function addmessage(message: Message){
    if (last30messages.length == 29){
        last30messages.shift()
        last30messages.push({ username: message.username, message: message.message, type: message.type})
    } else {
        last30messages.push({ username: message.username, message: message.message, type: message.type})
    }
}

Emitter.on("new_user", (user: User) => {
    io.once("connection", (socket) => {
        user.id = socket.id

        socket.broadcast.emit("new_user", user.username)
        addmessage({ username: "server", message: user.username + " acaba de entrar na conversa", type: "new_user"})
        
        socket.emit("last_messages", last30messages)
    
        socket.on("client_message", (data) => {
            socket.broadcast.emit("server_message", data)
            addmessage({ username: data.username, message: data.message, type: "server_message"})
        })
    
        socket.once("disconnect", () => {
            socket.broadcast.emit("disconnected_user", user.username)
            addmessage({ username: "server", message: user.username + " saiu da conversa", type: "disconnected_user"})
            console.log("disconnected user: ", JSON.stringify(user))
            user.logout()
            return;
        });
    });
})

server.listen(PORT, () => {
    console.log("Server is running on PORT " + PORT)
})