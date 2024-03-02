import * as THREE from '../Imports/three.module.js'
import { Common } from "../entity.js";
import { FirstPersonCamera } from "../Imports/first-person-camera.js";

export class CameraHandler extends Common {
    constructor () {
        super()

        this.controls = new FirstPersonCamera().controls
        this.changed = false

        document.addEventListener('mousedown', () => {
            this.controls.lock()
        })

        this.controls.addEventListener('change', () => {
            this.changed = true
        })
    }

    getForwardVector() {
        const d = new THREE.Vector3(0, 0, 0)
    
        this.camera.getWorldDirection( d );
        d.y = 0;
        d.normalize();
    
        return [d.x, d.y, d.z];
    
    }
    
    getSideVector() {
        const d = new THREE.Vector3(0, 0, 0)
    
        this.camera.getWorldDirection( d );
        d.y = 0;
        d.normalize();
        d.cross( this.camera.up );
    
        return [d.x, d.y, d.z];
    
    }
}