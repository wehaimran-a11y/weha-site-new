import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

const TOOLS = [
  "n8n", "Make", "Zapier", "Claude", "OpenAI", "Gemini",
  "LangChain", "CrewAI", "AutoGen", "LlamaIndex", "Hermes Agent",
  "WhatsApp", "HubSpot", "Airtable", "Xero", "DocuSign",
  "Apify", "Apollo", "Clay", "Pinecone", "Supabase", "Cloudflare", "Slack", "Notion",
];

const PALETTE = {
  light: {
    chipBg: "rgba(255,255,255,0.82)",
    chipBorder: "rgba(40,37,29,0.14)",
    chipText: "#28251d",
    line: 0x9a948a,
    lineOpacity: 0.22,
    particle: 0x8a857a,
  },
  dark: {
    chipBg: "rgba(34,32,28,0.78)",
    chipBorder: "rgba(247,246,242,0.16)",
    chipText: "#f7f6f2",
    line: 0x5a564c,
    lineOpacity: 0.3,
    particle: 0x4a463e,
  },
};
const TEAL = 0x5b3fa6;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeChip(label, theme) {
  const p = PALETTE[theme];
  const dpr = 2;
  const w = 280, h = 96;
  const c = document.createElement("canvas");
  c.width = w * dpr;
  c.height = h * dpr;
  const ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);
  roundRect(ctx, 4, 4, w - 8, h - 8, 26);
  ctx.fillStyle = p.chipBg;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = p.chipBorder;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(36, h / 2, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#5b3fa6";
  ctx.fill();
  ctx.fillStyle = p.chipText;
  ctx.font = '500 30px "General Sans", system-ui, sans-serif';
  ctx.textBaseline = "middle";
  ctx.fillText(label, 60, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * NetworkScene — the animated tool-network backdrop.
 *
 * Props:
 *   contained: when true the canvas is absolutely positioned and sized to its
 *     parent (used inside a page hero), and page-scroll coupling is disabled so
 *     it does NOT bleed below the hero. When false (default) it is a fixed,
 *     full-viewport background that reacts to page scroll (used on Home).
 */
export default function NetworkScene({ contained = false }) {
  const { theme } = useTheme();
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pal = PALETTE[theme];

    const getSize = () =>
      contained
        ? [mount.clientWidth || window.innerWidth, mount.clientHeight || window.innerHeight]
        : [window.innerWidth, window.innerHeight];

    let [width, height] = getSize();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 200);
    camera.position.set(0, 0, contained ? 13 : 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ---- NODES (billboard sprites) ----
    const N = TOOLS.length;
    const radius = 7.2;
    const nodes = [];
    const sprites = [];
    let built = false;

    const buildNodes = () => {
      TOOLS.forEach((label, i) => {
        const y = 1 - (i / (N - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const phi = i * Math.PI * (3 - Math.sqrt(5));
        const pos = new THREE.Vector3(Math.cos(phi) * r, y * 0.9, Math.sin(phi) * r)
          .multiplyScalar(radius)
          .add(new THREE.Vector3(
            (Math.random() - 0.5) * 1.2,
            (Math.random() - 0.5) * 1.2,
            (Math.random() - 0.5) * 1.2
          ));
        const tex = makeChip(label, theme);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(mat);
        sprite.position.copy(pos);
        const s = 2.6;
        sprite.scale.set(s, s * (96 / 280), 1);
        sprite.userData = { base: s, target: s, phase: Math.random() * Math.PI * 2 };
        group.add(sprite);
        nodes.push(pos);
        sprites.push(sprite);
      });
      built = true;
    };

    // central hub
    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshBasicMaterial({ color: TEAL })
    );
    group.add(hub);
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 32, 32),
      new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.18 })
    );
    group.add(halo);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.02, 16, 100),
      new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.5 })
    );
    group.add(ring);

    // ---- CONNECTIONS + PULSES ----
    const lineSegs = [];
    const pulses = [];
    const buildLinks = () => {
      const linePts = [];
      const connections = [];
      nodes.forEach((p) => {
        linePts.push(0, 0, 0, p.x, p.y, p.z);
        connections.push([new THREE.Vector3(0, 0, 0), p.clone()]);
      });
      nodes.forEach((a, i) => {
        const dists = nodes
          .map((b, j) => ({ j, d: a.distanceTo(b) }))
          .filter((o) => o.j !== i)
          .sort((x, y) => x.d - y.d)
          .slice(0, 2);
        dists.forEach(({ j }) => {
          if (j > i) {
            linePts.push(a.x, a.y, a.z, nodes[j].x, nodes[j].y, nodes[j].z);
            connections.push([a.clone(), nodes[j].clone()]);
          }
        });
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(linePts, 3));
      const mat = new THREE.LineBasicMaterial({ color: pal.line, transparent: true, opacity: pal.lineOpacity });
      const lines = new THREE.LineSegments(geo, mat);
      group.add(lines);
      lineSegs.push(lines);

      const pulseGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const chosen = connections.filter(() => Math.random() > 0.55).slice(0, 14);
      chosen.forEach((conn) => {
        const m = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: TEAL }));
        group.add(m);
        pulses.push({ mesh: m, a: conn[0], b: conn[1], t: Math.random(), speed: 0.15 + Math.random() * 0.35 });
      });
    };

    // ---- BACKGROUND PARTICLES ----
    const pCount = 420;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 60;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: pal.particle, size: 0.06, transparent: true, opacity: 0.55, sizeAttenuation: true })
    );
    scene.add(particles);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { buildNodes(); buildLinks(); });
    } else {
      buildNodes();
      buildLinks();
    }

    // ---- INTERACTION ----
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const onMouseMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMouseMove);

    let dragging = false;
    let lastX = 0, lastY = 0;
    const dragRot = { x: 0, y: 0 };
    const dragVel = { x: 0, y: 0 };
    const el = renderer.domElement;
    const onDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onUp = () => { dragging = false; };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = (e.clientX - lastX) / 200;
      const dy = (e.clientY - lastY) / 200;
      dragRot.y += dx;
      dragRot.x += dy;
      dragVel.x = dy;
      dragVel.y = dx;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);

    const raycaster = new THREE.Raycaster();
    let hovered = null;
    const onHover = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(sprites, false);
      const next = hits.length ? hits[0].object : null;
      if (hovered && hovered !== next) hovered.userData.target = hovered.userData.base;
      if (next) { next.userData.target = next.userData.base * 1.22; }
      hovered = next;
    };
    el.addEventListener("pointermove", onHover);

    // scroll progress (only meaningful for the fixed/full-page variant)
    const scrollState = { p: 0, hero: 0 };
    const updateScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      scrollState.p = Math.min(1, Math.max(0, window.scrollY / max));
      scrollState.hero = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    };
    if (!contained) {
      window.addEventListener("scroll", updateScroll, { passive: true });
      updateScroll();
    }

    // ---- LOOP ----
    const clock = new THREE.Clock();
    let raf;
    const tmp = new THREE.Vector3();
    const animate = () => {
      const t = clock.getElapsedTime();
      const { hero, p } = scrollState;

      mouse.lerp(targetMouse, 0.06);
      dragVel.x *= 0.93;
      dragVel.y *= 0.93;
      if (!dragging) { dragRot.x += dragVel.x; dragRot.y += dragVel.y; }

      const autoRot = reduce ? 0 : t * 0.045;
      group.rotation.y = autoRot + dragRot.y + mouse.x * 0.25 + p * 0.4;
      group.rotation.x = dragRot.x + mouse.y * 0.18 + Math.sin(t * 0.2) * 0.05 + p * 0.08;
      const expand = 1 + p * 0.08 + Math.sin(t * 0.4) * 0.008;
      group.scale.setScalar(expand);

      camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 1.0 - camera.position.y) * 0.05;
      if (!contained) {
        camera.position.z = 15 - hero * 4.5 - p * 1.2;
      }
      camera.lookAt(0, 0, 0);

      const pulse = 1 + Math.sin(t * 1.6) * 0.12;
      hub.scale.setScalar(pulse);
      halo.scale.setScalar(1 + Math.sin(t * 1.6) * 0.25);
      halo.material.opacity = 0.12 + Math.abs(Math.sin(t * 1.6)) * 0.12;
      ring.rotation.x = t * 0.3;
      ring.rotation.y = t * 0.22;

      if (built) {
        sprites.forEach((sp) => {
          const u = sp.userData;
          const cur = sp.scale.x;
          const target = u.target * (1 + Math.sin(t * 1.1 + u.phase) * 0.015);
          const s = cur + (target - cur) * 0.12;
          sp.scale.set(s, s * (96 / 280), 1);
        });
      }

      pulses.forEach((pl) => {
        pl.t += pl.speed * 0.01;
        if (pl.t > 1) pl.t = 0;
        tmp.copy(pl.a).lerp(pl.b, pl.t);
        pl.mesh.position.copy(tmp);
        const fade = Math.sin(pl.t * Math.PI);
        pl.mesh.scale.setScalar(0.6 + fade * 0.8);
      });

      particles.rotation.y = t * 0.012;
      if (!reduce) {
        particles.position.y = Math.sin(t * 0.15) * 0.4;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      [width, height] = getSize();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);
    let ro;
    if (contained && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onResize);
      ro.observe(mount);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (!contained) window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onHover);
      if (ro) ro.disconnect();
      renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
      if (el.parentNode === mount) mount.removeChild(el);
    };
  }, [theme, contained]);

  return (
    <div
      ref={mountRef}
      data-testid="network-scene"
      aria-hidden="true"
      className={contained ? "absolute inset-0 z-0" : "fixed inset-0 z-0"}
      style={{ pointerEvents: "auto" }}
    />
  );
}
