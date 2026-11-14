import { useEffect, useRef } from 'react';

// Decorative only; all workflow controls work when WebGL is unavailable.
export function FlowCurrent3D({ activeStage, running }) {
  const mountRef = useRef(null);
  const activeRef = useRef(activeStage);
  const runningRef = useRef(running);
  const controlsRef = useRef(null);
  activeRef.current = activeStage;
  runningRef.current = running;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let cancelled = false;
    let visible = false;
    let scene = null;
    let request = 0;
    let observer;
    let resizeObserver;
    let initialized = false;

    function stop() {
      window.cancelAnimationFrame(request);
      request = 0;
    }
    function draw(time) {
      request = 0;
      if (cancelled || !visible || !scene) return;
      scene.render(time, activeRef.current);
      if (runningRef.current) request = window.requestAnimationFrame(draw);
    }
    function sync() {
      if (document.hidden || !visible || !scene || !runningRef.current) { stop(); return; }
      if (!request) request = window.requestAnimationFrame(draw);
    }
    async function start() {
      if (initialized || cancelled) return;
      initialized = true;
      try {
        const { createFlowCurrentScene } = await import('../../visuals/flowCurrentScene.js');
        if (cancelled || !visible) { initialized = false; return; }
        scene = createFlowCurrentScene(mount);
        if ('ResizeObserver' in window) {
          resizeObserver = new ResizeObserver(() => scene?.resize());
          resizeObserver.observe(mount);
        } else {
          window.addEventListener('resize', onResize);
        }
        scene.render(performance.now(), activeRef.current);
        sync();
      } catch {
        // WebGL can be unavailable or blocked. The CSS fallback stays visible.
        initialized = false;
      }
    }
    function onResize() { scene?.resize(); }
    controlsRef.current = {
      sync,
      redraw() { if (scene && !runningRef.current) scene.render(performance.now(), activeRef.current); },
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) stop();
        else if (scene) sync();
        else start();
      }, { threshold: .05 });
      observer.observe(mount);
    } else {
      visible = true;
      start();
    }
    function onVisibility() {
      if (document.hidden) stop();
      else if (visible) sync();
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      controlsRef.current = null;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
      resizeObserver?.disconnect();
      stop();
      scene?.dispose();
    };
  }, []);

  useEffect(() => {
    controlsRef.current?.sync();
    controlsRef.current?.redraw();
  }, [running, activeStage]);

  return <div className="flow-current-canvas" ref={mountRef} aria-hidden="true"/>;
}
