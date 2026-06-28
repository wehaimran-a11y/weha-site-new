import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroSphere() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 8.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const teal = new THREE.Color("#5b3fa6");
    const tealBright = new THREE.Color("#9b80e0");
    const warm = new THREE.Color("#e9e4d6");

    const N = 44;
    const radius = 3.4;
    const nodes = [];

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * Math.PI * (3 - Math.sqrt(5));
      const pos = new THREE.Vector3(
        Math.cos(phi) * r,
        y,
        Math.sin(phi) * r
      ).multiplyScalar(radius);

      const tealNode = Math.random() > 0.45;
      const size = 0.05 + Math.random() * 0.06;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 14, 14),
        new THREE.MeshBasicMaterial({ color: tealNode ? tealBright : warm })
      );
      mesh.position.copy(pos);
      group.add(mesh);
      nodes.push({ pos, base: mesh.material.opacity, phase: Math.random() * Math.PI * 2 });
    }

    // Central hub
    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 28, 28),
      new THREE.MeshBasicMaterial({ color: teal })
    );
    group.add(hub);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 28, 28),
      new THREE.MeshBasicMaterial({ color: tealBright, transparent: true, opacity: 0.16 })
    );
    group.add(halo);

    // Hub -> node lines
    const hubLines = [];
    nodes.forEach((n) => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), n.pos]);
      const mat = new THREE.LineBasicMaterial({
        color: teal,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.12,
      });
      const line = new THREE.Line(geo, mat);
      line.userData = { phase: Math.random() * Math.PI * 2, base: mat.opacity };
      group.add(line);
      hubLines.push(line);
    });

    // A few node-to-node connections for "network" feel
    for (let i = 0; i < 16; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a === b) continue;
      const geo = new THREE.BufferGeometry().setFromPoints([a.pos, b.pos]);
      const mat = new THREE.LineBasicMaterial({ color: warm, transparent: true, opacity: 0.06 });
      group.add(new THREE.Line(geo, mat));
    }

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      const t = clock.getElapsedTime();
      group.rotation.y = t * 0.13;
      group.rotation.x = Math.sin(t * 0.18) * 0.18;

      const pulse = 1 + Math.sin(t * 1.8) * 0.09;
      hub.scale.setScalar(pulse);
      halo.scale.setScalar(1 + Math.sin(t * 1.8) * 0.18);
      halo.material.opacity = 0.12 + Math.abs(Math.sin(t * 1.8)) * 0.1;

      hubLines.forEach((line) => {
        const { phase, base } = line.userData;
        line.material.opacity = base * (0.5 + 0.5 * Math.abs(Math.sin(t * 1.1 + phase)));
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" data-testid="hero-sphere" aria-hidden="true" />;
}
