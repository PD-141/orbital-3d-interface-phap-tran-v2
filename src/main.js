import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import './style.css';

const root = document.querySelector('#app');
const modeEl = document.querySelector('#mode');
const telemetryX = document.querySelector('#telemetryX');
const telemetryY = document.querySelector('#telemetryY');
const telemetrySpeed = document.querySelector('#telemetrySpeed');
const loading = document.querySelector('#loading');
const errorEl = document.querySelector('#error');

try {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030509, 0.035);

  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 500);
  camera.position.set(0, 0.8, 18);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  const DPR = Math.min(devicePixelRatio || 1, 1.25);
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D orbital interface');
  root.prepend(renderer.domElement);

  const composer = new EffectComposer(renderer);
  // V3: keep post-processing render targets deliberately smaller to avoid Chromium OOM.
  composer.setPixelRatio(Math.min(DPR, 1.0));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(Math.max(1, Math.floor(innerWidth * 0.5)), Math.max(1, Math.floor(innerHeight * 0.5))),
    0.75,
    0.75,
    0.12
  );
  bloom.threshold = 0.12;
  bloom.strength = 0.68;
  bloom.radius = 0.65;
  composer.addPass(bloom);

  // ---- V3 performance profile ----
  // The visual language stays intact, but GPU-heavy render targets and geometry are capped.

  // ---- Lighting ----
  scene.add(new THREE.AmbientLight(0x49627d, 0.45));
  const key = new THREE.PointLight(0x7ddfff, 28, 45, 2);
  key.position.set(4, 5, 9);
  scene.add(key);
  const rim = new THREE.PointLight(0x765fff, 20, 40, 2);
  rim.position.set(-7, -3, -5);
  scene.add(rim);

  // ---- Main groups ----
  const world = new THREE.Group();
  const core = new THREE.Group();
  const rings = new THREE.Group();
  const particles = new THREE.Group();
  const shards = new THREE.Group();
  world.add(core, rings, particles, shards);
  scene.add(world);

  // ---- Materials ----
  const matCyan = new THREE.MeshBasicMaterial({
    color: 0x8aeaff,
    transparent: true,
    opacity: 0.86,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const matBlue = new THREE.MeshBasicMaterial({
    color: 0x4d8cff,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const matViolet = new THREE.MeshBasicMaterial({
    color: 0xa77bff,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const lineCyan = new THREE.LineBasicMaterial({
    color: 0x72e7ff,
    transparent: true,
    opacity: 0.46,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const lineSoft = new THREE.LineBasicMaterial({
    color: 0x9cbcff,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  // ---- Magic array / Bagua / constellation layer ----
  const magic = new THREE.Group();
  const bagua = new THREE.Group();
  const sigils = new THREE.Group();
  const constellations = new THREE.Group();
  world.add(magic);
  magic.add(bagua, sigils, constellations);

  const gold = new THREE.MeshBasicMaterial({
    color: 0xffd88a,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const goldSoft = new THREE.LineBasicMaterial({
    color: 0xffc96f,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const goldDim = new THREE.LineBasicMaterial({
    color: 0xffdca0,
    transparent: true,
    opacity: 0.13,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  function ringLine(radius, segments = 256, material = goldSoft) {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const a = i / segments * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material);
  }

  // Concentric magic circles.
  [2.05, 2.45, 2.95, 3.45, 4.0, 4.65, 5.35, 6.15, 6.75].forEach((r, i) => {
    const line = ringLine(r, 320, i === 4 ? gold : (i % 2 ? goldSoft : goldDim));
    line.rotation.z = i % 2 ? Math.PI / 12 : 0;
    bagua.add(line);
  });

  // Radial seals and tick marks.
  for (let i = 0; i < 32; i++) {
    const a = i / 32 * Math.PI * 2;
    const r1 = i % 4 === 0 ? 5.55 : 6.18;
    const r2 = i % 4 === 0 ? 6.25 : 6.31;
    const pts = [
      new THREE.Vector3(Math.cos(a) * r1, Math.sin(a) * r1, 0),
      new THREE.Vector3(Math.cos(a) * r2, Math.sin(a) * r2, 0)
    ];
    bagua.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), i % 4 === 0 ? gold : goldDim));
  }

  // Central Yin-Yang disk.
  const yinYangGroup = new THREE.Group();
  yinYangGroup.position.z = 0.08;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.18, 96), new THREE.MeshBasicMaterial({
    color: 0x17120d, transparent: true, opacity: 0.82, depthWrite: false
  }));
  yinYangGroup.add(disc);

  // Two semicircle lobes made from shapes.
  function makeLobeShape(top) {
    const sh = new THREE.Shape();
    const R = 1.18;
    if (top) {
      sh.moveTo(0, R);
      sh.absarc(0, 0, R, Math.PI / 2, -Math.PI / 2, false);
      sh.absarc(0, R / 2, R / 2, -Math.PI / 2, Math.PI / 2, false);
      sh.absarc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2, false);
    } else {
      sh.moveTo(0, -R);
      sh.absarc(0, 0, R, -Math.PI / 2, Math.PI / 2, false);
      sh.absarc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2, false);
      sh.absarc(0, R / 2, R / 2, -Math.PI / 2, Math.PI / 2, false);
    }
    return sh;
  }
  // A clean stylized taijitu using two circles and an S-curve.
  const yyTop = new THREE.Mesh(new THREE.CircleGeometry(0.59, 64, Math.PI / 2, Math.PI), gold);
  yyTop.position.y = 0.295;
  const yyBottom = new THREE.Mesh(new THREE.CircleGeometry(0.59, 64, -Math.PI / 2, Math.PI), new THREE.MeshBasicMaterial({
    color: 0x0c0907, transparent: true, opacity: 0.9, depthWrite: false
  }));
  yyBottom.position.y = -0.295;
  yinYangGroup.add(yyTop, yyBottom);
  const whiteDot = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32), new THREE.MeshBasicMaterial({color: 0x100c08, transparent:true, opacity:.9}));
  whiteDot.position.set(0, 0.59, 0.01);
  const blackDot = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32), gold);
  blackDot.position.set(0, -0.59, 0.01);
  yinYangGroup.add(whiteDot, blackDot);
  bagua.add(yinYangGroup);

  // Eight trigrams around the central taijitu.
  const trigrams = [
    [1,1,1], [0,1,1], [1,0,1], [0,0,1],
    [1,1,0], [0,1,0], [1,0,0], [0,0,0]
  ];
  function addTrigram(angle, bits) {
    const g = new THREE.Group();
    const r = 1.62;
    g.position.set(Math.cos(angle)*r, Math.sin(angle)*r, 0.09);
    g.rotation.z = angle - Math.PI / 2;
    bits.forEach((solid, row) => {
      const y = (row - 1) * 0.19;
      if (solid) {
        const pts = [new THREE.Vector3(-0.34,y,0), new THREE.Vector3(0.34,y,0)];
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gold));
      } else {
        const left = [new THREE.Vector3(-0.34,y,0), new THREE.Vector3(-0.07,y,0)];
        const right = [new THREE.Vector3(0.07,y,0), new THREE.Vector3(0.34,y,0)];
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(left), gold));
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(right), gold));
      }
    });
    bagua.add(g);
  }
  trigrams.forEach((bits, i) => addTrigram(i / 8 * Math.PI * 2 + Math.PI / 8, bits));

  // Zodiac / constellation glyphs around the outer boundary.
  const zodiac = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  function makeGlyphSprite(text, size = 64) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${size * 0.48}px "Segoe UI Symbol", "Noto Sans Symbols 2", serif`;
    ctx.fillStyle = '#ffd88a';
    ctx.shadowColor = '#ffc86d';
    ctx.shadowBlur = 10;
    ctx.fillText(text, size/2, size/2 + 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({map: tex, transparent:true, opacity:.72, depthWrite:false, blending:THREE.AdditiveBlending});
    const sprite = new THREE.Sprite(mat);
    sprite.scale.setScalar(0.62);
    return sprite;
  }
  zodiac.forEach((symbol, i) => {
    const a = i / zodiac.length * Math.PI * 2 + Math.PI / 12;
    const sprite = makeGlyphSprite(symbol);
    sprite.position.set(Math.cos(a) * 6.72, Math.sin(a) * 6.72, 0.05);
    sprite.material.rotation = a;
    sigils.add(sprite);
  });

  // Small star constellations between the glyphs, inspired by a celestial magic circle.
  const constellationSets = [
    [[-0.42,0.08],[-0.12,0.30],[0.10,0.02],[0.38,0.24],[0.55,-0.08]],
    [[-0.48,-0.16],[-0.22,0.20],[0.02,0.12],[0.28,-0.22],[0.50,0.05]],
    [[-0.42,0.18],[-0.15,-0.06],[0.12,0.24],[0.36,-0.02],[0.52,0.16]],
    [[-0.50,0.02],[-0.25,-0.20],[0.02,0.10],[0.25,0.34],[0.48,0.08]]
  ];
  for (let sector = 0; sector < 12; sector++) {
    const centerA = sector / 12 * Math.PI * 2 + Math.PI / 12;
    const pts = constellationSets[sector % constellationSets.length];
    const group = new THREE.Group();
    pts.forEach(([x,y]) => {
      const a = centerA + x * 0.16;
      const r = 7.15 + y * 0.28;
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (sector%3)*0.008, 5, 5), gold);
      star.position.set(Math.cos(a)*r, Math.sin(a)*r, 0.03);
      group.add(star);
    });
    for (let j = 0; j < group.children.length - 1; j++) {
      const a = group.children[j].position;
      const b = group.children[j+1].position;
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]), goldSoft));
    }
    constellations.add(group);
  }

  // Decorative runes / celestial marks on the outer ring.
  const runeChars = ['☉','☽','✦','✧','✶','◇','○','△','☿','♄','♃','♀','♂','☯','☷','☰'];
  runeChars.forEach((char, i) => {
    const a = i / runeChars.length * Math.PI * 2;
    const sprite = makeGlyphSprite(char, 80);
    sprite.scale.setScalar(0.38);
    sprite.position.set(Math.cos(a) * 5.95, Math.sin(a) * 5.95, 0.04);
    sigils.add(sprite);
  });



  // ---- Advanced occult / I-Ching layer ----
  // A denser inner seal, 64 hexagrams and celestial characters give the array
  // the layered look of a fantasy cultivation / magic formation.
  const advanced = new THREE.Group();
  const hexagrams = new THREE.Group();
  const celestialText = new THREE.Group();
  const geometrySeal = new THREE.Group();
  magic.add(advanced);
  advanced.add(hexagrams, celestialText, geometrySeal);

  // Regular polygon seals.
  function polygonLine(radius, sides, rotation = 0, material = goldDim) {
    const pts = [];
    for (let i = 0; i <= sides; i++) {
      const a = rotation + i / sides * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material);
  }

  geometrySeal.add(
    polygonLine(2.12, 8, Math.PI / 8, gold),
    polygonLine(2.82, 8, 0, goldDim),
    polygonLine(3.58, 16, Math.PI / 16, goldSoft),
    polygonLine(4.28, 32, 0, goldDim),
    polygonLine(5.05, 16, Math.PI / 16, goldSoft),
    polygonLine(6.45, 32, Math.PI / 32, goldDim)
  );

  // Rotating eight-spoke seal behind the Taijitu.
  const spokeMaterial = new THREE.LineBasicMaterial({
    color: 0xffdfad,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const pts = [
      new THREE.Vector3(Math.cos(a) * 1.1, Math.sin(a) * 1.1, -0.01),
      new THREE.Vector3(Math.cos(a) * 2.28, Math.sin(a) * 2.28, -0.01)
    ];
    geometrySeal.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), spokeMaterial));
  }

  function makeHexagramTexture(lines, size = 56) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = '#ffe1aa';
    ctx.shadowColor = '#ffc86d';
    ctx.shadowBlur = 5;
    ctx.lineWidth = Math.max(2, size * 0.025);
    const x1 = size * 0.18, x2 = size * 0.82;
    const gap = size * 0.075;
    const step = size * 0.105;
    for (let i = 0; i < 6; i++) {
      const y = size * 0.17 + i * step;
      if (lines[i]) {
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(size/2-gap, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(size/2+gap, y); ctx.lineTo(x2, y); ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // Binary I-Ching patterns: all 64 possible hexagrams.
  for (let n = 0; n < 64; n++) {
    const bits = Array.from({length: 6}, (_, i) => (n >> i) & 1);
    const tex = makeHexagramTexture(bits);
    const mat = new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: 0.52,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(mat);
    const a = n / 64 * Math.PI * 2 + Math.PI / 128;
    const r = 4.72;
    sprite.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.07);
    sprite.scale.setScalar(0.30);
    hexagrams.add(sprite);
  }

  // Classical/celestial character ring. These are decorative glyphs, not UI.
  const heavenly = ['乾','坤','震','巽','坎','離','艮','兌','天','地','日','月','星','辰','陰','陽','玄','靈','天','道','太','極','八','卦'];
  heavenly.forEach((char, i) => {
    const a = i / heavenly.length * Math.PI * 2;
    const sprite = makeGlyphSprite(char, 96);
    sprite.scale.setScalar(0.30);
    sprite.position.set(Math.cos(a) * 5.60, Math.sin(a) * 5.60, 0.065);
    celestialText.add(sprite);
  });

  // Outer zodiac labels + constellation points are connected into a continuous ring.
  const zodiacNames = ['BẠCH DƯƠNG','KIM NGƯU','SONG TỬ','CỰ GIẢI','SƯ TỬ','XỬ NỮ','THIÊN XỨNG','BỌ CẠP','NHÂN MÃ','MA KẾT','BẢO BÌNH','SONG NGƯ'];
  zodiac.forEach((symbol, i) => {
    const a = i / 12 * Math.PI * 2 + Math.PI / 12;
    const name = zodiacNames[i];
    const label = makeGlyphSprite(symbol, 110);
    label.scale.setScalar(0.70);
    label.position.set(Math.cos(a) * 6.72, Math.sin(a) * 6.72, 0.11);
    sigils.add(label);

    // Tiny name under each zodiac sign.
    const nameSprite = makeGlyphSprite(name, 180);
    nameSprite.scale.set(0.72, 0.17, 1);
    nameSprite.position.set(Math.cos(a) * 6.72, Math.sin(a) * 6.72 - 0.38, 0.10);
    sigils.add(nameSprite);
  });

  // Pulsing center aura rings.
  const aura = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const ring = ringLine(0.72 + i * 0.18, 160, i % 2 ? goldDim : goldSoft);
    ring.material.opacity *= 0.8;
    aura.add(ring);
  }
  aura.position.z = 0.12;
  advanced.add(aura);
  advanced.userData.aura = aura;
  advanced.userData.hexagrams = hexagrams;
  advanced.userData.celestialText = celestialText;

  // Make the magic array slightly tilted so it reads as a 3D artifact.
  magic.rotation.x = -0.08;
  magic.rotation.z = 0.03;

  // ---- Core ----
  const coreShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.55, 1),
    new THREE.MeshBasicMaterial({
      color: 0x07111c,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    })
  );
  core.add(coreShell);

  const coreInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.78, 2),
    new THREE.MeshBasicMaterial({
      color: 0xffb84d,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    })
  );
  core.add(coreInner);

  const corePoint = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 20, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffefbd,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    })
  );
  core.add(corePoint);

  // ---- Orbital rings ----
  function createOrbit(radius, tube, tiltX, tiltZ, material, segments = 96) {
    const group = new THREE.Group();
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 5, segments),
      material
    );
    group.add(torus);
    group.rotation.x = tiltX;
    group.rotation.z = tiltZ;
    return group;
  }

  const orbitConfigs = [
    [2.15, 0.012, 0.22, 0.16, lineCyan],
    [2.75, 0.008, -0.46, 0.28, lineSoft],
    [3.25, 0.014, 0.76, -0.20, matBlue],
    [3.85, 0.007, -0.22, -0.72, lineSoft],
    [4.45, 0.012, 0.46, 0.55, lineCyan],
    [5.15, 0.006, -0.78, 0.32, lineSoft],
    [5.85, 0.009, 0.12, -0.42, matViolet]
  ];

  orbitConfigs.forEach((cfg, i) => {
    const g = createOrbit(...cfg);
    g.userData.baseSpeed = (i % 2 ? -1 : 1) * (0.08 + i * 0.012);
    rings.add(g);
  });

  // Thin latitude / longitude shells
  for (let i = 0; i < 6; i++) {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(2.35 + i * 0.48, 20, 10),
      new THREE.MeshBasicMaterial({
        color: i % 2 ? 0x6da6ff : 0x73e6ff,
        wireframe: true,
        transparent: true,
        opacity: 0.035 + i * 0.004,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    shell.rotation.x = i * 0.37;
    shell.rotation.z = i * 0.21;
    rings.add(shell);
  }

  // ---- Floating orbital markers ----
  const markerGeometry = new THREE.OctahedronGeometry(0.08, 0);
  for (let i = 0; i < 42; i++) {
    const marker = new THREE.Mesh(markerGeometry, i % 4 === 0 ? matViolet : matCyan);
    const radius = 2.1 + Math.random() * 3.9;
    const angle = Math.random() * Math.PI * 2;
    marker.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 1.8,
      Math.sin(angle) * radius
    );
    marker.rotation.set(Math.random(), Math.random(), Math.random());
    marker.scale.setScalar(0.35 + Math.random() * 1.4);
    marker.userData = {
      radius,
      angle,
      speed: (Math.random() * 0.35 + 0.04) * (Math.random() > 0.5 ? 1 : -1),
      y: marker.position.y
    };
    particles.add(marker);
  }

  // ---- Star field ----
  const starCount = 850;
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const r = 20 + Math.random() * 75;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi);
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    starSizes[i] = Math.random() * 1.5 + 0.2;
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({
      color: 0x94b9e8,
      size: 0.045,
      transparent: true,
      opacity: 0.62,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  scene.add(stars);

  // ---- Technical line lattice ----
  const lattice = new THREE.Group();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const pts = [];
    for (let j = -1; j <= 1; j += 0.08) {
      const r = 4.2 + j * 0.45;
      pts.push(new THREE.Vector3(
        Math.cos(a + j * 0.8) * r,
        Math.sin(j * 2.1 + a) * 0.28,
        Math.sin(a + j * 0.8) * r
      ));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, lineSoft);
    lattice.add(line);
  }
  world.add(lattice);

  // ---- Central axis ----
  const axisMaterial = new THREE.LineBasicMaterial({
    color: 0x7deaff,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending
  });
  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-8, 0, 0),
    new THREE.Vector3(8, 0, 0)
  ]);
  const axisX = new THREE.Line(axisGeo, axisMaterial);
  const axisY = axisX.clone();
  axisY.rotation.z = Math.PI / 2;
  const axisZ = axisX.clone();
  axisZ.rotation.y = Math.PI / 2;
  world.add(axisX, axisY, axisZ);

  // ---- Interaction state ----
  let targetRotX = -0.15;
  let targetRotY = 0.35;
  let rotX = targetRotX;
  let rotY = targetRotY;
  let targetZoom = 18;
  let zoom = targetZoom;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let idleTimer = 0;
  let idle = true;
  let velocityX = 0;
  let velocityY = 0;
  const IDLE_DELAY = 1.35;

  function setInteractive(active) {
    idle = !active;
    modeEl.textContent = active ? 'MANUAL CONTROL' : 'AUTO ROTATION';
    renderer.domElement.classList.toggle('dragging', active);
  }

  function wake() {
    idleTimer = 0;
    setInteractive(true);
  }

  renderer.domElement.addEventListener('pointerdown', (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    velocityX = 0;
    velocityY = 0;
    wake();
    renderer.domElement.setPointerCapture?.(event.pointerId);
  });

  renderer.domElement.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    targetRotY += dx * 0.007;
    targetRotX += dy * 0.005;
    targetRotX = THREE.MathUtils.clamp(targetRotX, -1.35, 1.35);
    velocityX = dx * 0.0014;
    velocityY = dy * 0.0010;
    wake();
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    idleTimer = 0;
    renderer.domElement.classList.remove('dragging');
  }
  renderer.domElement.addEventListener('pointerup', endDrag);
  renderer.domElement.addEventListener('pointercancel', endDrag);
  renderer.domElement.addEventListener('lostpointercapture', endDrag);

  renderer.domElement.addEventListener('wheel', (event) => {
    event.preventDefault();
    targetZoom = THREE.MathUtils.clamp(targetZoom + event.deltaY * 0.012, 11, 28);
    wake();
  }, { passive: false });

  // Touch / pointer interaction is naturally handled by Pointer Events.
  window.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
      targetRotX = -0.15;
      targetRotY = 0.35;
      targetZoom = 18;
      wake();
    }
  });

  // ---- Animation ----
  const clock = new THREE.Clock();
  let elapsed = 0;

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    if (!dragging) {
      idleTimer += dt;

      // Momentum after release.
      targetRotY += velocityX;
      targetRotX += velocityY;
      velocityX *= Math.pow(0.035, dt);
      velocityY *= Math.pow(0.035, dt);

      if (idleTimer > IDLE_DELAY) {
        setInteractive(false);
      }
    }

    if (idle && !dragging) {
      targetRotY += dt * 0.105;
      targetRotX += Math.sin(elapsed * 0.24) * dt * 0.018;
    }

    rotX = THREE.MathUtils.damp(rotX, targetRotX, 5.5, dt);
    rotY = THREE.MathUtils.damp(rotY, targetRotY, 5.5, dt);
    zoom = THREE.MathUtils.damp(zoom, targetZoom, 5.0, dt);

    world.rotation.x = rotX;
    world.rotation.y = rotY;
    camera.position.z = zoom;
    camera.lookAt(0, 0, 0);

    coreShell.rotation.x += dt * 0.18;
    coreShell.rotation.y -= dt * 0.25;
    coreInner.rotation.x -= dt * 0.32;
    coreInner.rotation.y += dt * 0.48;
    corePoint.scale.setScalar(1 + Math.sin(elapsed * 2.8) * 0.06);

    rings.children.forEach((obj, i) => {
      if (obj.userData.baseSpeed) {
        obj.rotation.y += dt * obj.userData.baseSpeed;
        obj.rotation.x += dt * obj.userData.baseSpeed * 0.17;
      }
      if (i >= orbitConfigs.length) {
        obj.rotation.y -= dt * (0.012 + i * 0.002);
      }
    });

    particles.children.forEach((m) => {
      const d = m.userData;
      d.angle += dt * d.speed;
      m.position.x = Math.cos(d.angle) * d.radius;
      m.position.z = Math.sin(d.angle) * d.radius;
      m.position.y = d.y + Math.sin(elapsed * 0.8 + d.angle * 2) * 0.12;
      m.rotation.x += dt * 0.7;
      m.rotation.y += dt * 0.9;
    });

    magic.rotation.z += dt * 0.004;
    geometrySeal.rotation.z -= dt * 0.008;
    hexagrams.rotation.z += dt * 0.010;
    celestialText.rotation.z -= dt * 0.005;
    if (advanced.userData.aura) {
      advanced.userData.aura.rotation.z += dt * 0.02;
      const auraScale = 1 + Math.sin(elapsed * 2.2) * 0.035;
      advanced.userData.aura.scale.setScalar(auraScale);
    }
    sigils.rotation.z -= dt * 0.006;
    constellations.rotation.z += dt * 0.003;
    lattice.rotation.y -= dt * 0.018;
    stars.rotation.y += dt * 0.002;

    const pulse = 0.72 + Math.sin(elapsed * 1.7) * 0.16;
    bloom.strength = pulse;

    telemetryX.textContent = `X ${rotX >= 0 ? '+' : ''}${(rotX * 57.3).toFixed(1).padStart(5, '0')}`;
    telemetryY.textContent = `Y ${rotY >= 0 ? '+' : ''}${(rotY * 57.3).toFixed(1).padStart(5, '0')}`;
    telemetrySpeed.textContent = `ROT ${(Math.abs(velocityX) * 100 + 0.18).toFixed(2)}`;

    composer.render();
  }

  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(DPR);
    renderer.setSize(w, h);
    composer.setPixelRatio(Math.min(DPR, 1.0));
    composer.setSize(w, h);
    bloom.resolution.set(Math.max(1, Math.floor(w * 0.5)), Math.max(1, Math.floor(h * 0.5)));
  }
  addEventListener('resize', resize);

  // Small entrance animation.
  world.scale.setScalar(0.72);
  let intro = 0;
  function introTick() {
    intro += 0.018;
    const t = THREE.MathUtils.smoothstep(Math.min(intro, 1), 0, 1);
    world.scale.setScalar(0.72 + t * 0.28);
    if (intro < 1) requestAnimationFrame(introTick);
  }
  introTick();

  loading.classList.add('done');
  animate();

} catch (error) {
  console.error(error);
  loading.classList.add('done');
  errorEl.hidden = false;
  errorEl.textContent =
    'Không thể khởi tạo WebGL/Three.js. Hãy thử trình duyệt hiện đại có hỗ trợ WebGL 2.';
}
