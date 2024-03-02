import { Common } from "../entity.js";



export class InputHandler extends Common {
    constructor() {
        super()

        document.addEventListener('keydown', (event) => {
            if (!Common.key[event.key]) {
                Common.key[event.key] = true;
                this.sendKeyStateUpdate(event.key, true);
            }
        });
        
        document.addEventListener('keyup', (event) => {
            if (Common.key[event.key]) {
                Common.key[event.key] = false;
                this.sendKeyStateUpdate(event.key, false);
            }
        });

        document.addEventListener('mousedown', (event) => {
            if (!Common.mouse[event.button]) {
                Common.mouse[event.button] = true
            }
        })

        document.addEventListener('mouseup', (event) => {
            if (Common.mouse[event.button]) {
                Common.mouse[event.button] = false
            }
        })

        window.addEventListener('resize', () => {
            this.onWindowResize()
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    sendKeyStateUpdate(key, state) {
        this.socket.emit('keys-update', { key, state });
    }
}