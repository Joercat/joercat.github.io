// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the ball
const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(ball);

// Create the slope
const slopeGeometry = new THREE.BoxGeometry(5, 0.2, 50);
const slopeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const slope = new THREE.Mesh(slopeGeometry, slopeMaterial);
slope.rotation.x = -0.3; // Tilt the slope
slope.position.z = -25;
scene.add(slope);

camera.position.z = 5;
camera.position.y = 2;

// Add basic lighting
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

let speed = 0.05;
let direction = 0;

function animate() {
    requestAnimationFrame(animate);

    // Ball movement
    ball.position.z -= speed;
    ball.position.x += direction * speed;

    // Update camera position
    camera.position.z = ball.position.z + 5;

    renderer.render(scene, camera);
}

animate();

// Event listener for keyboard input
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') {
        direction = -1;
    } else if (event.code === 'ArrowRight') {
        direction = 1;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        direction = 0;
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
