import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

//Shaders
import VertexShader from './shaders/vertex.glsl';
import FragmentShader from './shaders/fragment.glsl';

/**
 * API
 */
const apiUrl =
  'https://api.weatherbit.io/v2.0/current?lat=52.520008&lon=13.404954&key=f0a29f8e428c452b9683e42a1736701f&include=minutely';

const getData = async () => {
  const res = await fetch(apiUrl);
  const resData = await res.json();
  const minutely = resData.minutely;
  const minutelyLatest = minutely[minutely.length - 1];

  return minutelyLatest;
};
/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader()

/**
 * Uniforms
 */
let uniforms = {
  uTime: { value: 0 },
  uFactor: { value: 1 },
};

/**
 * Object
 */
const geometry = new THREE.IcosahedronGeometry(20, 4);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: VertexShader,
  fragmentShader: FragmentShader,
  // transparent: true,
  blending: THREE.NoBlending,
});
const blob = new THREE.Mesh(geometry, material);
scene.add(blob);

//Debug
gui.add(blob.position, 'y').min(-3).max(3).step(0.01);
gui.add(uniforms.uFactor, 'value').min(-1).max(4).step(0.01);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  30,
  sizes.width / sizes.height,
  1,
  10000
);
camera.position.z = 100;

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

const dataFirst = async () => {
  const data = await getData();
  document.querySelector('.tempDisplay').innerHTML = 'Temp: ' + data.temp;
};
dataFirst();

//Update the factor every x seconds
setInterval(async () => {
  const data = await getData();
  console.log(data);
  if (data.temp > 35) {
    uniforms.uFactor.value = 5;
  } else {
    uniforms.uFactor.value = data.temp * 0.1;
  }

  document.querySelector('.tempDisplay').innerHTML = 'Temp: ' + data.temp;
}, 60 * 5000);
