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
        introDesc: 'Approche les balises pour explorer l’écosystème The Cryptomath.',
        pages: [
          ['NEWSLETTER', 'La newsletter', 'Analyses quotidiennes et lectures de marché.', '/fr/newsletter/'],
          ['SCORE', 'Score', 'Le scanner de signaux crypto.', '/fr/score/'],
          ['BUILD', 'Build', 'Les projets et expérimentations en cours.', '/fr/build/'],
          ['CADRE', 'Narrative Framework', 'Lire les narratifs avant le marché.', '/fr/narrative-framework/'],
          ['RESSOURCES', 'Ressources', 'La stack crypto sélectionnée.', '/fr/resources/']
        ]
      }
    : {
        signalTag: 'Daily signal',
        readBrief: 'Read the brief',
        openPage: 'Open page',
        source: 'Source',
        fallbackTitle: 'The morning brief, filtered and verified.',
        fallbackDesc: 'Today’s market read appears here when the brief is live.',
        introDesc: 'Move close to the beacons to explore The Cryptomath ecosystem.',
        pages: [
          ['NEWSLETTER', 'Newsletter', 'Daily editions and market reads.', '/newsletter'],
          ['SCORE', 'Score', 'The crypto signal scanner.', '/score/'],
          ['BUILD', 'Build', 'Current projects and experiments.', '/build'],
          ['FRAMEWORK', 'Narrative Framework', 'Reading narratives before the market does.', '/narrative-framework'],
          ['RESOURCES', 'Resources', 'The curated crypto stack.', '/resources']
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 1.25, 8.5);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x344055, 0.95));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
  keyLight.position.set(6, 9, 6);
  scene.add(keyLight);
  const warmLight = new THREE.DirectionalLight(0xF7931A, 0.44);
  warmLight.position.set(-7, 2, -4);
  scene.add(warmLight);

  function isDark() {
    return root.getAttribute('data-theme') === 'dark';
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
      planet: 0x141a24,
      mast: 0x2a3645,
      head: 0xE8EDF2,
      dust: 0x9fb4d6,
      dustOpacity: 0.55,
      fog: 0x08090c
    }
  };

  const ACCENT = 0xF7931A;
  const themed = [];

  function toonGradient() {
    const data = new Uint8Array([82, 82, 82, 156, 156, 156, 255, 255, 255]);
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
      dust.material.color.setHex(p.dust);
      dust.material.opacity = p.dustOpacity;
    }
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

  const glowShell = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.16, 32, 32),
    new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
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

  for (let i = 0; i < 7; i += 1) {
    const group = new THREE.Group();
    const height = 0.28 + (i % 3) * 0.11;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, height, 6), material('mast', palette.dark.mast));
    mast.position.y = height / 2;
    group.add(mast);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), new THREE.MeshBasicMaterial({ color: ACCENT }));
    tip.position.y = height + 0.03;
    group.add(tip);
    placeOnPlanet(group, randDir(i + 2.7), 0.01);
  }

  const nodeGroups = [];
  copy.pages.forEach((p, i) => {
    const lat = [-0.24, 0.1, -0.04, 0.24, -0.16][i] || 0;
    const lon = (i / copy.pages.length) * Math.PI * 2 + 0.42;
    const group = new THREE.Group();
    const h = 0.58;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, h, 8), material('mast', palette.dark.mast));
    mast.position.y = h / 2;
    group.add(mast);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 16), new THREE.MeshBasicMaterial({ color: ACCENT }));
    orb.position.y = h + 0.08;
    group.add(orb);
    const glow = glowSprite(ACCENT, 0.7, 0.45);
    glow.position.y = h + 0.08;
    group.add(glow);
    const label = labelSprite(p[0], p[0].length > 8 ? 0.82 : 0.95);
    label.position.y = h + 0.43;
    group.add(label);
    group.userData = {
      kind: 'page',
      orb,
      glow,
      data: { tag: p[0], title: p[1], desc: p[2], url: p[3] }
    };
    placeOnPlanet(group, directionFromLatLon(lat, lon), 0.02);
    nodeGroups.push(group);
  });

  const signal = new THREE.Group();
  (function buildSignal() {
    const h = 0.78;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, h, 8), material('mast', palette.dark.mast));
    post.position.y = h / 2;
    signal.add(post);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 18), new THREE.MeshBasicMaterial({ color: ACCENT }));
    orb.position.y = h + 0.12;
    signal.add(orb);
    const glow = glowSprite(ACCENT, 1.45, 0.62);
    glow.position.y = h + 0.12;
    signal.add(glow);
    const label = labelSprite(copy.signalTag.toUpperCase(), lang === 'fr' ? 0.98 : 0.85);
    label.position.y = h + 0.56;
    signal.add(label);
    signal.userData = { kind: 'signal', orb, glow, data: null };
    placeOnPlanet(signal, directionFromLatLon(0.72, -0.15), 0.02);
    nodeGroups.push(signal);
  })();

  const hero = new THREE.Group();
  const heroMesh = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 18), new THREE.MeshToonMaterial({ color: ACCENT, gradientMap: grad }));
  body.scale.set(1, 1.24, 1);
  body.position.y = 0.32;
  heroMesh.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), material('head', palette.dark.head));
  head.position.y = 0.72;
  heroMesh.add(head);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.055, 0.1), new THREE.MeshBasicMaterial({ color: ACCENT }));
  visor.position.set(0, 0.72, 0.12);
  heroMesh.add(visor);
  const heroGlow = glowSprite(ACCENT, 1.15, 0.28);
  heroGlow.position.y = 0.42;
  heroMesh.add(heroGlow);
  hero.add(heroMesh);
  hero.position.set(0, R + 0.14, 0);
  scene.add(hero);

  let shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, R + 0.035, 0);
  scene.add(shadow);

  let dust;
  (function buildDust() {
    const count = 650;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const dir = randDir(i + 14.4).multiplyScalar(18 + ((i * 17) % 24));
      pos[i * 3] = dir.x;
      pos[i * 3 + 1] = dir.y;
      pos[i * 3 + 2] = dir.z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dust = new THREE.Points(geo, new THREE.PointsMaterial({
      color: palette.dark.dust,
      size: 0.09,
      sizeAttenuation: true,
      transparent: true,
      opacity: palette.dark.dustOpacity
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
    width = Math.max(320, Math.floor(rect.width));
    height = Math.max(360, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, height < 520 ? 1.15 : 1.25, width < 520 ? 9.8 : 8.5);
    camera.lookAt(0, 0.12, 0);
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize);

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
    nodeGroups.forEach((group) => {
      group.getWorldPosition(scratch);
      const angle = scratch.clone().normalize().angleTo(UP);
      const near = angle < 0.5;
      if (group.userData.orb) group.userData.orb.scale.setScalar(near ? 1.48 : 1);
      if (group.userData.glow) group.userData.glow.material.opacity = near ? 0.88 : (group.userData.kind === 'signal' ? 0.62 : 0.45);
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
    if (document.hidden || !worldVisible) {
      clock.getDelta();
      window.requestAnimationFrame(tick);
      return;
    }

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

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

    leanX += ((mx ? -Math.sign(mx) * 0.48 : 0) - leanX) * 0.12;
    leanZ += ((mz ? Math.sign(mz) * 0.48 : 0) - leanZ) * 0.12;
    heroMesh.rotation.x = leanX * 0.45;
    heroMesh.rotation.z = leanZ * 0.45;
    heroMesh.position.y = moving ? Math.abs(Math.sin(t * 11)) * 0.07 : Math.sin(t * 1.6) * 0.018;
    hero.rotation.y += dt * 0.34;

    const pulse = reduceMotion ? 1 : 1 + Math.sin(t * 2.2) * 0.13;
    if (signal.userData.glow) signal.userData.glow.scale.setScalar(1.45 * pulse);
    if (dust && !reduceMotion) dust.rotation.y += dt * 0.006;

    checkNodes(t);
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
})();
