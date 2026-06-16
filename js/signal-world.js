(function () {
  const canvas = document.getElementById('signalWorld');
  const wrap = document.querySelector('[data-signal-world]');
  if (!canvas || !wrap) return;

  const hasThree = typeof window.THREE !== 'undefined';
  const panel = {
    kicker: document.querySelector('[data-world-kicker]'),
    title: document.querySelector('[data-world-title]'),
    desc: document.querySelector('[data-world-desc]'),
    link: document.querySelector('[data-world-link]')
  };

  const lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
  const copy = lang === 'fr'
    ? {
        signalTag: 'Signal du jour',
        readBrief: 'Lire le brief',
        openPage: 'Ouvrir la page',
        source: 'Source',
        fallbackTitle: 'Le brief du matin, trié et vérifié.',
        fallbackDesc: 'La lecture du jour arrive ici quand le brief est publié.',
        introDesc: 'Approche les lieux pour explorer l’écosystème The Cryptomath.',
        pages: [
          ['NEWSLETTER', 'La newsletter', 'Antenne de diffusion des analyses quotidiennes.', '/fr/newsletter/', 'antenna'],
          ['SCORE', 'Score', 'Radar des signaux crypto.', '/fr/score/', 'radar'],
          ['BUILD', 'Build', 'Atelier des projets et expérimentations en cours.', '/fr/build/', 'workshop'],
          ['FRAMEWORK', 'Narrative Framework', 'Observatoire des narratifs avant le marché.', '/fr/narrative-framework/', 'observatory'],
          ['RESSOURCES', 'Ressources', 'Coffre et terminal de la stack crypto sélectionnée.', '/fr/resources/', 'terminal'],
          ['CONNECT', 'Contact', 'Station radio pour suivre ou contacter The Cryptomath.', '/fr/contact/', 'radio']
        ]
      }
    : {
        signalTag: 'Daily signal',
        readBrief: 'Read the brief',
        openPage: 'Open page',
        source: 'Source',
        fallbackTitle: 'The morning brief, filtered and verified.',
        fallbackDesc: 'Today’s market read appears here when the brief is live.',
        introDesc: 'Move close to the landmarks to explore The Cryptomath ecosystem.',
        pages: [
          ['NEWSLETTER', 'Newsletter', 'The broadcast antenna for daily market reads.', '/newsletter', 'antenna'],
          ['SCORE', 'Score', 'The radar for crypto signals.', '/score/', 'radar'],
          ['BUILD', 'Build', 'The workshop for current projects and experiments.', '/build', 'workshop'],
          ['FRAMEWORK', 'Narrative Framework', 'The observatory for market narratives.', '/narrative-framework', 'observatory'],
          ['RESOURCES', 'Resources', 'The vault and terminal for the curated crypto stack.', '/resources', 'terminal'],
          ['CONNECT', 'Connect', 'The radio station to follow or contact The Cryptomath.', '/connect', 'radio']
        ]
      };

  function updatePanel(data, isSignal) {
    if (!panel.kicker || !panel.title || !panel.desc || !panel.link || !data) return;
    panel.kicker.textContent = isSignal ? copy.signalTag : data.tag;
    panel.title.textContent = data.title || copy.fallbackTitle;
    const source = data.src ? copy.source + '. ' + data.src : '';
    panel.desc.textContent = data.desc || source || copy.introDesc;
    panel.link.textContent = isSignal ? copy.readBrief : copy.openPage;
    panel.link.href = data.url || (lang === 'fr' ? '/fr/newsletter/' : '/newsletter');
  }

  let signalItems = [{
    title: copy.fallbackTitle,
    desc: copy.fallbackDesc,
    url: lang === 'fr' ? '/fr/newsletter/' : '/newsletter'
  }];

  fetch('/brief.json', { cache: 'no-store' })
    .then((r) => r.ok ? r.json() : null)
    .then((d) => {
      if (!d) return;
      const arr = Array.isArray(d.items) ? d.items : (d.title ? [d] : []);
      const cleaned = arr.filter((x) => x && x.title);
      if (cleaned.length) signalItems = cleaned;
    })
    .catch(() => {});

  if (!hasThree) {
    updatePanel({
      tag: copy.signalTag,
      title: copy.fallbackTitle,
      desc: copy.fallbackDesc,
      url: lang === 'fr' ? '/fr/newsletter/' : '/newsletter'
    }, true);
    return;
  }

  const THREE = window.THREE;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  canvas.tabIndex = -1;

  const R = 3.2;
  const UP = new THREE.Vector3(0, 1, 0);
  const scratch = new THREE.Vector3();
  const qd = new THREE.Quaternion();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  let contextLost = false;

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
    updatePanel({
      tag: copy.signalTag,
      title: copy.fallbackTitle,
      desc: copy.fallbackDesc,
      url: lang === 'fr' ? '/fr/newsletter/' : '/newsletter'
    }, true);
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    resize();
    applyTheme();
  }, false);

  let adaptivePixelRatioCap = 2.75;
  let renderedPixelRatio = 0;
  let perfFrameCount = 0;
  let smoothDt = 1 / 60;

  function worldPixelRatio() {
    // Supersample the 3D portal so it stays crisp on 1x desktop screens
    // and when the canvas is visually constrained inside the 1080px layout.
    const dpr = window.devicePixelRatio || 1;
    return Math.min(Math.max(dpr, 1.85), adaptivePixelRatioCap);
  }
  renderedPixelRatio = worldPixelRatio();
  renderer.setPixelRatio(renderedPixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 1.25, 8.5);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x1d2633, 0.62));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.42);
  keyLight.position.set(5.5, 9, 7.5);
  scene.add(keyLight);
  const warmLight = new THREE.DirectionalLight(0xF7931A, 0.64);
  warmLight.position.set(-7, 2.2, -4);
  scene.add(warmLight);
  const rimLight = new THREE.DirectionalLight(0xFFB24D, 0.55);
  rimLight.position.set(-4.5, 5, 6);
  scene.add(rimLight);

  function isDark() {
    // The 3D scene intentionally stays dark in both site themes.
    // It works as a dark signal portal on the light site instead of trying to relight the planet.
    return true;
  }

  const palette = {
    light: {
      planet: 0xe6e1d8,
      mast: 0xcfc8bd,
      head: 0x0e0f12,
      dust: 0xC2410C,
      dustOpacity: 0.12,
      fog: 0xf7f7f8
    },
    dark: {
      planet: 0x31445a,
      mast: 0xb7c0cb,
      head: 0xE8EDF2,
      dust: 0x9fb4d6,
      dustOpacity: 0.55,
      fog: 0x08090c
    }
  };

  const ACCENT = 0xF7931A;
  const themed = [];

  function toonGradient() {
    const data = new Uint8Array([52, 52, 52, 132, 132, 132, 255, 255, 255]);
    const texture = new THREE.DataTexture(data, 3, 1, THREE.RGBFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }

  const grad = toonGradient();

  function material(key, color) {
    const mat = new THREE.MeshToonMaterial({ color, gradientMap: grad });
    themed.push({ mat, key });
    return mat;
  }

  function applyTheme() {
    const p = isDark() ? palette.dark : palette.light;
    scene.fog = new THREE.FogExp2(p.fog, isDark() ? 0.018 : 0.012);
    themed.forEach((item) => {
      const color = item.key === 'head' ? p.head : p[item.key];
      if (typeof color !== 'undefined') item.mat.color.setHex(color);
    });
    if (dust) {
      if (dust.material.uniforms) {
        dust.material.uniforms.uColor.value.setHex(p.dust);
        dust.material.uniforms.uOpacity.value = p.dustOpacity;
      } else {
        dust.material.color.setHex(p.dust);
        dust.material.opacity = p.dustOpacity;
      }
    }
    if (nebula) nebula.material.opacity = isDark() ? 0.30 : 0.18;
    if (dataLayer) dataLayer.material.opacity = isDark() ? 0.16 : 0.10;
    if (shadow) shadow.material.opacity = isDark() ? 0.34 : 0.16;
  }

  const planetGroup = new THREE.Group();
  scene.add(planetGroup);

  function bump(v) {
    return Math.sin(v.x * 1.7 + 1.3) * Math.cos(v.y * 1.9 - 0.6) +
      Math.sin(v.y * 2.3 + 2.1) * Math.cos(v.z * 1.5) +
      Math.sin(v.z * 1.8 - 0.4) * Math.cos(v.x * 2.2);
  }

  const planetGeo = new THREE.IcosahedronGeometry(R, 4);
  (function shapePlanet() {
    const pos = planetGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      v.addScaledVector(n, 0.18 * bump(n.clone().multiplyScalar(1.55)));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    planetGeo.computeVertexNormals();
  })();

  const planet = new THREE.Mesh(planetGeo, material('planet', palette.dark.planet));
  planetGroup.add(planet);

  function makeNebulaTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    const g = ctx.createRadialGradient(246, 264, 12, 246, 264, 246);
    g.addColorStop(0, 'rgba(247,147,26,0.24)');
    g.addColorStop(0.24, 'rgba(247,147,26,0.15)');
    g.addColorStop(0.58, 'rgba(247,147,26,0.055)');
    g.addColorStop(1, 'rgba(247,147,26,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(-0.28);
    for (let i = 0; i < 18; i += 1) {
      const y = -115 + i * 13;
      const alpha = 0.018 + ((i % 4) * 0.006);
      ctx.strokeStyle = 'rgba(255,178,77,' + alpha + ')';
      ctx.lineWidth = 22 + (i % 5) * 4;
      ctx.beginPath();
      ctx.moveTo(-260, y);
      ctx.bezierCurveTo(-110, y - 35, 75, y + 34, 265, y - 14);
      ctx.stroke();
    }
    ctx.restore();

    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeDataLayerTexture() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);

    function prand(seed) {
      const x = Math.sin(seed * 127.1) * 43758.5453123;
      return x - Math.floor(x);
    }

    for (let i = 0; i < 34; i += 1) {
      const y = 70 + prand(i + 1) * 372;
      const x = prand(i + 4) * 1024;
      const len = 120 + prand(i + 8) * 260;
      const lift = (prand(i + 13) - 0.5) * 78;
      ctx.strokeStyle = 'rgba(247,147,26,' + (0.10 + prand(i + 21) * 0.12).toFixed(3) + ')';
      ctx.lineWidth = 1 + prand(i + 34) * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + len * 0.33, y + lift, x + len * 0.66, y - lift, x + len, y + lift * 0.25);
      ctx.stroke();
    }

    for (let i = 0; i < 115; i += 1) {
      const x = prand(i + 101) * 1024;
      const y = 48 + prand(i + 205) * 416;
      const r = 0.9 + prand(i + 309) * 2.3;
      ctx.fillStyle = 'rgba(255,178,77,' + (0.08 + prand(i + 411) * 0.22).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  const dataLayer = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.024, 64, 32),
    new THREE.MeshBasicMaterial({
      map: makeDataLayerTexture(),
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  planetGroup.add(dataLayer);

  const nebula = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeNebulaTexture(),
    transparent: true,
    opacity: 0.30,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true
  }));
  nebula.position.set(0.72, 0.08, -4.25);
  nebula.scale.set(7.8, 5.8, 1);
  scene.add(nebula);

  const glowShell = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.19, 48, 32),
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(ACCENT) },
        uIntensity: { value: 0.58 },
        uTime: { value: 0 }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec3 vViewPosition;',
        'void main() {',
        '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        '  vNormal = normalize(normalMatrix * normal);',
        '  vViewPosition = -mvPosition.xyz;',
        '  gl_Position = projectionMatrix * mvPosition;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform float uIntensity;',
        'uniform float uTime;',
        'varying vec3 vNormal;',
        'varying vec3 vViewPosition;',
        'void main() {',
        '  float facing = max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0);',
        '  float fresnel = pow(1.0 - facing, 2.15);',
        '  float breath = 0.92 + sin(uTime * 0.55) * 0.08;',
        '  float alpha = smoothstep(0.10, 0.95, fresnel) * uIntensity * breath;',
        '  gl_FragColor = vec4(uColor, alpha);',
        '}'
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(glowShell);

  function randDir(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    const y = Math.sin(seed * 78.233) * 12673.193;
    const z = Math.sin(seed * 45.164) * 31337.735;
    return new THREE.Vector3((x % 2) - 1, (y % 2) - 1, (z % 2) - 1).normalize();
  }

  function directionFromLatLon(lat, lon) {
    const c = Math.cos(lat);
    return new THREE.Vector3(Math.cos(lon) * c, Math.sin(lat), Math.sin(lon) * c).normalize();
  }

  function placeOnPlanet(obj, dir, lift) {
    const n = dir.clone().normalize();
    obj.position.copy(n).multiplyScalar(R + (lift || 0));
    obj.quaternion.setFromUnitVectors(UP, n);
    planetGroup.add(obj);
  }

  function glowSprite(hex, size, opacity) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    const col = '#' + hex.toString(16).padStart(6, '0');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    sprite.scale.set(size, size, 1);
    return sprite;
  }

  function labelSprite(text, scale) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = '700 35px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(247,147,26,0.42)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#F7931A';
    ctx.fillText(text, 256, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.96,
      depthWrite: false
    }));
    const s = scale || 1;
    sprite.scale.set(1.8 * s, 0.45 * s, 1);
    return sprite;
  }

  const decoPositions = [
    [0.58, -1.08], [0.46, -0.36], [0.64, 0.34], [0.42, 1.04],
    [0.54, 1.82], [0.38, 2.55], [0.68, -2.35]
  ];
  for (let i = 0; i < decoPositions.length; i += 1) {
    const group = new THREE.Group();
    const height = 0.28 + (i % 3) * 0.11;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, height, 6), material('mast', palette.dark.mast));
    mast.position.y = height / 2;
    group.add(mast);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), new THREE.MeshBasicMaterial({ color: ACCENT }));
    tip.position.y = height + 0.03;
    group.add(tip);
    placeOnPlanet(group, directionFromLatLon(decoPositions[i][0], decoPositions[i][1]), 0.01);
  }

  function toonMat(color) {
    return new THREE.MeshToonMaterial({ color, gradientMap: grad });
  }

  function basicMat(color, opacity) {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: typeof opacity === 'number',
      opacity: typeof opacity === 'number' ? opacity : 1,
      side: THREE.DoubleSide
    });
  }

  const LAND = {
    body: 0x52677e,
    body2: 0x2b3c50,
    roof: 0x1a2735,
    metal: 0xb7c0cb,
    glass: 0xffb24d
  };

  function meshBox(w, h, d, color) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toonMat(color));
  }

  function meshCyl(r1, r2, h, color, segments) {
    return new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, segments || 12), toonMat(color));
  }

  function meshSphere(r, color, segments) {
    return new THREE.Mesh(new THREE.SphereGeometry(r, segments || 16, segments || 16), toonMat(color));
  }

  function meshTorus(radius, tube, color) {
    return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 36), basicMat(color, 0.92));
  }

  function addBeacon(group, y, glowSize) {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({ color: ACCENT }));
    orb.position.y = y;
    group.add(orb);
    const glow = glowSprite(ACCENT, glowSize || 0.72, 0.48);
    glow.position.y = y;
    group.add(glow);
    return { orb, glow };
  }

  function buildAntenna() {
    const group = new THREE.Group();
    const base = meshCyl(0.18, 0.22, 0.12, LAND.body2, 16);
    base.position.y = 0.06;
    group.add(base);
    const mast = meshCyl(0.026, 0.038, 0.72, LAND.metal, 8);
    mast.position.y = 0.46;
    group.add(mast);
    const dish = meshTorus(0.18, 0.012, ACCENT);
    dish.position.set(0, 0.62, 0.08);
    group.add(dish);
    const inner = new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), basicMat(ACCENT, 0.16));
    inner.position.set(0, 0.62, 0.081);
    group.add(inner);
    const wave1 = meshTorus(0.27, 0.008, ACCENT);
    wave1.position.set(0, 0.80, 0.03);
    wave1.scale.set(1.15, 0.62, 1);
    group.add(wave1);
    const wave2 = meshTorus(0.39, 0.007, ACCENT);
    wave2.position.set(0, 0.83, 0.03);
    wave2.scale.set(1.18, 0.56, 1);
    group.add(wave2);
    const beacon = addBeacon(group, 0.90, 0.78);
    return { group, orb: beacon.orb, glow: beacon.glow, labelY: 1.22, labelScale: 0.9 };
  }

  function buildRadar() {
    const group = new THREE.Group();
    const base = meshCyl(0.27, 0.31, 0.14, LAND.body2, 18);
    base.position.y = 0.07;
    group.add(base);
    const neck = meshCyl(0.04, 0.05, 0.34, LAND.metal, 10);
    neck.position.y = 0.29;
    group.add(neck);
    const dish = meshTorus(0.24, 0.018, LAND.metal);
    dish.position.set(0, 0.53, 0.08);
    dish.rotation.x = -0.22;
    group.add(dish);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.21, 32), basicMat(ACCENT, 0.12));
    face.position.set(0, 0.53, 0.081);
    face.rotation.x = -0.22;
    group.add(face);
    const sweep = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.62, 28, 1, true), basicMat(ACCENT, 0.13));
    sweep.position.set(0, 0.56, 0.36);
    sweep.rotation.x = Math.PI / 2;
    group.add(sweep);
    const beacon = addBeacon(group, 0.82, 0.82);
    return { group, orb: beacon.orb, glow: beacon.glow, labelY: 1.14, labelScale: 1.04 };
  }

  function buildWorkshop() {
    const group = new THREE.Group();
    const house = meshBox(0.48, 0.32, 0.42, LAND.body);
    house.position.y = 0.22;
    group.add(house);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.24, 4), toonMat(LAND.roof));
    roof.position.y = 0.50;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
    const door = meshBox(0.13, 0.18, 0.018, ACCENT);
    door.position.set(-0.11, 0.16, 0.22);
    group.add(door);
    const chimney = meshBox(0.08, 0.20, 0.08, LAND.metal);
    chimney.position.set(0.16, 0.62, -0.08);
    group.add(chimney);
    const spark = meshSphere(0.045, ACCENT, 10);
    spark.position.set(0.16, 0.76, -0.08);
    group.add(spark);
    const beacon = addBeacon(group, 0.80, 0.68);
    return { group, orb: beacon.orb, glow: beacon.glow, labelY: 1.10, labelScale: 1.0 };
  }

  function buildObservatory() {
    const group = new THREE.Group();
    const base = meshCyl(0.30, 0.34, 0.18, LAND.body2, 24);
    base.position.y = 0.09;
    group.add(base);
    const body = meshCyl(0.25, 0.27, 0.26, LAND.body, 20);
    body.position.y = 0.30;
    group.add(body);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toonMat(LAND.metal));
    dome.position.y = 0.43;
    group.add(dome);
    const scope = meshCyl(0.035, 0.045, 0.46, ACCENT, 12);
    scope.position.set(0.20, 0.62, 0.08);
    scope.rotation.z = -0.95;
    scope.rotation.x = 0.25;
    group.add(scope);
    const lens = meshSphere(0.055, ACCENT, 12);
    lens.position.set(0.36, 0.76, 0.12);
    group.add(lens);
    const beacon = addBeacon(group, 0.86, 0.72);
    return { group, orb: beacon.orb, glow: beacon.glow, labelY: 1.20, labelScale: 0.82 };
  }

  function buildTerminal() {
    const group = new THREE.Group();
    const chest = meshBox(0.52, 0.27, 0.38, LAND.body2);
    chest.position.y = 0.20;
    group.add(chest);
    const lid = meshBox(0.57, 0.09, 0.42, LAND.metal);
    lid.position.y = 0.38;
    group.add(lid);
    const lock = meshBox(0.09, 0.10, 0.025, ACCENT);
    lock.position.set(0, 0.24, 0.205);
    group.add(lock);
    const screen = meshBox(0.34, 0.18, 0.022, ACCENT);
    screen.position.set(0, 0.60, 0.04);
    screen.rotation.x = -0.28;
    group.add(screen);
    const stand = meshCyl(0.025, 0.035, 0.22, LAND.metal, 8);
    stand.position.y = 0.48;
    group.add(stand);
    const beacon = addBeacon(group, 0.82, 0.72);
    return { group, orb: beacon.orb, glow: beacon.glow, labelY: 1.13, labelScale: 0.86 };
  }

  function buildRadio() {
    const group = new THREE.Group();
    const hut = meshBox(0.36, 0.24, 0.32, LAND.body);
    hut.position.y = 0.18;
    group.add(hut);
    const mast = meshCyl(0.020, 0.030, 0.82, LAND.metal, 8);
    mast.position.y = 0.55;
    group.add(mast);
    const bar1 = meshCyl(0.010, 0.010, 0.40, LAND.metal, 6);
    bar1.position.y = 0.57;
    bar1.rotation.z = Math.PI / 2;
    group.add(bar1);
    const bar2 = meshCyl(0.010, 0.010, 0.34, LAND.metal, 6);
    bar2.position.y = 0.73;
    bar2.rotation.z = Math.PI / 2;
    group.add(bar2);
    const wave1 = meshTorus(0.24, 0.007, ACCENT);
    wave1.position.y = 0.93;
    wave1.scale.set(1.1, 0.58, 1);
    group.add(wave1);
    const wave2 = meshTorus(0.36, 0.006, ACCENT);
    wave2.position.y = 0.97;
    wave2.scale.set(1.12, 0.52, 1);
    group.add(wave2);
    const beacon = addBeacon(group, 0.99, 0.78);
    return { group, orb: beacon.orb, glow: beacon.glow, labelY: 1.30, labelScale: 0.92 };
  }

  function buildLandmark(type) {
    if (type === 'antenna') return buildAntenna();
    if (type === 'radar') return buildRadar();
    if (type === 'workshop') return buildWorkshop();
    if (type === 'observatory') return buildObservatory();
    if (type === 'terminal') return buildTerminal();
    if (type === 'radio') return buildRadio();
    return buildAntenna();
  }

  const nodeGroups = [];
  const pagePositions = [
    [0.58, -0.90],
    [0.50, 2.68],
    [0.40, 1.62],
    [0.52, 0.34],
    [0.58, -2.28],
    [0.42, -0.10]
  ];
  copy.pages.forEach((p, i) => {
    const pos = pagePositions[i] || [0.48, (i / copy.pages.length) * Math.PI * 2];
    const lat = pos[0];
    const lon = pos[1];
    const landmark = buildLandmark(p[4]);
    const group = landmark.group;
    const label = labelSprite(p[0], p[0].length > 8 ? (landmark.labelScale || 0.9) : (landmark.labelScale || 1.02));
    label.position.y = landmark.labelY || 1.1;
    group.add(label);
    group.userData = {
      kind: 'page',
      orb: landmark.orb,
      glow: landmark.glow,
      data: { tag: p[0], title: p[1], desc: p[2], url: p[3] }
    };
    placeOnPlanet(group, directionFromLatLon(lat, lon), 0.02);
    nodeGroups.push(group);
  });

  const signal = new THREE.Group();
  (function buildSignal() {
    const h = 0.88;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, h, 8), material('mast', palette.dark.mast));
    post.position.y = h / 2;
    signal.add(post);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 18), new THREE.MeshBasicMaterial({ color: ACCENT }));
    orb.position.y = h + 0.12;
    signal.add(orb);
    const glow = glowSprite(ACCENT, 1.75, 0.72);
    glow.position.y = h + 0.12;
    signal.add(glow);
    const label = labelSprite(copy.signalTag.toUpperCase(), lang === 'fr' ? 1.1 : 0.96);
    label.position.y = h + 0.64;
    signal.add(label);
    signal.userData = { kind: 'signal', orb, glow, data: null };
    placeOnPlanet(signal, directionFromLatLon(0.72, -0.15), 0.02);
    nodeGroups.push(signal);
  })();

  const hero = new THREE.Group();
  const heroMesh = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 18), new THREE.MeshToonMaterial({ color: ACCENT, gradientMap: grad }));
  body.scale.set(1, 1.26, 1);
  body.position.y = 0.48;
  heroMesh.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 16), material('head', palette.dark.head));
  head.position.y = 1.04;
  heroMesh.add(head);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.075, 0.15), new THREE.MeshBasicMaterial({ color: ACCENT }));
  visor.position.set(0, 1.04, 0.18);
  heroMesh.add(visor);
  const heroGlow = glowSprite(ACCENT, 0.82, 0.16);
  heroGlow.position.y = 0.58;
  heroMesh.add(heroGlow);
  hero.add(heroMesh);
  hero.position.set(0, R + 0.20, 0);
  scene.add(hero);

  let shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.58, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, R + 0.045, 0);
  scene.add(shadow);

  let dust;
  (function buildDust() {
    const count = 760;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 16 + ((i * 19) % 31);
      const dir = randDir(i + 14.4).multiplyScalar(radius);
      pos[i * 3] = dir.x;
      pos[i * 3 + 1] = dir.y;
      pos[i * 3 + 2] = dir.z;
      phase[i] = (i * 2.399963) % (Math.PI * 2);
      size[i] = 4.4 + ((i * 13) % 10) * 0.55;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    dust = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(palette.dark.dust) },
        uOpacity: { value: palette.dark.dustOpacity }
      },
      vertexShader: [
        'uniform float uTime;',
        'attribute float aPhase;',
        'attribute float aSize;',
        'varying float vTwinkle;',
        'void main() {',
        '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        '  vTwinkle = 0.72 + sin(uTime * 0.82 + aPhase) * 0.28;',
        '  gl_PointSize = aSize * vTwinkle * (190.0 / -mvPosition.z);',
        '  gl_Position = projectionMatrix * mvPosition;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform float uOpacity;',
        'varying float vTwinkle;',
        'void main() {',
        '  float d = length(gl_PointCoord - vec2(0.5));',
        '  float alpha = smoothstep(0.5, 0.0, d) * uOpacity * vTwinkle;',
        '  gl_FragColor = vec4(uColor, alpha);',
        '}'
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    scene.add(dust);
  })();

  applyTheme();
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  const keys = {};
  let keyboardActive = false;
  wrap.addEventListener('mouseenter', () => { keyboardActive = true; });
  wrap.addEventListener('mouseleave', () => { if (!dragging) keyboardActive = false; });
  const map = {
    fwd: ['KeyW', 'KeyZ', 'ArrowUp'],
    back: ['KeyS', 'ArrowDown'],
    left: ['KeyA', 'KeyQ', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight']
  };
  const flatKeys = Object.values(map).flat();
  const held = (group) => map[group].some((code) => keys[code]);

  function isTypingTarget(target) {
    const tag = target && target.tagName ? target.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  window.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target) || !keyboardActive) return;
    if (flatKeys.includes(e.code)) {
      keys[e.code] = true;
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let dragX = 0;
  let dragY = 0;

  function pointerDown(x, y) {
    keyboardActive = true;
    try { canvas.focus({ preventScroll: true }); } catch (_) { canvas.focus(); }
    dragging = true;
    lastX = x;
    lastY = y;
    wrap.classList.add('is-dragging');
  }

  function pointerMove(x, y) {
    if (!dragging) return;
    dragX += (x - lastX) * 0.006;
    dragY += (y - lastY) * 0.006;
    lastX = x;
    lastY = y;
  }

  function pointerUp() {
    dragging = false;
    wrap.classList.remove('is-dragging');
  }

  canvas.addEventListener('pointerdown', (e) => {
    pointerDown(e.clientX, e.clientY);
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener('pointermove', (e) => pointerMove(e.clientX, e.clientY));
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);

  function spin(axis, amount) {
    qd.setFromAxisAngle(axis, amount);
    planetGroup.quaternion.premultiply(qd);
  }

  const axisX = new THREE.Vector3(1, 0, 0);
  const axisY = new THREE.Vector3(0, 1, 0);
  const axisZ = new THREE.Vector3(0, 0, 1);

  let width = 0;
  let height = 0;
  let activeNode = null;
  let signalIndex = -1;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    width = Math.max(320, Math.ceil(rect.width));
    height = Math.max(360, Math.ceil(rect.height));
    renderedPixelRatio = worldPixelRatio();
    renderer.setPixelRatio(renderedPixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, height < 520 ? 1.28 : 1.46, width < 520 ? 11.45 : 10.65);
    camera.lookAt(0, 0.16, 0);
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize);

  function tunePixelRatio(dt) {
    if (reduceMotion) return;
    smoothDt = smoothDt * 0.94 + dt * 0.06;
    perfFrameCount += 1;
    if (perfFrameCount < 90) return;

    if (smoothDt > 0.032 && adaptivePixelRatioCap > 2.01) {
      adaptivePixelRatioCap = 2.0;
      renderedPixelRatio = worldPixelRatio();
      renderer.setPixelRatio(renderedPixelRatio);
      renderer.setSize(width, height, false);
      perfFrameCount = 0;
      return;
    }

    if (smoothDt < 0.019 && adaptivePixelRatioCap < 2.75) {
      adaptivePixelRatioCap = 2.75;
      renderedPixelRatio = worldPixelRatio();
      renderer.setPixelRatio(renderedPixelRatio);
      renderer.setSize(width, height, false);
      perfFrameCount = 0;
    }
  }

  function currentSignalData(index) {
    const item = signalItems[Math.max(0, index)] || signalItems[0];
    return {
      tag: copy.signalTag,
      title: item.title || copy.fallbackTitle,
      desc: item.src ? copy.source + '. ' + item.src : (item.desc || copy.fallbackDesc),
      url: item.url || (lang === 'fr' ? '/fr/newsletter/' : '/newsletter')
    };
  }

  function checkNodes(time) {
    let best = null;
    let bestAngle = 0.5;
    nodeGroups.forEach((group, i) => {
      group.getWorldPosition(scratch);
      const angle = scratch.clone().normalize().angleTo(UP);
      const near = angle < 0.5;
      if (group.userData.orb) group.userData.orb.scale.setScalar(near ? 1.48 : 1);
      if (group.userData.glow) {
        if (near) {
          group.userData.glow.material.opacity = 0.88;
        } else if (group.userData.kind === 'signal') {
          group.userData.glow.material.opacity = 0.62;
        } else {
          // Subtle desynced idle breathing, page beacons only, never the active (near) node.
          var amp = reduceMotion ? 0 : 0.07;
          group.userData.glow.material.opacity = 0.45 + Math.sin(time * 1.1 + i * 1.7) * amp;
        }
      }
      if (near && angle < bestAngle) {
        best = group;
        bestAngle = angle;
      }
    });

    const newSignalIndex = best && best.userData.kind === 'signal'
      ? Math.floor(time / 6) % signalItems.length
      : -1;

    if (best !== activeNode || newSignalIndex !== signalIndex) {
      activeNode = best;
      signalIndex = newSignalIndex;
      if (!best) {
        updatePanel({
          tag: copy.signalTag,
          title: copy.fallbackTitle,
          desc: copy.introDesc,
          url: lang === 'fr' ? '/fr/newsletter/' : '/newsletter'
        }, true);
      } else if (best.userData.kind === 'signal') {
        updatePanel(currentSignalData(newSignalIndex), true);
      } else {
        updatePanel(best.userData.data, false);
      }
    }
  }

  updatePanel({
    tag: copy.signalTag,
    title: copy.fallbackTitle,
    desc: copy.introDesc,
    url: lang === 'fr' ? '/fr/newsletter/' : '/newsletter'
  }, true);

  let worldVisible = true;
  if ('IntersectionObserver' in window) {
    const visibilityObserver = new IntersectionObserver((entries) => {
      worldVisible = entries.some((entry) => entry.isIntersecting);
    }, { rootMargin: '90px 0px' });
    visibilityObserver.observe(wrap);
  }

  const clock = new THREE.Clock();
  let leanX = 0;
  let leanZ = 0;

  function tick() {
    if (contextLost) {
      clock.getDelta();
      window.requestAnimationFrame(tick);
      return;
    }

    if (document.hidden || !worldVisible) {
      clock.getDelta();
      window.requestAnimationFrame(tick);
      return;
    }

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    tunePixelRatio(dt);

    if (!reduceMotion) {
      if (glowShell.material.uniforms) glowShell.material.uniforms.uTime.value = t;
      if (dust && dust.material.uniforms) dust.material.uniforms.uTime.value = t;
    }
    if (dataLayer && !reduceMotion) {
      dataLayer.rotation.y += dt * 0.032;
      dataLayer.rotation.x = Math.sin(t * 0.18) * 0.018;
      dataLayer.material.opacity = 0.145 + Math.sin(t * 0.43) * 0.018;
    }
    if (nebula && !reduceMotion) {
      nebula.material.opacity = 0.28 + Math.sin(t * 0.24) * 0.035;
      nebula.rotation.z = Math.sin(t * 0.12) * 0.035;
    }

    let mx = 0;
    let mz = 0;
    if (held('fwd')) mx += 1;
    if (held('back')) mx -= 1;
    if (held('left')) mz += 1;
    if (held('right')) mz -= 1;

    const speed = 1.05;
    if (mx) spin(axisX, speed * mx * dt);
    if (mz) spin(axisZ, speed * mz * dt);
    if (Math.abs(dragX) > 0.001) spin(axisZ, dragX);
    if (Math.abs(dragY) > 0.001) spin(axisX, dragY);
    dragX *= 0.84;
    dragY *= 0.84;

    const moving = !!(mx || mz || Math.abs(dragX) > 0.01 || Math.abs(dragY) > 0.01);
    if (!moving && !reduceMotion) spin(axisY, 0.05 * dt);

    // Lean reacts to keyboard AND to drag velocity, since drag is the primary input.
    // Same axis convention as movement: dragY spins axisX -> leanX, dragX spins axisZ -> leanZ.
    var clamp1 = function (v) { return v < -1 ? -1 : (v > 1 ? 1 : v); };
    var driveX = clamp1(mx + dragY * 7);
    var driveZ = clamp1(mz + dragX * 7);
    leanX += ((-driveX * 0.48) - leanX) * 0.12;
    leanZ += ((driveZ * 0.48) - leanZ) * 0.12;
    heroMesh.rotation.x = leanX * 0.45;
    heroMesh.rotation.z = leanZ * 0.45;
    heroMesh.position.y = moving ? Math.abs(Math.sin(t * 11)) * 0.07 : Math.sin(t * 1.6) * 0.018;
    hero.rotation.y += dt * 0.34;

    const pulse = reduceMotion ? 1 : 1 + Math.sin(t * 2.2) * 0.13;
    if (signal.userData.glow) signal.userData.glow.scale.setScalar(1.75 * pulse);
    if (dust && !reduceMotion) dust.rotation.y += dt * 0.006;

    checkNodes(t);
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
})();
