import * as THREE from './Imports/three.module.js'
import { Common } from './entity.js';
import { InputHandler } from './Handlers/input-handler.js';
import { CameraHandler } from './Handlers/camera-handler.js';
import { Player } from './Entities/player.js';
import { World } from './World/world.js';

const common = new Common()

const socket = common.socket
const scene = common.scene
const camera = common.camera
const renderer = common.renderer


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

const geometry = new THREE.BoxGeometry( 25, 5, 25 );
const material = new THREE.MeshBasicMaterial( { color: 0xff00ff });
const mesh = new THREE.Mesh( geometry, material );
mesh.position.set(0, -5, 0)

scene.add(mesh)

let inputHandler = new InputHandler()
export let cameraHandler = new CameraHandler()

export let world = new World()
world.initialize()

let player = world.Player

function createCube(pos) {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff });
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(...pos)

    scene.add(mesh)
}

function r() {
    return Math.random() * 25 - 12.5
}

for (let i = 0; i < 10; i++) {
    createCube([r(), 3, r()])   
}

socket.on('update', pos => {
    camera.position.set(...pos)
    player.position = pos

    if(cameraHandler.changed) {
        socket.emit('camera-update', [cameraHandler.getForwardVector(), cameraHandler.getSideVector()])
    }

    
    console.table({
        'server:': pos,
        'client:': player.position 
    })

})


function gameloop() {

    player.update()

    world.animate()

    renderer.render(scene, camera);
}

setInterval(gameloop, 16)