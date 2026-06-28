import * as THREE from "three";
import { makeBgTexture, lerp } from "@/three/sceneUtils";

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/* ---------------- CRYSTAL (Home hero) — refractive glass gem cluster ---------------- */
export function buildCrystal({ scene, camera, C, theme }) {
  scene.background = makeBgTexture(theme);
  const group = new THREE.Group();
  scene.add(group);
  camera.position.set(0, 0, 5.4);

  const glass = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    thickness: 2.4,
    roughness: 0.045,
    metalness: 0,
    ior: 1.62,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    iridescence: 1,
    iridescenceIOR: 1.3,
    attenuationColor: new THREE.Color(C.cobalt),
    attenuationDistance: 3.2,
    color: 0xffffff,
    transparent: true,
    envMapIntensity: 1.5,
  });

  const main = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), glass);
  group.add(main);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 0),
    new THREE.MeshStandardMaterial({
      color: C.orange,
      emissive: C.orange,
      emissiveIntensity: 2.2,
      roughness: 0.35,
      metalness: 0,
    })
  );
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.011, 16, 140),
    new THREE.MeshStandardMaterial({ color: C.cobalt, emissive: C.cobalt, emissiveIntensity: 2.4, roughness: 0.4 })
  );
  ring.rotation.x = Math.PI / 2.3;
  group.add(ring);

  const sats = [];
  const satGeo = new THREE.IcosahedronGeometry(0.42, 0);
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(satGeo, glass.clone());
    m.userData = { a: (i / 3) * Math.PI * 2, r: 3.0 + i * 0.4, y: (i - 1) * 0.9, spd: 0.4 + i * 0.15 };
    group.add(m);
    sats.push(m);
  }

  return (t, p, mouse, reduce) => {
    const spin = reduce ? 0 : t * 0.16;
    group.rotation.y = spin + mouse.x * 0.4 + mouse.dragY;
    group.rotation.x = mouse.y * 0.3 + mouse.dragX + Math.sin(t * 0.3) * 0.07;
    core.material.emissiveIntensity = 1.9 + Math.sin(t * 2.2) * 0.7;
    core.rotation.x = -t * 0.4;
    core.rotation.y = -t * 0.5;
    ring.rotation.z = t * 0.25;
    sats.forEach((m) => {
      const u = m.userData;
      const ang = u.a + t * u.spd;
      m.position.set(Math.cos(ang) * u.r, u.y + Math.sin(t * 0.6 + u.a) * 0.3, Math.sin(ang) * u.r);
      m.rotation.x = t * 0.6;
      m.rotation.y = t * 0.5;
    });
    camera.position.x = lerp(camera.position.x, mouse.x * 0.6, 0.05);
    camera.position.y = lerp(camera.position.y, mouse.y * 0.4, 0.05);
    camera.lookAt(0, 0, 0);
  };
}

/* ---------------- ORB (Services hero) — chrome agent core + orbiting rings ---------------- */
export function buildOrb({ scene, camera, C, theme }) {
  scene.background = makeBgTexture(theme);
  const group = new THREE.Group();
  scene.add(group);
  camera.position.set(0, 0, 6);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 64, 64),
    new THREE.MeshStandardMaterial({ color: C.cobalt, metalness: 1, roughness: C.metalRough, envMapIntensity: 1.6 })
  );
  group.add(orb);

  const rings = [];
  [
    [2.1, C.cobalt, new THREE.Euler(Math.PI / 2, 0, 0)],
    [2.5, C.orange, new THREE.Euler(Math.PI / 3, Math.PI / 4, 0)],
    [2.9, C.cobalt, new THREE.Euler(Math.PI / 2.4, -Math.PI / 5, 0)],
  ].forEach(([r, col, rot], i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.016, 16, 160),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.2, roughness: 0.4 })
    );
    ring.rotation.copy(rot);
    ring.userData = { spd: 0.25 + i * 0.12, axis: i };
    group.add(ring);
    rings.push(ring);
  });

  const agents = [];
  const aGeo = new THREE.SphereGeometry(0.085, 16, 16);
  for (let i = 0; i < 7; i++) {
    const col = i % 2 ? C.orange : C.cobalt;
    const m = new THREE.Mesh(aGeo, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.6 }));
    m.userData = { a: Math.random() * Math.PI * 2, r: 2.0 + Math.random() * 1.1, tilt: Math.random() * Math.PI, spd: 0.3 + Math.random() * 0.5 };
    group.add(m);
    agents.push(m);
  }

  // particles
  const pn = 240;
  const pos = new Float32Array(pn * 3);
  for (let i = 0; i < pn; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const particles = new THREE.Points(pg, new THREE.PointsMaterial({ color: C.cobalt, size: 0.03, transparent: true, opacity: 0.5 }));
  scene.add(particles);

  return (t, p, mouse, reduce) => {
    const spin = reduce ? 0 : t;
    orb.rotation.y = spin * 0.2 + mouse.dragY;
    orb.rotation.x = mouse.dragX;
    rings.forEach((r) => {
      if (r.userData.axis === 0) r.rotation.z = spin * r.userData.spd;
      else if (r.userData.axis === 1) r.rotation.x = Math.PI / 3 + spin * r.userData.spd;
      else r.rotation.y = spin * r.userData.spd;
    });
    agents.forEach((m) => {
      const u = m.userData;
      const ang = u.a + t * u.spd;
      m.position.set(Math.cos(ang) * u.r, Math.sin(ang) * u.r * Math.cos(u.tilt), Math.sin(ang) * u.r * Math.sin(u.tilt));
    });
    particles.rotation.y = t * 0.03;
    group.rotation.y = lerp(group.rotation.y, mouse.x * 0.3, 0.05);
    group.rotation.x = lerp(group.rotation.x, -mouse.y * 0.2, 0.05);
  };
}

/* ---------------- PIPELINE (How It Works / Work) — scroll-scrubbed conduit ---------------- */
export function buildPipeline({ scene, camera, C, theme }) {
  scene.background = makeBgTexture(theme);
  const group = new THREE.Group();
  scene.add(group);
  camera.position.set(0, 0.2, 7);

  const pts = [
    new THREE.Vector3(-4.4, -0.8, 0),
    new THREE.Vector3(-2.2, 0.7, 0.4),
    new THREE.Vector3(0, -0.2, -0.3),
    new THREE.Vector3(2.2, 0.8, 0.4),
    new THREE.Vector3(4.4, -0.6, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.6);

  const conduit = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 200, 0.05, 14, false),
    new THREE.MeshStandardMaterial({ color: theme === "dark" ? 0x20222c : 0xcfccc4, metalness: 0.9, roughness: 0.35, envMapIntensity: 1.2 })
  );
  group.add(conduit);

  const glowGeo = new THREE.TubeGeometry(curve, 200, 0.062, 14, false);
  const glow = new THREE.Mesh(
    glowGeo,
    new THREE.MeshBasicMaterial({ color: C.cobalt, transparent: true, opacity: 0.9 })
  );
  const glowTotal = glowGeo.index.count;
  glowGeo.setDrawRange(0, 0);
  group.add(glow);

  const stations = [];
  const stationParams = [0.0, 0.5, 1.0];
  stationParams.forEach((tp) => {
    const at = curve.getPointAt(clamp01(tp === 0 ? 0.001 : tp === 1 ? 0.999 : tp));
    const mat = new THREE.MeshStandardMaterial({ color: C.cobalt, emissive: C.cobalt, emissiveIntensity: 0.15, metalness: 0.6, roughness: 0.25 });
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), mat);
    node.position.copy(at);
    node.userData = { tp, mat };
    group.add(node);
    stations.push(node);
  });

  const packet = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 24, 24),
    new THREE.MeshBasicMaterial({ color: C.orange })
  );
  group.add(packet);

  return (t, p, mouse, reduce) => {
    const pr = clamp01(p);
    glowGeo.setDrawRange(0, Math.floor(glowTotal * pr));
    const at = curve.getPointAt(clamp01(pr < 0.001 ? 0.001 : pr > 0.999 ? 0.999 : pr));
    packet.position.copy(at);
    packet.scale.setScalar(0.8 + Math.sin(t * 8) * 0.15);
    stations.forEach((s) => {
      const on = pr >= s.userData.tp - 0.04 ? 1 : 0.12;
      s.userData.mat.emissiveIntensity = lerp(s.userData.mat.emissiveIntensity, on * 2.4, 0.1);
      s.rotation.y = t * 0.6;
      s.rotation.x = t * 0.4;
    });
    group.rotation.y = lerp(group.rotation.y, mouse.x * 0.18, 0.05);
    group.rotation.x = lerp(group.rotation.x, -mouse.y * 0.12, 0.05);
    group.position.y = Math.sin(t * 0.4) * 0.05;
    camera.position.x = lerp(camera.position.x, (pr - 0.5) * 1.2 + mouse.x * 0.4, 0.04);
    camera.lookAt(0, 0, 0);
  };
}

/* ---------------- SHIELD (Compliance / About) — metallic vault that locks ---------------- */
function makeShield(forceDark) {
  return function ({ scene, camera, C, theme }) {
    const dark = forceDark || theme === "dark";
    scene.background = makeBgTexture(forceDark ? "dark" : theme);
    const group = new THREE.Group();
    scene.add(group);
    camera.position.set(0, 0, 5.6);

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 1.7, 0.4, 6),
      new THREE.MeshStandardMaterial({ color: dark ? 0x2a2f45 : 0xc2c6d2, metalness: 1, roughness: 0.3, envMapIntensity: 1.5 })
    );
    disc.rotation.x = Math.PI / 2;
    group.add(disc);

    const seamGeo = new THREE.TorusGeometry(1.72, 0.035, 20, 96);
    const seam = new THREE.Mesh(seamGeo, new THREE.MeshBasicMaterial({ color: C.cobalt }));
    seam.position.z = 0.22;
    group.add(seam);
    const seamTotal = seamGeo.index.count;

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.0, 0.02, 16, 80),
      new THREE.MeshStandardMaterial({ color: C.cobalt, emissive: C.cobalt, emissiveIntensity: 1.6, roughness: 0.4 })
    );
    innerRing.position.z = 0.23;
    group.add(innerRing);

    const coreLock = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({ color: C.orange, emissive: C.orange, emissiveIntensity: 2.4, metalness: 0.2, roughness: 0.3 })
    );
    coreLock.position.z = 0.3;
    group.add(coreLock);

    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshStandardMaterial({ color: dark ? 0x8890b0 : 0x6b7088, metalness: 1, roughness: 0.25 })
      );
      b.position.set(Math.cos(ang) * 1.35, Math.sin(ang) * 1.35, 0.26);
      group.add(b);
    }

    return (t, p, mouse, reduce) => {
      const pr = clamp01(p);
      seamGeo.setDrawRange(0, Math.floor(seamTotal * pr));
      group.rotation.z = (reduce ? 0 : t * 0.12) + mouse.dragY * 0.5;
      group.rotation.x = lerp(group.rotation.x, -mouse.y * 0.25 + mouse.dragX * 0.5, 0.05);
      group.rotation.y = lerp(group.rotation.y, mouse.x * 0.35, 0.05);
      coreLock.rotation.x = t * 0.7;
      coreLock.rotation.y = t * 0.9;
      coreLock.material.emissiveIntensity = 1.8 + Math.sin(t * 2.5) * 0.7 + pr * 0.6;
      innerRing.rotation.z = -t * 0.4;
      innerRing.material.emissiveIntensity = 1.2 + pr * 1.4;
    };
  };
}

export const buildShield = makeShield(false);
export const buildVault = makeShield(true);
