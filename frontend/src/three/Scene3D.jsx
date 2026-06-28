import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";
import { setupRenderer, makeEnv, makeComposer, COLORS, sectionProgress } from "@/three/sceneUtils";

export default function Scene3D({ build, className = "absolute inset-0", bloom, interactive = true, drag = false }) {
  const ref = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let cleanup = null;
    let started = false;

    const start = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const C = COLORS[theme];

      const renderer = setupRenderer(container);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.z = 6;
      const env = makeEnv(renderer);
      scene.environment = env;

      const W = container.clientWidth;
      const H = container.clientHeight;
      const strength = bloom != null ? bloom : C.bloom;
      const { composer, bloom: bloomPass } = makeComposer(renderer, scene, camera, W, H, strength);

      const update = build({ scene, camera, renderer, env, C, theme }) || (() => {});

      const mouse = { x: 0, y: 0, tx: 0, ty: 0, dragX: 0, dragY: 0 };
      const onMove = (e) => {
        const r = container.getBoundingClientRect();
        mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
      };
      if (interactive) window.addEventListener("mousemove", onMove);

      let dragging = false, lastX = 0, lastY = 0;
      const dragVel = { x: 0, y: 0 };
      const el = renderer.domElement;
      const onDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
      const onUp = () => { dragging = false; };
      const onDrag = (e) => {
        if (!dragging) return;
        mouse.dragY += (e.clientX - lastX) / 180;
        mouse.dragX += (e.clientY - lastY) / 180;
        dragVel.x = (e.clientY - lastY) / 180;
        dragVel.y = (e.clientX - lastX) / 180;
        lastX = e.clientX; lastY = e.clientY;
      };
      if (drag) {
        el.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointermove", onDrag);
      }

      const prog = { p: 0 };
      const onScroll = () => { prog.p = sectionProgress(container); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      let visible = true;
      const vio = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
      vio.observe(container);

      const clock = new THREE.Clock();
      let raf;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        const t = clock.getElapsedTime();
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        if (drag && !dragging) {
          dragVel.x *= 0.94; dragVel.y *= 0.94;
          mouse.dragX += dragVel.x; mouse.dragY += dragVel.y;
        }
        update(t, prog.p, mouse, reduce);
        composer.render();
      };
      loop();

      const onResize = () => {
        const w = container.clientWidth, h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
        bloomPass.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(raf);
        vio.disconnect();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        if (drag) {
          el.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointermove", onDrag);
        }
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => {
              Object.values(m).forEach((v) => v && v.isTexture && v.dispose && v.dispose());
              m.dispose();
            });
          }
        });
        env.dispose && env.dispose();
        renderer.dispose();
        if (el.parentNode === container) container.removeChild(el);
      };
    };

    // Lazy: only build the WebGL context when the section nears the viewport
    const trigger = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          trigger.disconnect();
          start();
        }
      },
      { rootMargin: "300px" }
    );
    trigger.observe(container);

    return () => {
      trigger.disconnect();
      if (cleanup) cleanup();
    };
  }, [theme, build, bloom, interactive, drag]);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
