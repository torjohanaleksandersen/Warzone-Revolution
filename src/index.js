import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as THREE from './Imports/three.module.js'
import { Capsule } from './Imports/Capsule.js';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 5000;

import { animate } from "./physics.js";


const USERS = []

class User {
    constructor(socket) {
        this.socket = socket
        this.id = this.socket.id
        this.keyStates = {}
        this.collider = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 )
        this.velocity = new THREE.Vector3()
        this.direction = new THREE.Vector3()
        this.forwardVector = []
        this.sideVector = []
        this.onFloor = false
        this.speed = 9

        this.position = null



        this.socket.on('keys-update', data => {
            this.keyStates[data.key] = data.state
        })

        this.socket.on('camera-update', data => {
            const [f, s] = data
            this.forwardVector = f
            this.sideVector = s
        })
    }
}

io.on('connection', socket => { 
    let user = new User(socket) 
    USERS.push(user)

    socket.on('disconnect', () => {
        const disconnectedUser = USERS.find(user => user.id === socket.id)
        if (disconnectedUser) {
            USERS.splice(USERS.indexOf(disconnectedUser), 1)
        } 
    })
})  

const STEPS_PER_FRAME = 5

function loop() {
    for (const user of USERS) {
        let p = user.position
        if(p) user.socket.emit('update', [p.x, p.y, p.z])
    }
}

setInterval(loop, 33)

function serverLoop() {
    animate()
}

setInterval(serverLoop, 16)


app.use(express.static("public"))

httpServer.listen(PORT);

export { USERS }