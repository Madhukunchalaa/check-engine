import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader }    from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader }   from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader }    from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * The build configurator.
 *
 * Every control maps to a service Check Engines actually sells — wrap colour,
 * finish, alloys, callipers, lighting. The named camera views double as a tour
 * of those services rather than leaving the visitor to spin the car aimlessly.
 */

// ---------------------------------------------------------------- options
export const WRAPS = [
  { name: 'Nardo Grey',    hex: 0x6E6E70 },
  { name: 'Gloss Black',   hex: 0x0B0B0C },
  { name: 'Pearl White',   hex: 0xE9E9E6 },
  { name: 'Engine Red',    hex: 0xE5252B },
  { name: 'Racing Green',  hex: 0x113A26 },
  { name: 'Electric Blue', hex: 0x1B4FD8 },
  { name: 'Liquid Bronze', hex: 0xB07C34 },
  { name: 'Toxic Lime',    hex: 0x9BE800 },
];

// Finish is the strongest demo in the whole page: it is the difference between
// a ceramic-coated panel and a matte wrap, which customers cannot picture.
// Metalness stays low: at 1.0 the body tints its reflections instead of showing
// its own colour, and every wrap reads as chrome. Clearcoat supplies the shine.
export const FINISHES = [
  { name: 'Gloss', note: 'Ceramic coated', props: { roughness: 0.22, clearcoat: 1.00, clearcoatRoughness: 0.04, metalness: 0.28, envMapIntensity: 1.15 } },
  { name: 'Satin', note: 'Satin PPF',      props: { roughness: 0.48, clearcoat: 0.45, clearcoatRoughness: 0.38, metalness: 0.22, envMapIntensity: 0.80 } },
  { name: 'Matte', note: 'Matte wrap',     props: { roughness: 0.82, clearcoat: 0.04, clearcoatRoughness: 0.95, metalness: 0.10, envMapIntensity: 0.45 } },
];

export const ALLOYS = [
  { name: 'Gunmetal',    hex: 0x1B1B1E },
  { name: 'Machined',    hex: 0xC9CBCE },
  { name: 'Bronze',      hex: 0xA9762F },
  { name: 'Satin Black', hex: 0x08080A },
];

export const CALIPERS = [
  { name: 'Signature Red', hex: 0xE5252B },
  { name: 'Yellow',        hex: 0xF2C200 },
  { name: 'Blue',          hex: 0x1B4FD8 },
  { name: 'Black',         hex: 0x0C0C0E },
];

// Camera framing as multiples of the car's own length, so the presets survive
// swapping in a different model later.
export const VIEWS = [
  { id: 'overview', label: 'Overview', service: 'The build',       pos: [ 0.95, 0.33, -1.15], tgt: [0,    0.09,  0    ] },
  { id: 'paint',    label: 'Paint',    service: 'Wrap & ceramic',  pos: [ 0.70, 0.25, -0.86], tgt: [0,    0.10, -0.04 ] },
  { id: 'wheels',   label: 'Wheels',   service: 'Alloys & brakes', pos: [ 0.60, 0.11, -0.50], tgt: [0.20, 0.06, -0.28 ] },
  { id: 'rear',     label: 'Rear',     service: 'Custom exhaust',  pos: [-0.34, 0.30,  1.16], tgt: [0,    0.11,  0.30 ] },
  { id: 'lights',   label: 'Lights',   service: 'Lighting retrofits', pos: [-0.66, 0.13, 0.76], tgt: [-0.14, 0.13, 0.30 ] },
];

const ease = (t) => 1 - Math.pow(1 - t, 3);

export function createConfigurator(canvasHost, opts = {}) {
  const state = {
    wrap: 0, finish: 0, alloy: 0, caliper: 0,
    view: 'overview', lightsOn: false, night: false,
  };

  // ------------------------------------------------------------ renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  const isSmall = matchMedia('(max-width: 820px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 2));
  renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // A real shadow is what stops the car looking like it is hovering.
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasHost.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08080A);
  scene.fog = new THREE.FogExp2(0x08080A, 0.055);

  const camera = new THREE.PerspectiveCamera(40, canvasHost.clientWidth / canvasHost.clientHeight, 0.1, 120);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2 - 0.035;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.34;

  // A full-bleed canvas that swallows one-finger drags traps the visitor in the
  // hero: OrbitControls sets touch-action:none, so the page can never scroll
  // past it. Hand vertical swipes back to the browser, keep the rest for orbit.
  if (matchMedia('(pointer: coarse)').matches) renderer.domElement.style.touchAction = 'pan-y';

  // ------------------------------------------------------------ ground
  // Dark, semi-polished concrete. Kept barely reflective so the HDRI shows as a
  // sheen under the car rather than turning the floor into a mirror of a sunset.
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(60, 72),
    new THREE.MeshStandardMaterial({
      color: 0x050506, roughness: 0.42, metalness: 0.35, envMapIntensity: 0.30,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Soft dark disc directly beneath the car. The shadow map handles the sharp
  // contact; this deepens the ambient occlusion the map alone cannot fake.
  const poolTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.85)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.004;
  scene.add(pool);

  // Studio rig: a cool key from above, a brand-red rim from behind, and a soft
  // white kicker on the opposite side to keep the far flank from going black.
  const key = new THREE.DirectionalLight(0xEAF2FF, 2.1);
  key.position.set(4.5, 8, -5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 26 });
  scene.add(key);

  const rimRed = new THREE.SpotLight(0xE5252B, 7, 20, Math.PI / 6, 0.7, 1.6);
  rimRed.position.set(-6.0, 4.2, 6.0);
  scene.add(rimRed);

  const kicker = new THREE.SpotLight(0xBBD4FF, 9, 24, Math.PI / 4.5, 0.6, 1.4);
  kicker.position.set(6.5, 3.4, 4.5);
  scene.add(kicker);

  scene.add(new THREE.AmbientLight(0x2A3038, 0.55));

  // Turned up only in night mode.
  const keyRed = new THREE.PointLight(0xE5252B, 0, 14, 2);
  keyRed.position.set(-3.2, 1.1, 2.4);
  scene.add(keyRed);
  const fill = key;

  // ------------------------------------------------------------ materials
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: WRAPS[0].hex, ...FINISHES[0].props,
  });
  const alloyMat   = new THREE.MeshStandardMaterial({ color: ALLOYS[0].hex, metalness: 0.95, roughness: 0.28, envMapIntensity: 0.55 });
  const caliperMat = new THREE.MeshStandardMaterial({ color: CALIPERS[0].hex, metalness: 0.35, roughness: 0.42, envMapIntensity: 0.5 });
  const hubMat     = new THREE.MeshStandardMaterial({ color: 0x141417, metalness: 0.7, roughness: 0.45, envMapIntensity: 0.4 });
  const glassMat   = new THREE.MeshPhysicalMaterial({
    color: 0x0A0A0C, metalness: 0, roughness: 0.06,
    transmission: 0.92, transparent: true, thickness: 0.04, ior: 1.45,
  });
  const trimMat    = new THREE.MeshStandardMaterial({ color: 0x0D0D0F, metalness: 0.45, roughness: 0.45 });
  // toneMapped:false keeps the lamps at full brightness — ACES otherwise crushes
  // the emissive back down and they read as dull plastic rather than lit glass.
  const headMat    = new THREE.MeshStandardMaterial({ color: 0x0A0A0C, emissive: 0xEAF2FF, emissiveIntensity: 0, toneMapped: false });
  const tailMat    = new THREE.MeshStandardMaterial({ color: 0x1A0304, emissive: 0xFF2A30, emissiveIntensity: 0, toneMapped: false });

  // ------------------------------------------------------------ env
  // The HDRI is used purely as a reflection source — dimmed hard so the scene
  // stays a dark workshop rather than the sunset the map was shot in.
  new RGBELoader().load(`${import.meta.env.BASE_URL}hdr/env.hdr`, (hdr) => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    scene.environment = pmrem.fromEquirectangular(hdr).texture;
    scene.environmentIntensity = 0.42;
    hdr.dispose(); pmrem.dispose();
  });

  // ------------------------------------------------------------ model
  const wheels = [];
  let car = null;
  let ready = false;

  const draco = new DRACOLoader().setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
  new GLTFLoader().setDRACOLoader(draco).load(`${import.meta.env.BASE_URL}models/car.glb`, (gltf) => {
    car = gltf.scene.children[0] || gltf.scene;

    const set = (name, mat) => { const o = car.getObjectByName(name); if (o) o.material = mat; };
    set('body', bodyMat);
    set('trim', trimMat);
    set('glass', glassMat);

    ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].forEach((n) => {
      const w = car.getObjectByName(n); if (w) wheels.push(w);
    });

    // Two passes. The donor model repeats node names across the four wheel
    // groups, and GLTFLoader disambiguates them as wheel_1, brake_2 and so on —
    // so match on the de-suffixed name. Recording each mesh's original material
    // name first keeps the lighting rules independent of assignment order.
    car.traverse((o) => {
      if (o.isMesh) o.userData.srcMat = o.material?.name || '';
    });

    car.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;

      const base = o.name.replace(/_\d+$/, '');   // wheel_1 -> wheel
      const src  = o.userData.srcMat;

      // "wheel" is the spoke face, "rim_*" the barrel — both are the alloy.
      // "brake" is the disc behind the spokes; "centre"/"nuts" are hub furniture.
      if (/^(wheel|rim_(fl|fr|rl|rr))$/i.test(base))      o.material = alloyMat;
      else if (/^brake$/i.test(base))                     o.material = caliperMat;
      else if (/^(centre|nuts)$/i.test(base))             o.material = hubMat;
      else if (/^(yellow_trim|blue)$/i.test(base))        o.material = trimMat;

      // Lamps, keyed off the original material so the rules above cannot
      // accidentally consume them. Note "brakes" (plural) is the brake light,
      // while "brake" (singular, inside a wheel) is the disc.
      if (/Projector_Glass|Turn_Signal_LED/i.test(src))   o.material = headMat;
      else if (/Taillight_Glass/i.test(src))              o.material = tailMat;
      else if (/Ferrari_Yellow/i.test(src))               o.material = hubMat;
    });

    // Frame everything from the model's own size.
    const box = new THREE.Box3().setFromObject(car);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    car.position.x -= centre.x;
    car.position.z -= centre.z;
    car.position.y -= box.min.y;

    const S = Math.max(size.x, size.z);
    pool.scale.set(S * 1.22, S * 0.66, 1);
    controls.minDistance = S * 0.62;
    roomDist = S * 2.6;
    controls.maxDistance = roomDist;
    scene.fog.density = 0.055 / (S / 4.5);

    scene.add(car);
    scaleViews(S);

    // Corners of the car as it now stands, so the responsive fit can measure
    // what actually has to be on screen rather than guessing at a radius.
    const world = new THREE.Box3().setFromObject(car);
    for (let i = 0; i < 8; i++) {
      corners.push(new THREE.Vector3(
        i & 1 ? world.max.x : world.min.x,
        i & 2 ? world.max.y : world.min.y,
        i & 4 ? world.max.z : world.min.z,
      ));
    }
    baseDist = new THREE.Vector3(...framed[0].pos).distanceTo(new THREE.Vector3(...framed[0].tgt));
    reframe();

    applyView('overview', true);
    ready = true;
    opts.onReady?.();
  }, undefined, (err) => opts.onError?.(err));

  // Preset offsets are multiples of the car's longest dimension.
  const framed = VIEWS.map((v) => ({ ...v, pos: [...v.pos], tgt: [...v.tgt] }));
  function scaleViews(L) {
    framed.forEach((v, i) => {
      v.pos = VIEWS[i].pos.map((n) => n * L);
      v.tgt = VIEWS[i].tgt.map((n) => n * L);
    });
  }

  // ------------------------------------------------------------ responsive frame
  // Those presets were framed for a wide desktop hero. A portrait phone keeps
  // the vertical field of view but throws away most of the horizontal one,
  // which is what cropped the car down to a door and a wheel arch. So on a
  // narrow viewport: widen the lens, push the presets back until the whole car
  // sits inside the frustum, and slide the framing into the strip the headline
  // and the dock leave free rather than the middle of the canvas.
  const WORLD_UP = new THREE.Vector3(0, 1, 0);
  const corners = [];      // car bounding box in world space, filled on load
  let baseDist = 0;        // overview preset distance before any fitting
  let roomDist = 0;        // controls.maxDistance before any fitting
  let fit = 1;             // distance multiplier applied to every preset
  let shift = 0;           // vertical nudge, as a fraction of canvas height

  const halfTan = () => Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);

  // The distance at which the whole car clears the given half-angles.
  function fitDistance(v, tanH, tanV) {
    const tgt = new THREE.Vector3(...v.tgt);
    const dir = new THREE.Vector3(...v.pos).sub(tgt).normalize();
    const right = new THREE.Vector3().crossVectors(WORLD_UP, dir).normalize();
    const up = new THREE.Vector3().crossVectors(dir, right).normalize();
    const p = new THREE.Vector3();
    let d = 0;
    corners.forEach((c) => {
      p.subVectors(c, tgt);
      const depth = p.dot(dir);
      d = Math.max(d, Math.abs(p.dot(right)) / tanH + depth, Math.abs(p.dot(up)) / tanV + depth);
    });
    return d * 1.08;       // a little air around the car
  }

  function reframe() {
    const w = canvasHost.clientWidth || 1;
    const h = canvasHost.clientHeight || 1;
    const aspect = w / h;

    camera.aspect = aspect;
    camera.fov = aspect < 0.85 ? 52 : aspect < 1.25 ? 46 : 40;
    camera.updateProjectionMatrix();

    // The band of canvas the overlays leave to the car.
    const inset = opts.safeInsets?.() || { top: 0, bottom: 0 };
    const band = Math.min(h, Math.max(h * 0.28, h - inset.top - inset.bottom));
    shift = (inset.top + band / 2 - h / 2) / h;

    if (corners.length) {
      fit = Math.max(1, fitDistance(framed[0], halfTan() * aspect, halfTan() * (band / h)) / baseDist);
      controls.maxDistance = roomDist * fit;
    }
  }

  // ------------------------------------------------------------ camera flight
  let flight = null;

  // A preset, pushed back by the responsive fit and panned into the free band.
  function placement(v) {
    const tgt = new THREE.Vector3(...v.tgt);
    const pos = new THREE.Vector3(...v.pos).sub(tgt).multiplyScalar(fit).add(tgt);
    if (shift) {
      const dir = new THREE.Vector3().subVectors(tgt, pos).normalize();
      const right = new THREE.Vector3().crossVectors(dir, WORLD_UP).normalize();
      const up = new THREE.Vector3().crossVectors(right, dir).normalize();
      up.multiplyScalar(shift * 2 * pos.distanceTo(tgt) * halfTan());
      pos.add(up); tgt.add(up);
    }
    return { pos, tgt };
  }

  function applyView(id, instant = false) {
    const v = framed.find((x) => x.id === id) || framed[0];
    state.view = id;
    const { pos: toPos, tgt: toTgt } = placement(v);
    if (instant) {
      camera.position.copy(toPos);
      controls.target.copy(toTgt);
      controls.update();
      return;
    }
    flight = {
      t: 0, dur: 1.05,
      fromPos: camera.position.clone(), toPos,
      fromTgt: controls.target.clone(), toTgt,
    };
    controls.autoRotate = false;
  }

  // ------------------------------------------------------------ setters
  const api = {
    state,
    setWrap(i)    { state.wrap = i;    bodyMat.color.setHex(WRAPS[i].hex); },
    setAlloy(i)   { state.alloy = i;   alloyMat.color.setHex(ALLOYS[i].hex); },
    setCaliper(i) { state.caliper = i; caliperMat.color.setHex(CALIPERS[i].hex); },
    setFinish(i)  {
      state.finish = i;
      Object.assign(bodyMat, FINISHES[i].props);
      bodyMat.needsUpdate = true;
    },
    setView: applyView,
    toggleLights(on) {
      state.lightsOn = on ?? !state.lightsOn;
      headMat.emissiveIntensity = state.lightsOn ? 1.6 : 0;
      tailMat.emissiveIntensity = state.lightsOn ? 1.3 : 0;
    },
    toggleNight(on) {
      state.night = on ?? !state.night;
      renderer.toneMappingExposure = state.night ? 0.62 : 0.95;
      key.intensity     = state.night ? 0.35 : 2.1;
      kicker.intensity  = state.night ? 2.0  : 9;
      rimRed.intensity  = state.night ? 18   : 7;
      keyRed.intensity  = state.night ? 12   : 0;
      scene.environmentIntensity = state.night ? 0.14 : 0.42;
      if (state.night) api.toggleLights(true);
    },
    resume() { controls.autoRotate = true; },
    // Re-measure once late-loading webfonts have settled the overlay heights.
    refresh() { onResize(); },
    summary() {
      return `${WRAPS[state.wrap].name} · ${FINISHES[state.finish].name} finish · ` +
             `${ALLOYS[state.alloy].name} alloys · ${CALIPERS[state.caliper].name} callipers`;
    },
    get isReady() { return ready; },
  };

  // ------------------------------------------------------------ loop
  const clock = new THREE.Clock();
  let idle = 0;
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();

    if (flight) {
      flight.t = Math.min(1, flight.t + dt / flight.dur);
      const k = ease(flight.t);
      camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
      controls.target.lerpVectors(flight.fromTgt, flight.toTgt, k);
      if (flight.t >= 1) { flight = null; idle = 0; }
    } else if (!controls.autoRotate) {
      // Resume the slow turn once the visitor stops interacting.
      idle += dt;
      if (idle > 3.5) controls.autoRotate = true;
    }

    wheels.forEach((w) => { w.rotation.x -= dt * 1.5; });
    controls.update();
    renderer.render(scene, camera);
  });

  controls.addEventListener('start', () => { controls.autoRotate = false; idle = 0; });

  // Phones fire resize constantly as the URL bar slides in and out, so re-frame
  // only when the framing itself actually moved — otherwise the camera would
  // snap back to the preset on every scroll.
  let resizeRaf = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      const w = canvasHost.clientWidth, h = canvasHost.clientHeight;
      renderer.setSize(w, h);
      const was = { fov: camera.fov, fit, shift };
      reframe();
      if (camera.fov !== was.fov || Math.abs(fit - was.fit) > 0.04 || Math.abs(shift - was.shift) > 0.025) {
        applyView(state.view, true);
      }
    });
  };
  addEventListener('resize', onResize);
  addEventListener('orientationchange', onResize);

  if (import.meta.env.DEV) window.__car = { scene, api, mats: { bodyMat, headMat, tailMat, alloyMat, caliperMat } };

  return api;
}
