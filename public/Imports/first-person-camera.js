import { Common } from "../entity.js"
import { PointerLockControls } from "./PointerLockControls.js"

export class FirstPersonCamera extends Common {
    constructor() {
        super()
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement)
        this.controls.pointerSpeed = 0.5
    }
}