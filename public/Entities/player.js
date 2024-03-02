import * as THREE from '../Imports/three.module.js'
import { Common } from "../entity.js";

export class Player extends Common {
    constructor() {
        super()

        this.collider = null
        this.position = []
        this.yRotation = 0
        this.state = 'idle'
        this.speed = 9
        this.jumpForce = 9
    }

    updateState() {
        if (this.state.includes('dead')) return;
    
        if (Common.key['w']) {
            this.state = this.crouching ? 'walk' : 'run';
        } else if (Common.key['a'] || Common.key['d'] || Common.key['s']) {
            this.state = 'walk';
        } else {
            this.state = 'idle';
        }
    
        if (this.crouching) {
            this.state += '.crouch';
        }
    
        if (Common.mouse[2] || Common.key['c']) {
            this.state += '.ADS';
        }
    }

    update() {
        this.updateState()

        if(this.state.includes('dead')) return;
        const cameraDirection = new THREE.Vector3()
        this.camera.getWorldDirection(cameraDirection).normalize()

        this.yRotation = Math.atan2(cameraDirection.x, cameraDirection.z)
 
    }
}