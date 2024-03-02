import * as THREE from './Imports/three.module.js'

const socket = io()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export class Common {
    constructor() {
        this.socket = socket
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        
    }

    static key = {}
    static mouse = {}
}