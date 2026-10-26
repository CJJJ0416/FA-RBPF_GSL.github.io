import * as THREE from 'three';
import { OrbitControls } from '../vendor/three/OrbitControls.js';

// All examples share this player. Only the selected building and route are fetched.
const $ = id => document.getElementById(`nav-${id}`);
const root = document.getElementById('navigation-demo');
const base = new URL('../navigation/', import.meta.url);
const families = {ring_atrium:'Ring atrium',l_wing:'L-shaped wings',t_branch:'T-shaped branches',u_courtyard:'U-shaped courtyard',linked_wings:'Linked wings'};
let language = document.documentElement.lang === 'en' ? 'en' : 'zh';
const en = () => language === 'en';
const text = (zh, english) => en() ? english : zh;
let manifest, model, currentRoute, currentExample, currentCloud, buildings;
let renderer, world, camera, controls, sceneGroup, routeGroup, pointCloud, reference, trail, cameraMarker, lidarMarker, depthCone, rgbCone, endMarkers;
let radius = 20, ready = false, initialized = false, initializing = false, busy = false, visible = false;
let serial = 0, controller, statusKey = 'waiting', errorText = '';
let trailHead = -1;
let time = 0, playing = false, lastWall = 0, sampleIndex = -1, drawId = 0, dirty = true, lastRendered = 0;
const routeCache = new Map();
const color = new THREE.Color();
const project = new THREE.Vector3();
const currentPose = [0,0,0,0];

function status(key, error='') {
  statusKey = key; errorText = error;
  $('status').hidden = key === 'ready';
  $('status').textContent = key === 'waiting' ? text('滚动到此处后加载交互回放…','The replay loads when this section comes into view…') : key === 'loading' ? text('正在读取地图和路线缓存…','Loading building and route caches…') : error;
}
function setBusy(value) {
  busy = value;
  document.getElementById('navigation-player').setAttribute('aria-busy', String(value));
  for(const name of ['play','restart','seek','reset','top']) $(name).disabled = value || !ready;
  for(const name of ['map','shuffle-map','route','shuffle-route']) $(name).disabled = value || !manifest;
}
function playLabel() { $('play').textContent = playing ? text('Ⅱ 暂停','Ⅱ Pause') : text('▶ 播放','▶ Play'); }
function pause() { playing = false; playLabel(); }
function formatTime(value) { const seconds=Math.floor(value);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`; }
function refreshLabels() {
  if(manifest) for(const [i, e] of manifest.examples.entries()) $('map').options[i].textContent = `${en()?families[e.family]||e.family:e.label} · ${e.floors}F · seed ${e.seed}`;
  if(model) {
    for(const [i,r] of model.routes.entries()) $('route').options[i].textContent=r.labels[en()?1:0];
    $('summary').textContent=text(`${model.floors} 层 · ${model.rooms} 个房间 · ${model.stairs} 段楼梯 · ${model.routes.length} 条路线`,`${model.floors} floors · ${model.rooms} rooms · ${model.stairs} stair flight${model.stairs===1?'':'s'} · ${model.routes.length} routes`)+(currentRoute?` · ${currentRoute.length_m.toFixed(1)} m`:'');
  }
  status(statusKey,errorText); playLabel();
  if(ready) showSample(sampleIndex, true);
}
window.addEventListener('proposal:scenario', event=>{ language=event.detail.language;refreshLabels(); });

async function fetchAsset(relative, type, signal) {
  const response=await fetch(new URL(relative,base),{signal});
  if(!response.ok) throw new Error(text(`缓存读取失败（${response.status}），请重试。`,`Cache request failed (${response.status}). Please retry.`));
  return type==='json'?response.json():response.arrayBuffer();
}
async function readRoute(example, info, signal) {
  const key=`${example.seed}/${info.id}`;
  if(routeCache.has(key)) { const cached=routeCache.get(key);routeCache.delete(key);routeCache.set(key,cached);return cached; }
  const data=await fetchAsset(`${example.seed}/${info.file}`,'json',signal);
  if(data.seed!==example.seed||data.id!==info.id||data.frames.length<2) throw new Error('Invalid route cache');
  const cloud=await fetchAsset(`${example.seed}/${data.clouds.file}`,'binary',signal);
  if(cloud.byteLength%data.clouds.stride_bytes) throw new Error('Invalid point-cloud cache');
  for(const frame of data.frames) if((frame.lidar.offset+frame.lidar.count)*8>cloud.byteLength) throw new Error('Incomplete point-cloud cache');
  return {key,data,cloud};
}
function rememberRoute(route) {
  routeCache.set(route.key,route);
  while(routeCache.size>2) routeCache.delete(routeCache.keys().next().value);
}
function dispose(group) {
  if(!group) return;
  group.traverse(object=>{object.geometry?.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(m=>m?.dispose());});
  group.removeFromParent();
}
function makeBuilding(info, binary) {
  if(binary.byteLength!==info.mesh.vertices*15||info.mesh.positions_bytes!==info.mesh.vertices*12) throw new Error('Invalid building cache');
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(binary,0,info.mesh.vertices*3),3));
  const raw=new Uint8Array(binary,info.mesh.positions_bytes),linear=new Float32Array(raw.length);
  for(let i=0;i<raw.length;i+=3){color.setRGB(raw[i]/255,raw[i+1]/255,raw[i+2]/255,THREE.SRGBColorSpace);color.toArray(linear,i);}
  geometry.setAttribute('color',new THREE.BufferAttribute(linear,3));geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:+$('opacity').value,depthWrite:false,roughness:.85});
  const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=0;return mesh;
}
function newLine(points, lineColor, opacity=1) {
  const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]+.055)));
  const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:lineColor,transparent:opacity<1,opacity}));line.renderOrder=2;return line;
}
function addMarker(position, markerColor, size=.12) {
  const object=new THREE.Mesh(new THREE.SphereGeometry(size,14,10),new THREE.MeshBasicMaterial({color:markerColor}));object.position.set(position[0],position[1],position[2]+.13);routeGroup.add(object);return object;
}
function makeCone(coneColor) {
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(48*3),3));
  const cone=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:coneColor}));cone.frustumCulled=false;routeGroup.add(cone);return cone;
}
function setCone(cone,pose,stream) {
  const cfg=currentRoute.camera,pitch=cfg.pitch_deg*Math.PI/180,yaw=pose[3],length=cfg.frustum_display_length_m;
  const f=[Math.cos(pitch)*Math.cos(yaw),Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch)];
  const r=[Math.sin(yaw),-Math.cos(yaw),0],u=[-Math.sin(pitch)*Math.cos(yaw),-Math.sin(pitch)*Math.sin(yaw),Math.cos(pitch)];
  const origin=[pose[0],pose[1],pose[2]+cfg.height_above_reference_m],a=length*Math.tan(stream.horizontal_fov_deg*Math.PI/360),b=length*Math.tan(stream.vertical_fov_deg*Math.PI/360);
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>origin.map((v,i)=>v+length*f[i]+x*a*r[i]+y*b*u[i]));
  const values=[];for(let i=0;i<4;i++)values.push(...origin,...corners[i],...corners[i],...corners[(i+1)%4]);
  cone.geometry.attributes.position.array.set(values);cone.geometry.setDrawRange(0,values.length/3);cone.geometry.attributes.position.needsUpdate=true;
}
function installRoute(loaded) {
  dispose(routeGroup);routeGroup=new THREE.Group();world.add(routeGroup);
  currentRoute=loaded.data;currentCloud=new DataView(loaded.cloud);rememberRoute(loaded);
  time=0;sampleIndex=-1;trailHead=-1;pause();
  const path=currentRoute.path;
  reference=newLine(path,0x438ac0,.7);routeGroup.add(reference);
  const values=new Float32Array((path.length+1)*3);for(let i=0;i<path.length;i++)values.set([path[i][0],path[i][1],path[i][2]+.075],i*3);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(values,3));g.setDrawRange(0,1);
  trail=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xe87745}));trail.renderOrder=3;trail.frustumCulled=false;routeGroup.add(trail);
  endMarkers=[addMarker(path[0],0x138666),addMarker(path.at(-1),0xc74f4d)];
  cameraMarker=addMarker(path[0],0x14a0b7,.105);lidarMarker=addMarker(path[0],0x9576b8,.07);
  depthCone=makeCone(0x11a6ad);rgbCone=makeCone(0xdba853);
  const cloudGeometry=new THREE.BufferGeometry();cloudGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(manifest.display_point_cap*3),3));cloudGeometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(manifest.display_point_cap*3),3));
  pointCloud=new THREE.Points(cloudGeometry,new THREE.PointsMaterial({size:.065,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.9}));pointCloud.frustumCulled=false;routeGroup.add(pointCloud);
  $('seek').max=currentRoute.duration_s;$('seek').value=0;ready=true;showTime();refreshLabels();dirty=true;
}
async function chooseExample(index) {
  const ticket=++serial;controller?.abort();controller=new AbortController();pause();setBusy(true);status('loading');
  const example=manifest.examples[index];let mesh;
  try {
    const [info,binary]=await Promise.all([fetchAsset(`${example.seed}/scene.json`,'json',controller.signal),fetchAsset(`${example.seed}/building.bin`,'binary',controller.signal)]);
    if(info.seed!==example.seed) throw new Error('Building seed mismatch');
    const first=info.routes.find(r=>r.id==='random_crossfloor')||info.routes[0];
    const loaded=await readRoute(example,first,controller.signal);
    if(ticket!==serial) return;
    mesh=makeBuilding(info,binary);dispose(buildings);buildings=mesh;sceneGroup.add(mesh);model=info;currentExample=example;
    $('map').value=index;$('route').replaceChildren(...model.routes.map(r=>new Option(r.labels[en()?1:0],r.id)));$('route').value=first.id;
    installRoute(loaded);fitView();status('ready');
  } catch(error) {
    if(ticket!==serial||error.name==='AbortError') return;
    if(mesh&&mesh!==buildings)dispose(mesh);
    if(currentExample)$('map').value=manifest.examples.indexOf(currentExample);
    status('error',text('地图未能载入，请切换示例重试。','Could not load this building. Choose an example to retry.'));console.error(error);
  } finally { if(ticket===serial)setBusy(false); }
}
async function chooseRoute(id) {
  if(!model)return;
  const ticket=++serial;controller?.abort();controller=new AbortController();pause();setBusy(true);status('loading');
  try {
    const selected=model.routes.find(r=>r.id===id);if(!selected)throw new Error('Unknown route');
    const loaded=await readRoute(currentExample,selected,controller.signal);if(ticket!==serial)return;
    installRoute(loaded);$('route').value=id;status('ready');
  }catch(error){if(ticket!==serial||error.name==='AbortError')return;$('route').value=currentRoute?.id;status('error',text('路线未能载入，请选择另一条重试。','Could not load this route. Select another to retry.'));console.error(error);}
  finally{if(ticket===serial)setBusy(false);}
}
function fitView(top=false) {
  if(!model)return;
  const [lo,hi]=model.bounds,center=new THREE.Vector3(...lo.map((v,i)=>(v+hi[i])/2));
  radius=Math.max(hi[0]-lo[0],hi[1]-lo[1],(hi[2]-lo[2])*1.6)*.78;
  controls.target.copy(center);camera.position.copy(center).add(top?new THREE.Vector3(0,-.01,radius*1.75):new THREE.Vector3(radius,-radius,radius*.9));
  camera.near=.05;camera.far=radius*30;camera.updateProjectionMatrix();controls.update();$('follow').checked=false;dirty=true;
}
function sampledIndex(t) {
  const frames=currentRoute.frames;let lo=0,hi=frames.length-1;
  while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].t<=t)lo=mid;else hi=mid-1;}return lo;
}
function showSample(index,force=false) {
  if(!currentRoute||index<0)return;
  if(index===sampleIndex&&!force)return;sampleIndex=index;
  const frame=currentRoute.frames[index],scan=frame.lidar;
  $('rgb').src=frame.rgb;$('depth').src=frame.depth;$('lidar').src=$('lidar-view').value==='panorama'?scan.panorama:scan.perspective;
  $('lidar').style.aspectRatio=$('lidar-view').value==='panorama'?'360/61':'16/9';
  const points=pointCloud.geometry.attributes.position,colors=pointCloud.geometry.attributes.color;
  for(let i=0;i<scan.count;i++){
    const offset=(scan.offset+i)*8;
    points.setXYZ(i,currentCloud.getInt16(offset,true)*currentRoute.clouds.scale_m,currentCloud.getInt16(offset+2,true)*currentRoute.clouds.scale_m,currentCloud.getInt16(offset+4,true)*currentRoute.clouds.scale_m);
    const distance=currentCloud.getInt16(offset+6,true)*.001,cfg=model.lidar_config;
    const lut=manifest.lidar_colors_rgb[Math.max(0,Math.min(255,Math.floor((distance-cfg.near_m)/(cfg.far_m-cfg.near_m)*255)))];
    color.setRGB(lut[0]/255,lut[1]/255,lut[2]/255,THREE.SRGBColorSpace);colors.setXYZ(i,color.r,color.g,color.b);
  }
  points.needsUpdate=colors.needsUpdate=true;pointCloud.geometry.setDrawRange(0,scan.count);pointCloud.visible=$('points').checked;
  // Sensor markers and frusta use the exact cached pose, including when seeking.
  cameraMarker.position.set(frame.pose[0],frame.pose[1],frame.pose[2]+currentRoute.camera.height_above_reference_m);lidarMarker.position.set(...scan.origin);
  setCone(depthCone,frame.pose,currentRoute.camera.depth);setCone(rgbCone,frame.pose,currentRoute.camera.rgb);
  const floor=model.floor_heights.reduce((best,z,i)=>Math.abs(z-frame.pose[2])<Math.abs(model.floor_heights[best]-frame.pose[2])?i:best,0)+1;
  $('floor').textContent=`${floor}F`;$('hits').textContent=`${scan.hit_count.toLocaleString()} / ${scan.ray_count.toLocaleString()}`;
  $('sampling').textContent=`${currentRoute.sensor_fps.toFixed(2)} fps · ${index+1}/${currentRoute.frames.length}`;
  dirty=true;
}
function showTime() {
  if(!ready)return;
  const path=currentRoute.path,distance=Math.min(currentRoute.length_m,time/currentRoute.duration_s*currentRoute.length_m);
  let lo=0,hi=path.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(path[mid][4]<=distance)lo=mid;else hi=mid-1;}
  const next=Math.min(lo+1,path.length-1),a=path[lo],b=path[next],fraction=Math.max(0,Math.min(1,(distance-a[4])/Math.max(1e-8,b[4]-a[4])));
  for(let i=0;i<3;i++)currentPose[i]=a[i]+fraction*(b[i]-a[i]);
  currentPose[3]=a[3]+Math.atan2(Math.sin(b[3]-a[3]),Math.cos(b[3]-a[3]))*fraction;
  // Extend the trail to the continuous interpolated position without changing the native reference.
  const array=trail.geometry.attributes.position.array;
  if(trailHead>=0&&trailHead<path.length){const original=path[trailHead];array.set([original[0],original[1],original[2]+.075],trailHead*3);}
  array.set([a[0],a[1],a[2]+.075],lo*3);array.set([currentPose[0],currentPose[1],currentPose[2]+.075],(lo+1)*3);trailHead=lo+1;trail.geometry.attributes.position.needsUpdate=true;trail.geometry.setDrawRange(0,lo+2);
  $('position').textContent=currentPose.slice(0,3).map(v=>v.toFixed(2)).join(', ');
  $('clock').textContent=`${formatTime(time)} / ${formatTime(currentRoute.duration_s)}`;$('seek').value=time;
  showSample(sampledIndex(time));
  if($('follow').checked){const goal=new THREE.Vector3(...currentPose.slice(0,3));camera.position.add(goal.clone().sub(controls.target));controls.target.copy(goal);}
  dirty=true;
}
function projectLabels() {
  if(!endMarkers)return;
  for(let i=0;i<2;i++){
    project.copy(endMarkers[i].position).project(camera);const node=$(i?'goal-label':'start-label');node.hidden=project.z>1||project.z< -1;
    node.style.left=`${(project.x+1)*.5*$('stage').clientWidth}px`;node.style.top=`${(1-project.y)*.5*$('stage').clientHeight}px`;
  }
}
function tick(now) {
  drawId=0;if(!visible||document.hidden)return;
  if(lastWall&&playing){time=Math.min(currentRoute.duration_s,time+(now-lastWall)/1000*+$('speed').value);showTime();if(time>=currentRoute.duration_s)pause();}lastWall=now;
  controls?.update();
  if(renderer&&dirty&&now-lastRendered>=1000/30){renderer.render(world,camera);projectLabels();lastRendered=now;dirty=false;}
  drawId=requestAnimationFrame(tick);
}
function startLoop(){lastWall=0;if(!drawId&&visible&&!document.hidden)drawId=requestAnimationFrame(tick);}
function stopLoop(){if(drawId)cancelAnimationFrame(drawId);drawId=0;lastWall=0;}
function initializeGraphics() {
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf0f5f8);renderer.outputColorSpace=THREE.SRGBColorSpace;
  $('stage').prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  world=new THREE.Scene();camera=new THREE.PerspectiveCamera(43,1,.05,1000);camera.up.set(0,0,1);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.1;controls.screenSpacePanning=true;controls.addEventListener('change',()=>{dirty=true;});
  world.add(new THREE.HemisphereLight(0xffffff,0xa2b1bd,2.3));const light=new THREE.DirectionalLight(0xffffff,2.2);light.position.set(-10,-10,30);world.add(light);
  sceneGroup=new THREE.Group();world.add(sceneGroup);
  const grid=new THREE.GridHelper(100,50,0xc0d0dc,0xdbe5ec);grid.rotation.x=Math.PI/2;grid.position.z=-.5;world.add(grid);
  const resize=()=>{const width=$('stage').clientWidth,height=$('stage').clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;};new ResizeObserver(resize).observe($('stage'));resize();
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();pause();ready=false;setBusy(false);status('error',text('三维绘图已中断，请刷新此页恢复。','3D graphics were interrupted. Reload this page to restore the viewer.'));});
  startLoop();
}
async function initialize() {
  if(initialized||initializing)return;initializing=true;setBusy(true);status('loading');
  try {
    manifest=await fetchAsset('manifest.json','json');if(!manifest.examples?.length)throw new Error('No cached examples');
    initializeGraphics();$('map').replaceChildren(...manifest.examples.map((e,i)=>new Option(e.label,String(i))));refreshLabels();initialized=true;await chooseExample(0);
  }catch(error){status('error',text('无法加载交互回放，请刷新重试；三维视图需要 WebGL 2。','Could not load the replay. Reload to retry; 3D requires WebGL 2.'));console.error(error);setBusy(false);}
  finally{initializing=false;}
}
$('map').onchange=()=>void chooseExample(+$('map').value);
$('route').onchange=()=>void chooseRoute($('route').value);
function another(length,current){return length<2?current:(current+1+Math.floor(Math.random()*(length-1)))%length;}
$('shuffle-map').onclick=()=>void chooseExample(another(manifest.examples.length,+$('map').value));
$('shuffle-route').onclick=()=>{const i=model.routes.findIndex(r=>r.id===$('route').value);void chooseRoute(model.routes[another(model.routes.length,i)].id);};
$('play').onclick=()=>{if(playing)pause();else{if(time>=currentRoute.duration_s){time=0;showTime();}playing=true;lastWall=0;playLabel();startLoop();}};
$('restart').onclick=()=>{pause();time=0;sampleIndex=-1;showTime();};
$('seek').oninput=()=>{pause();time=+$('seek').value;showTime();};
$('reset').onclick=()=>fitView();$('top').onclick=()=>fitView(true);
$('opacity').oninput=()=>{if(buildings)buildings.material.opacity=+$('opacity').value;dirty=true;};
$('points').onchange=()=>{if(pointCloud)pointCloud.visible=$('points').checked;dirty=true;};
$('lidar-view').onchange=()=>showSample(sampleIndex,true);
$('stage').addEventListener('keydown',event=>{if(event.key.toLowerCase()==='r'){event.preventDefault();fitView();}if(event.key.toLowerCase()==='t'){event.preventDefault();fitView(true);}});
const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){void initialize();startLoop();}else stopLoop();},{rootMargin:'150px'});visibility.observe(root);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopLoop();else startLoop();});
refreshLabels();
