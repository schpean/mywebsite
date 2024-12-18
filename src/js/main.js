import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up lighting
const light = new THREE.AmbientLight(0x404040, 10); // Increased intensity
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Load the font (ensure the path to font.json is correct)
const loader = new FontLoader();
loader.load('assets/fonts/font.json', (font) => {
    console.log('Font loaded successfully');
    
    const textGeometry = new TextGeometry('LOADING', {
        font: font,
        size: 5,
        depth: 0.5,
        curveSegments: 12,
    });

    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa500, // Orange color
        emissive: 0xffa500,
        emissiveIntensity: 0.8,
    });

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 0, 0); // Position text at the center
    scene.add(textMesh);

    // Camera position
    camera.position.set(0, 0, 30);  // Move the camera back for better view

    // Animation function
    function animate() {
        requestAnimationFrame(animate);
        console.log("Rendering frame..."); // Check if animate is running
        renderer.render(scene, camera);
    }
    animate();
    
});

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
