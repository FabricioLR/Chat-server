import express from "express"
import cors from "cors"
import router from "./router"
import http from "http"
import socketio from "socket.io"
import { logout, user } from "./controllers/userController"

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

type Message = {
    username: string
    message: string
    type: string
}

const last30messages: Message[] = []

io.on("connection", (socket) => {
    const id = socket.id

    console.log("connected " + id);
    socket.broadcast.emit("new_user", user)
    if (last30messages.length == 29){
        last30messages.shift()
        last30messages.push({ username: "server", message: user?.username + " acaba de entrar na conversa", type: "new_user"})
    } else {
        last30messages.push({ username: "server", message: user?.username + " acaba de entrar na conversa", type: "new_user"})
    }

    socket.emit("last_messages", last30messages)

    socket.on("client_message", (data) => {
        socket.broadcast.emit("server_message", data)
        if (last30messages.length == 29){
            last30messages.shift()
            last30messages.push({ username: data.username, message: data.message, type: "server_message"})
        } else {
            last30messages.push({ username: data.username, message: data.message, type: "server_message"})
        }
    })

    socket.on("disconnect", () => {
        console.log("disconnected " + id);
        socket.broadcast.emit("disconnected_user", user)
        if (last30messages.length == 29){
            last30messages.shift()
            last30messages.push({ username: "server", message: user?.username + " saiu da conversa", type: "disconnected_user"})
        } else {
            last30messages.push({ username: "server", message: user?.username + " saiu da conversa", type: "disconnected_user"})
        }

        logout()
    });
});

server.listen(PORT, () => {
    console.log("Server is running on PORT " + PORT)
})