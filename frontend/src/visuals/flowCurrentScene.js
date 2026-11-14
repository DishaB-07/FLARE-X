import * as THREE from 'three';

const STATION_X = [-4.05, -2.02, 0, 2.02, 4.05];

// Purely illustrative data movement between software stages; no physical simulation.
export function createFlowCurrentScene(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5.1, 5.1, 1.5, -1.5, 0.1, 40);
  camera.position.set(0, 0, 12);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.7, -.01, 0),
    ...STATION_X.map((x, i) => new THREE.Vector3(x, Math.sin(i * 1.15) * .15, Math.cos(i * 1.2) * .14)),
    new THREE.Vector3(4.7, -.02, 0),
  ]);

  const resources = [];
  function track(object) { resources.push(object); return object; }

  for (const [index, offset] of [0, .19, -.19].entries()) {
    const points = Array.from({ length: 100 }, (_, i) => {
      const p = curve.getPoint(i / 99);
      return new THREE.Vector3(p.x, p.y + offset, p.z + Math.sin(i / 11 + index) * .09);
    });
    const geometry = track(new THREE.BufferGeometry().setFromPoints(points));
    const material = track(new THREE.LineBasicMaterial({
      color: index === 0 ? 0x55d9ed : 0x367cba,
      transparent: true, opacity: index === 0 ? .54 : .22,
      depthWrite: false,
    }));
    scene.add(new THREE.Line(geometry, material));
  }

  const nodeGroups = STATION_X.map((x, index) => {
    const group = new THREE.Group();
    const position = curve.getPointAt((index + .5) / 5);
    group.position.copy(position);
    const core = new THREE.Mesh(
      track(new THREE.IcosahedronGeometry(.105, 1)),
      track(new THREE.MeshBasicMaterial({ color: 0x64cced, transparent: true, opacity: .82 })),
    );
    const ring = new THREE.Mesh(
      track(new THREE.TorusGeometry(.23, .012, 4, 42)),
      track(new THREE.MeshBasicMaterial({ color: 0x75dcec, transparent: true, opacity: .46 })),
    );
    ring.rotation.x = .45;
    group.add(core, ring);
    scene.add(group);
    return { group, core, ring };
  });

  const particleCount = window.innerWidth < 680 ? 85 : 170;
  const positions = new Float32Array(particleCount * 3);
  const seeds = Array.from({ length: particleCount }, (_, i) => ({
    progress: i / particleCount,
    speed: .047 + (i % 7) * .006,
    lane: ((i % 11) - 5) / 5,
    phase: i * 2.3999,
  }));
  const particleGeometry = track(new THREE.BufferGeometry());
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = track(new THREE.PointsMaterial({
    color: 0x9cefff, size: .062, sizeAttenuation: true,
    transparent: true, opacity: .92, blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  scene.add(new THREE.Points(particleGeometry, particleMaterial));

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const halfWidth = 5.1;
    const halfHeight = halfWidth * height / width;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function render(time, activeStage = 0) {
    const seconds = time * .001;
    seeds.forEach((seed, i) => {
      const progress = (seed.progress + seconds * seed.speed) % 1;
      const p = curve.getPointAt(progress);
      const wave = .10 * seed.lane + .025 * Math.sin(seconds * 2 + seed.phase);
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y + wave;
      positions[i * 3 + 2] = p.z + .15 * Math.cos(seed.phase) + Math.cos(seconds + seed.phase) * .024;
    });
    particleGeometry.attributes.position.needsUpdate = true;
    nodeGroups.forEach(({ group, core, ring }, index) => {
      const isActive = index === activeStage;
      const scale = isActive ? 1.38 + .07 * Math.sin(seconds * 2.4) : 1;
      group.scale.setScalar(scale);
      core.material.color.setHex(isActive ? 0xe1ffff : 0x64cced);
      ring.material.opacity = isActive ? .9 : .43;
      ring.rotation.z = seconds * (index % 2 ? -.23 : .23);
    });
    renderer.render(scene, camera);
  }

  resize();
  render(0, 0);

  return {
    resize,
    render,
    dispose() {
      for (const resource of resources) resource.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
