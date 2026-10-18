import * as THREE from 'three';
import { OrbitControls } from '../vendor/three/OrbitControls.js';
import { PLYLoader } from '../vendor/three/PLYLoader.js';

const stage = document.getElementById('scene-stage');
const status = document.getElementById('scene-status');
const labelLayer = document.getElementById('scene-labels');
const config = {
  metro: { labels: [
    { at: [-10, 6.5, 8], zh: '维护设备间', en: 'Equipment room' },
    { at: [10, 5.8, 4], zh: '楼梯连接', en: 'Stair connection' },
    { at: [-6, 1.8, 0], zh: '站台空间', en: 'Platform' },
  ] },
  rail: { labels: [
    { at: [-2, 6.5, 8], zh: '候车区域', en: 'Waiting concourse' },
    { at: [12, 5.5, 2], zh: '跨层连接', en: 'Floor connection' },
    { at: [-13, 7, 6], zh: '设备区域', en: 'Facilities' },
  ] },
  airport: { labels: [
    { at: [-5, 1.8, -6], zh: '候机区域', en: 'Gate lounge' },
    { at: [11, 2.6, -1], zh: '后勤通道', en: 'Service passage' },
    { at: [11, 3.8, 8], zh: '设施区域', en: 'Facilities' },
  ] },
};

const copy = {
  zh: { loading: '正在加载三维场景…', error: '三维场景暂时无法加载，请刷新重试。场景任务说明仍可阅读。', unsupported: '当前浏览器未启用三维图形，请在支持 WebGL 2 的浏览器中查看。', canvas: '可交互三维场景。方向键旋转，+ / − 缩放，R 复位，T 俯视。', in: '放大', out: '缩小' },
  en: { loading: 'Loading the 3D space…', error: 'The 3D scene could not load. Refresh to retry; the task description remains available.', unsupported: '3D graphics are unavailable. Open this page in a browser with WebGL 2 enabled.', canvas: 'Interactive 3D space. Arrow keys orbit, + / − zoom, R resets, T shows the top view.', in: 'Zoom in', out: 'Zoom out' },
};
let language = document.documentElement.lang === 'en' ? 'en' : 'zh';
let selected = document.querySelector('[data-scenario][aria-selected="true"]').dataset.scenario;
let renderer, camera, controls, scene, object, labels = [];
let serial = 0, statusKey = 'loading', visible = true, frame = 0;
const cache = new Map();
const loader = new PLYLoader();
const buttons = [...document.querySelectorAll('.scene-controls button')];
const center = new THREE.Vector3(0, 2, 0);
let fitDistance = 45;

function setStatus(key) {
  statusKey = key;
  status.hidden = !key;
  status.textContent = key ? copy[language][key] : '';
  stage.setAttribute('aria-busy', String(key === 'loading'));
  buttons.forEach(button => { button.disabled = Boolean(key); });
}

function syncLanguage() {
  if (statusKey) status.textContent = copy[language][statusKey];
  renderer?.domElement.setAttribute('aria-label', copy[language].canvas);
  document.getElementById('scene-zoom-in').setAttribute('aria-label', copy[language].in);
  document.getElementById('scene-zoom-out').setAttribute('aria-label', copy[language].out);
  labels.forEach(({ element, data }) => { element.textContent = data[language]; });
}

function render() {
  frame = 0;
  if (!visible || !renderer) return;
  renderer.render(scene, camera);
  const width = stage.clientWidth, height = stage.clientHeight;
  labels.forEach(({ element, data }) => {
    const p = new THREE.Vector3(...data.at).project(camera);
    element.hidden = statusKey !== '' || p.z < -1 || p.z > 1 || Math.abs(p.x) > .92 || Math.abs(p.y) > .93;
    element.style.left = `${(p.x + 1) * width / 2}px`;
    element.style.top = `${(1 - p.y) * height / 2}px`;
  });
}

function requestRender() {
  if (!frame && visible) frame = requestAnimationFrame(render);
}

function reset(top = false) {
  if (!camera || !object) return;
  controls.target.copy(center);
  const direction = top ? new THREE.Vector3(0, 1, .001) : new THREE.Vector3(1.15, 1.2, selected === 'airport' ? 1.45 : -1.45).normalize();
  camera.position.copy(center).addScaledVector(direction, fitDistance);
  controls.update();
  requestRender();
}

function zoom(factor) {
  if (!camera || statusKey) return;
  const offset = camera.position.clone().sub(controls.target);
  const distance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
  camera.position.copy(controls.target).add(offset.setLength(distance));
  controls.update();
  requestRender();
}

function geometryFor(name) {
  const key = name;
  if (!cache.has(key)) {
    const url = new URL(`../models/${name}.ply`, import.meta.url);
    cache.set(key, loader.loadAsync(url.href).catch(error => { cache.delete(key); throw error; }));
  }
  return cache.get(key);
}

async function loadScene() {
  if (!renderer) return;
  const requestId = ++serial;
  setStatus('loading');
  labelLayer.replaceChildren();
  labels = [];
  try {
    const geometry = await geometryFor(selected);
    if (requestId !== serial) return;
    if (object) { scene.remove(object); object.material.dispose(); }
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, metalness: .02, flatShading: true, side: THREE.DoubleSide }));
    scene.add(object);
    labels = config[selected].labels.map(data => {
      const element = document.createElement('span');
      element.className = 'scene-label';
      element.textContent = data[language];
      labelLayer.append(element);
      return { element, data };
    });
    geometry.computeBoundingSphere();
    const sphere = geometry.boundingSphere;
    center.copy(sphere.center);
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
    fitDistance = sphere.radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2) * .92;
    controls.minDistance = sphere.radius * .28;
    controls.maxDistance = fitDistance * 2.2;
    reset();
    stage.dataset.scene = selected;
    stage.dataset.vertices = geometry.attributes.position.count;
    setStatus('');
    requestRender();
  } catch (error) {
    if (requestId !== serial) return;
    setStatus('error');
    console.error('Could not load the public scenario model.', error);
  }
}

try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0xeef3f7);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-describedby', 'scene-help');
  stage.prepend(renderer.domElement);
  scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8397, 2.4));
  const key = new THREE.DirectionalLight(0xfffaf3, 2.7);
  key.position.set(-16, 28, 18);
  scene.add(key);
  camera = new THREE.PerspectiveCamera(37, 1, .1, 350);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.maxPolarAngle = Math.PI * .495;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.addEventListener('change', requestRender);
  new ResizeObserver(() => {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (object) {
      const fov = Math.min(THREE.MathUtils.degToRad(camera.fov), 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect));
      fitDistance = object.geometry.boundingSphere.radius / Math.sin(fov / 2) * .92;
      controls.maxDistance = fitDistance * 2.2;
    }
    requestRender();
  }).observe(stage);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) requestRender();
  }, { rootMargin: '100px' }).observe(stage);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    setStatus('unsupported');
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => { setStatus(''); requestRender(); });
  renderer.domElement.addEventListener('keydown', event => {
    if (statusKey) return;
    const key = event.key.toLowerCase();
    if (!['arrowleft', 'arrowright', 'arrowup', 'arrowdown', '+', '=', '-', 'r', 't'].includes(key)) return;
    event.preventDefault();
    if (key === 'r') reset();
    else if (key === 't') reset(true);
    else if (key === '+' || key === '=') zoom(.85);
    else if (key === '-') zoom(1.18);
    else {
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (key === 'arrowleft') spherical.theta -= .12;
      if (key === 'arrowright') spherical.theta += .12;
      if (key === 'arrowup') spherical.phi -= .1;
      if (key === 'arrowdown') spherical.phi += .1;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, .05, controls.maxPolarAngle);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update();
      requestRender();
    }
  });
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight, false);
  syncLanguage();
  loadScene();
} catch (error) {
  renderer = undefined;
  setStatus('unsupported');
  console.warn('3D graphics unavailable.', error);
}

window.addEventListener('proposal:scenario', ({ detail }) => {
  language = detail.language;
  syncLanguage();
  if (selected !== detail.scenario) {
    selected = detail.scenario;
    loadScene();
  }
});
document.getElementById('scene-reset').addEventListener('click', () => reset());
document.getElementById('scene-top').addEventListener('click', () => reset(true));
document.getElementById('scene-zoom-in').addEventListener('click', () => zoom(.8));
document.getElementById('scene-zoom-out').addEventListener('click', () => zoom(1.25));
