import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class LoadingScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.progress = 0;
    this.thumbnails = [];
    this.activeThumbIndex = -1;

    this.init();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new THREE.Color('#1a237e'));
    this.container.appendChild(this.renderer.domElement);

    // Setup camera
    this.camera.position.z = 5;

    // Setup post-processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    this.composer.addPass(bloomPass);

    // Create loading bar
    this.createLoadingBar();
    
    // Create background geometry
    this.createBackgroundGeometry();
    
    // Create thumbnails
    this.createThumbnails();

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add point light for glow effects
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 10);
    this.scene.add(pointLight);

    // Start animation loop
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  createLoadingBar() {
    const barGeometry = new THREE.PlaneGeometry(3, 0.1);
    const barMaterial = new THREE.ShaderMaterial({
      uniforms: {
        progress: { value: 0 },
        glowColor: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float progress;
        uniform vec3 glowColor;
        varying vec2 vUv;
        void main() {
          float alpha = vUv.x < progress ? 1.0 : 0.2;
          gl_FragColor = vec4(glowColor, alpha);
        }
      `,
      transparent: true
    });

    this.loadingBar = new THREE.Mesh(barGeometry, barMaterial);
    this.loadingBar.position.y = 1;
    this.scene.add(this.loadingBar);
  }

  createBackgroundGeometry() {
    const shape = new THREE.Shape();
    // Define the geometric shape visible in the background
    shape.moveTo(-2, -2);
    shape.lineTo(2, -2);
    shape.lineTo(2, 2);
    shape.lineTo(-2, 2);
    shape.lineTo(-2, -2);

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.LineBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.2
    });

    const lines = new THREE.Line(geometry, material);
    lines.position.z = -2;
    this.scene.add(lines);
  }

  createThumbnails() {
    const thumbnailSize = 0.4;
    const spacing = 0.8;
    const totalWidth = spacing * 7;
    const startX = -totalWidth / 2;

    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.PlaneGeometry(thumbnailSize, thumbnailSize);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
      });

      const thumbnail = new THREE.Mesh(geometry, material);
      thumbnail.position.x = startX + (i * spacing);
      thumbnail.position.y = -1;
      
      this.thumbnails.push(thumbnail);
      this.scene.add(thumbnail);
    }

    // Create connecting line
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(startX, -1, 0),
      new THREE.Vector3(-startX, -1, 0)
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    this.scene.add(line);
  }

  updateProgress(value) {
    this.progress = Math.min(Math.max(value, 0), 1);
    this.loadingBar.material.uniforms.progress.value = this.progress;
    
    // Update thumbnails
    const newActiveIndex = Math.floor(this.progress * 8);
    if (newActiveIndex !== this.activeThumbIndex) {
      this.activeThumbIndex = newActiveIndex;
      this.thumbnails.forEach((thumbnail, index) => {
        thumbnail.material.opacity = index <= this.activeThumbIndex ? 1 : 0.3;
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.composer.render();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Usage:
const container = document.getElementById('loading-container');
const loadingScene = new LoadingScene(container);

// Update progress (0-1) as your assets load
let progress = 0;
const loadInterval = setInterval(() => {
  progress += 0.01;
  loadingScene.updateProgress(progress);
  if (progress >= 1) clearInterval(loadInterval);
}, 50);