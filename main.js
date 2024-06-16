// main.js

import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { LightModule } from './lightSettings.js';
import { BackgroundModule } from './backgroundModule.js';
import { initializeSidebars } from './sidebarModule.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const lightModule = new LightModule(scene);
const backgroundModule = new BackgroundModule();
let modelGroup = new THREE.Group();
let originalModel, wireframeModel, isWireframe = false, isRotating = true;
let planeZ = 0;

scene.add(modelGroup);

document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('toggleButton').addEventListener('click', toggleView);
document.getElementById('rotateButton').addEventListener('click', toggleRotation);
document.getElementById('backgroundTypeSelector').addEventListener('change', event => backgroundModule.addBackground(event.target.value));
document.getElementById('addBackgroundButton').addEventListener('click', () => {
    const backgroundType = document.getElementById('backgroundTypeSelector').value;
    backgroundModule.addBackground(backgroundType);
    adjustSidebarHeight(document.getElementById('sidebar'));
});
document.getElementById('wireframeColorPicker').addEventListener('input', changeWireframeColor);
document.getElementById('addLightButton').addEventListener('click', () => {
    lightModule.addLight();
    lightModule.updateLightHelper(lightModule.lights[lightModule.lights.length - 1]);
    adjustSidebarHeight(document.getElementById('sidebar-right'));
});

document.addEventListener('DOMContentLoaded', () => {
    initializeSidebars();
    initializeMap();
    document.addEventListener('keydown', onDocumentKeyDown);
    adjustSidebarHeight(document.getElementById('sidebar'));
    adjustSidebarHeight(document.getElementById('sidebar-right'));
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => loadModel(e.target.result);
        reader.readAsArrayBuffer(file);
    }
}

function loadModel(data) {
    const loader = new GLTFLoader();
    loader.parse(data, '', gltf => {
        if (originalModel) modelGroup.remove(originalModel);
        if (wireframeModel) modelGroup.remove(wireframeModel);

        originalModel = gltf.scene;
        modelGroup.add(originalModel);

        wireframeModel = originalModel.clone();
        wireframeModel.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true });
            }
        });

        document.getElementById('toggleButton').style.display = 'block';
        document.getElementById('rotateButton').style.display = 'block';
        document.getElementById('colorControls').style.display = 'block';
        document.getElementById('wireframeColorPicker').style.display = 'block';
        adjustSidebarHeight(document.getElementById('sidebar-right'));
    }, error => console.error('Error loading model:', error));
}

function toggleView() {
    if (isWireframe) {
        modelGroup.remove(wireframeModel);
        modelGroup.add(originalModel);
        document.getElementById('wireframeColorPicker').style.display = 'none';
    } else {
        modelGroup.remove(originalModel);
        modelGroup.add(wireframeModel);
        document.getElementById('wireframeColorPicker').style.display = 'block';
    }
    isWireframe = !isWireframe;
}

function toggleRotation() {
    isRotating = !isRotating;
}

function changeWireframeColor(event) {
    if (wireframeModel) {
        wireframeModel.traverse(child => {
            if (child.isMesh) {
                child.material.color.set(event.target.value);
            }
        });
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (isRotating) {
        modelGroup.rotation.y += 0.01;
    }

    lightModule.updateHelpers();
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustSidebarHeight(document.getElementById('sidebar'));
    adjustSidebarHeight(document.getElementById('sidebar-right'));
});

function initializeMap() {
    const map = L.map('map-container').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker([51.505, -0.09], {
        draggable: true
    }).addTo(map);

    marker.on('dragend', function(event) {
        const marker = event.target;
        const position = marker.getLatLng();
        marker.setLatLng(position, {
            draggable: 'true'
        }).bindPopup(position.toString()).openPopup();
    });

    map.on('click', function(e) {
        marker.setLatLng(e.latlng).bindPopup(e.latlng.toString()).openPopup();
    });
}

function onDocumentKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            moveModel(0, 1);
            break;
        case 'ArrowDown':
            moveModel(0, -1);
            break;
        case 'ArrowLeft':
            moveModel(-1, 0);
            break;
        case 'ArrowRight':
            moveModel(1, 0);
            break;
    }
}

function moveModel(x, y) {
    const newPosX = modelGroup.position.x + x * 0.1;
    const newPosY = modelGroup.position.y + y * 0.1;

    const minX = -window.innerWidth / 2;
    const maxX = window.innerWidth / 2;
    const minY = -window.innerHeight / 2;
    const maxY = window.innerHeight / 2;

    modelGroup.position.x = Math.max(minX, Math.min(maxX, newPosX));
    modelGroup.position.y = Math.max(minY, Math.min(maxY, newPosY));
    modelGroup.position.z = planeZ;
}
