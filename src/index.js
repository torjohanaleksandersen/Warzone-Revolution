const express = require("express")
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express()
const httpServer = createServer(app);

const io = new Server(httpServer);

const PORT = process.env.PORT || 5000;

let users = []
io.on('connection', socket => {
    users.push(socket)
})

setInterval(() => {
    users.forEach(socket => {
        socket.emit('msg', Math.random())
    })
}, 1000)


app.use(express.static("public"))

httpServer.listen(PORT);