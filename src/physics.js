import * as THREE from './Imports/three.module.js'

//import { GLTFLoader } from './Imports/GLTFLoader.js'

import { Octree } from './Imports/Octree.js'

import { USERS } from './index.js';

const clock = new THREE.Clock();

const GRAVITY = 30;

const STEPS_PER_FRAME = 5;

const worldOctree = new Octree();


function loadMap() {
    const geometry = new THREE.BoxGeometry( 25, 5, 25 );
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0, -5, 0)
    worldOctree.fromGraphNode(mesh)
}

loadMap()

function playerCollisions( user ) {
    const playerCollider = user.collider
    const playerVelocity = user.velocity

    const result = worldOctree.capsuleIntersect( playerCollider );

    user.onFloor = false;

    if ( result ) {

        user.onFloor = result.normal.y > 0;

        if ( ! user.onFloor ) {

            playerVelocity.addScaledVector( result.normal, - result.normal.dot( playerVelocity ) );

        }

        playerCollider.translate( result.normal.multiplyScalar( result.depth ) );

    }

}

function updatePlayer( deltaTime, user ) {
    let playerOnFloor = user.onFloor
    const playerVelocity = user.velocity
    const playerCollider = user.collider

    let damping = Math.exp( - 4 * deltaTime ) - 1;

    if ( ! playerOnFloor ) {

        playerVelocity.y -= GRAVITY * deltaTime;

        // small air resistance
        damping *= 0.1;

    }

    playerVelocity.addScaledVector( playerVelocity, damping );

    const deltaPosition = playerVelocity.clone().multiplyScalar( deltaTime );
    playerCollider.translate( deltaPosition );
 
    playerCollisions( user );

    //camera.position.copy( playerCollider.end );
    user.position = (playerCollider.end)

}

function controls( deltaTime, user ) {
    const keyStates = user.keyStates
    const playerVelocity = user.velocity
    const forwardVector = new THREE.Vector3(... user.forwardVector)
    const sideVector = new THREE.Vector3(... user.sideVector)
    let playerOnFloor = user.onFloor

    // gives a bit of air control
    const speedDelta = deltaTime * ( user.onFloor ? user.speed : user.speed / 3 );

    if ( keyStates[ 'w' ] ) {

        playerVelocity.add( forwardVector.multiplyScalar( speedDelta ) );

    }

    if ( keyStates[ 's' ] ) {

        playerVelocity.add( forwardVector.multiplyScalar( - speedDelta ) );

    }

    if ( keyStates[ 'a' ] ) {

        playerVelocity.add( sideVector.multiplyScalar( - speedDelta ) );

    }

    if ( keyStates[ 'd' ] ) {

        playerVelocity.add( sideVector.multiplyScalar( speedDelta ) );

    }

    if ( playerOnFloor ) {

        if ( keyStates[ ' ' ] ) {

            playerVelocity.y = 15;

        }

    }

}


function teleportPlayerIfOob( user ) {
    const playerCollider = user.collider
    let camera = user.camera

    if ( camera.position.y <= - 25 ) {

        playerCollider.start.set( 0, 0.35, 0 );
        playerCollider.end.set( 0, 1, 0 );
        playerCollider.radius = 0.35;
        camera.position.copy( playerCollider.end );
        camera.rotation.set( 0, 0, 0 );

    }

}

export function animate() {
    const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

    for (const user of USERS) {

        for (let i = 0; i < STEPS_PER_FRAME; i++) {

            controls( deltaTime, user );

            updatePlayer( deltaTime, user );

            //teleportPlayerIfOob(user);
            
        }
    }

}