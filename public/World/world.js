import * as THREE from '../Imports/three.module.js'
import { Octree } from '../Imports/Octree.js'
import { Capsule } from '../Imports/Capsule.js'
import { GLTFLoader } from '../Imports/GLTFLoader.js'
import { Player } from '../Entities/player.js'
import { Common } from '../entity.js'
import { cameraHandler } from '../app.js'

export class World extends Common {
    constructor() {
        super()
        this.initialized = false

        this.player = new Player()
        this.canJump = true
    }

    get Player() {
        return this.player
    }

    initialize() {
        this.initVisuals()
    }

    initVisuals() {
        this.clock = new THREE.Clock();
        this.scene.background = new THREE.Color( 0x88ccee );
        this.scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );

        const fillLight1 = new THREE.HemisphereLight( 0x8dc1de, 0x00668d, 2 );
        fillLight1.position.set( 2, 1, 1 );
        this.scene.add( fillLight1 );

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
        directionalLight.position.set( - 5, 25, - 1 );
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.left = - 30;
        directionalLight.shadow.camera.top	= 30;
        directionalLight.shadow.camera.bottom = - 30;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = - 0.00006;
        this.scene.add( directionalLight );

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        this.loadMap()
    }

    initPhysics() { 
        this.GRAVITY = 30;
        this.STEPS_PER_FRAME = 5;

        this.playerCollider = new Capsule( new THREE.Vector3( 0, this.player.radius, 0 ), new THREE.Vector3( 0, this.player.height, 0 ), this.player.radius );
        this.player.collider = this.playerCollider

        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();

        this.playerOnFloor = false;

        this.initialized = true

        this.animate()
    }

    playerCollisions() {
        const result = this.worldOctree.capsuleIntersect( this.playerCollider );
        this.playerOnFloor = false;
    
        if ( result ) {
            this.playerOnFloor = result.normal.y > 0;
    
            if ( ! this.playerOnFloor ) {
                this.playerVelocity.addScaledVector( result.normal, - result.normal.dot( this.playerVelocity ) );
            }
    
            this.playerCollider.translate( result.normal.multiplyScalar( result.depth ) );
        }
    }
    
    updatePlayer( deltaTime ) {
    
        let damping = Math.exp( - 4 * deltaTime ) - 1;
    
        if ( ! this.playerOnFloor ) {
            this.playerVelocity.y -= this.GRAVITY * deltaTime;
            // small air resistance
            damping *= 0.1;
        }
    
        this.playerVelocity.addScaledVector( this.playerVelocity, damping );
    
        const deltaPosition = this.playerVelocity.clone().multiplyScalar( deltaTime );
        this.playerCollider.translate( deltaPosition );
    
        this.playerCollisions();
    
        if(!this.player.state.includes('dead')) this.camera.position.copy( this.playerCollider.end );
    
    }
    
    controls( deltaTime ) {
        if(this.player.state.includes('dead')) return

        const forwardVector = new THREE.Vector3(...cameraHandler.getForwardVector())
        const sideVector = new THREE.Vector3(...cameraHandler.getSideVector())
        
    
        // gives a bit of air control
        const speedDelta = deltaTime * ( this.playerOnFloor ? this.player.speed : this.player.speed / 3 );
    
        if ( Common.key[ 'w' ] ) {

            if(this.Player.state && this.player.state.includes('run')) {
                this.playerVelocity.add( forwardVector.multiplyScalar( speedDelta * 2 ) );
            } else {
                this.playerVelocity.add( forwardVector.multiplyScalar( speedDelta ) );
            }
    
        }
    
        if ( Common.key[ 's' ] ) {
    
            this.playerVelocity.add( forwardVector.multiplyScalar( - speedDelta ) );
    
        }
    
        if ( Common.key[ 'a' ] ) {
    
            this.playerVelocity.add( sideVector.multiplyScalar( - speedDelta ) );
    
        }
    
        if ( Common.key[ 'd' ] ) {
    
            this.playerVelocity.add( sideVector.multiplyScalar( speedDelta ) );
    
        }
    
        if ( this.playerOnFloor && this.canJump ) {
    
            if ( Common.key[ ' ' ] ) {

                this.jumpFatigue()
    
                this.playerVelocity.y = this.player.jumpForce;
    
            }
    
        }
    
    }

    jumpFatigue() {
        this.canJump = false
        let interval = setInterval(() => {
            if(this.playerOnFloor && !Common.key['spaceStillDown']) {
                clearInterval(interval)
                setTimeout(() => {
                    this.canJump = true
                }, 50)
            }
        }, 50)
    }

    loadMap() {
        this.worldOctree = new Octree()

        const geometry = new THREE.BoxGeometry( 25, 5, 25 );
        const material = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.set(0, -5, 0)
        this.worldOctree.fromGraphNode(mesh)

        this.initPhysics()
    }

    
    teleportPlayerIfOob() {

        if ( this.camera.position.y <= - 25 ) {

            this.playerCollider.start.set( 0, 0.35, 0 );
            this.playerCollider.end.set( 0, 1, 0 );
            this.playerCollider.radius = 0.35;
            this.camera.position.copy( this.playerCollider.end );
            this.camera.rotation.set( 0, 0, 0 );

        }

    }
    

    resetPlayerPosition() {
        this.playerCollider.start.set( 0, 0.35, 0 );
        this.playerCollider.end.set( 0, 1, 0 );
        this.playerCollider.radius = 0.35;
        this.camera.position.copy( this.playerCollider.end );
        this.camera.rotation.set( 0, 0, 0 );
        this.player.resetUserdata()
    }

    animate() {
        if(!this.initialized) return

        const deltaTime = Math.min( 0.05, this.clock.getDelta() ) / this.STEPS_PER_FRAME;

        for ( let i = 0; i < this.STEPS_PER_FRAME; i ++ ) {

            this.controls( deltaTime );

            this.updatePlayer( deltaTime );

        }

        this.player.position = [this.playerCollider.start.x, this.playerCollider.start.y, this.playerCollider.start.z]
    }

}