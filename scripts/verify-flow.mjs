import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { spring } from 'motion';
import * as THREE from 'three';

const { PerspectiveCamera, Vector3 } = THREE;

const read = path => fs.readFileSync(path, 'utf8');
const load = async path => {
  const source = ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;

  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
};

const { products } = await load('src/data/products.ts');
const { getScanState, scanTiming, scanSpring } = await load('src/lib/scanner.ts');

const { createScanParticles, sampleScanParticle, scanParticleDensity, shouldAnimateScan } = await load('src/lib/scanParticles.ts');
const particles = createScanParticles(scanParticleDensity.wide);
assert.deepEqual(particles, createScanParticles(scanParticleDensity.wide), 'Particle placement is stable across render/replay');
assert(particles.some(particle => sampleScanParticle(particle, 0).y !== sampleScanParticle(particle, 1).y),
  'Particles move independently of scroll position');

for (const particle of particles) {
  for (const seconds of [0, 0.016, 1, 5, 60, 3600]) {
    const sample = sampleScanParticle(particle, seconds);
    assert(sample.x >= 0 && sample.x <= 1 && sample.y >= 0 && sample.y <= 1, 'Particle positions remain bounded');
    assert(sample.alpha >= 0 && sample.alpha <= 1, 'Particles never produce invalid opacity');
    assert(Object.values(sample).every(Number.isFinite), 'Every sampled particle value is finite');
  }
}

for (const active of [false, true]) {
  for (const paused of [false, true]) {
    for (const reduced of [false, true]) {
      for (const visible of [false, true]) {
        const running = shouldAnimateScan(active, paused, reduced, visible);
        assert.equal(running, active && !paused && !reduced && visible,
          'Loops stop outside the scan, when paused, with reduced motion, and in hidden tabs');
      }
    }
  }
}

for (const keyframes of [[0, 1], [1, 0]]) {
  const trajectory = spring({ keyframes, ...scanSpring });
  let previous = keyframes[0];

  for (let time = 0; time <= 2000; time += 16) {
    const value = trajectory.next(time).value;
    assert(value >= 0 && value <= 1, 'Verification progress must never overshoot');
    assert(keyframes[0] === 0 ? value >= previous : value <= previous, 'No bouncing through ingredient checks');
    previous = value;
  }

  assert(Math.abs(previous - keyframes[1]) < 0.001, 'Scan settles at its target');
}

assert(fs.statSync('public/fonts/bad-script.ttf').size > 10000);
assert(fs.existsSync('public/fonts/bad-script-license.txt'));

for (let index = 0; index < products.length; index++) {
  const count = products[index].ingredientDetails.length;
  const at = local => getScanState((index + local) / products.length, products.length, count);
  assert.equal(at(scanTiming.start).checked, 0);
  assert.equal(at(scanTiming.end).checked, count, `Product ${index}: all checks complete before returning to front`);
  assert.equal(at(scanTiming.returnStart).complete, true);
  let previous = 0;

  for (let step = 0; step <= 100; step++) {
    const scan = at(scanTiming.start + (scanTiming.end - scanTiming.start) * step / 100);
    assert(scan.checked >= previous, 'Forward scan must accumulate checks');
    previous = scan.checked;
  }

  assert.equal(at(scanTiming.start).checked, 0, 'Replay/reverse scroll must reset checks');
}

const { productBounds, getModelPresentation, getPresentationSize } = await load('src/lib/productPresentation.ts');

// Exercise the actual geometry/layout functions without creating a WebGL browser context.
const extractFunctions = (path, names) => {
  const source = read(path);
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  return ast.statements
    .filter(node => ts.isFunctionDeclaration(node) && names.includes(node.name?.text))
    .map(node => node.getText(ast)).join('\n');
};
const functions = extractFunctions('src/three/ProductStage.tsx',
  ['heroLayout', 'scanLayout', 'showcaseLayout', 'showcaseMobileLayout']);
const utils = read('src/lib/utils.ts').replace(/^import .*$/gm, '').replace(/export /g, '');
const context = vm.createContext({ products, scanTiming, getPresentationSize });
vm.runInContext(ts.transpileModule(`${utils}\n${functions}`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText, context);

const tubeFunctions = extractFunctions('src/three/TubeModel.tsx',
  ['getTubeProfile', 'getSharedTubeGeometry', 'getSharedCapGeometry']);
const bottleFunctions = extractFunctions('src/three/DropperModel.tsx',
  ['getFlutedBottleGeo', 'getLiquidGeometry', 'getCollarGeo', 'getBulbGeo']);
const packaging = vm.createContext({ THREE });
const caches = 'let cachedTubeGeo, cachedCapGeo, cachedFlutedGlassGeo, cachedLiquidGeo, cachedCollarGeo, cachedBulbGeo;';
vm.runInContext(ts.transpileModule(`${caches}\n${utils}\n${tubeFunctions}\n${bottleFunctions}`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText, packaging);
const tube = packaging.getSharedTubeGeometry();
const cap = packaging.getSharedCapGeometry();
const bottle = packaging.getFlutedBottleGeo();
const liquid = packaging.getLiquidGeometry();
assert.equal(tube, packaging.getSharedTubeGeometry(), 'Tube geometry is shared across products');
assert.equal(bottle, packaging.getFlutedBottleGeo(), 'Bottle geometry is cached');

for (const geometry of [tube, cap, bottle, liquid, packaging.getCollarGeo(), packaging.getBulbGeo()]) {
  for (const attribute of ['position', 'normal']) {
    assert(Array.from(geometry.attributes[attribute].array).every(Number.isFinite), 'Packaging has finite vertices and normals');
  }
  geometry.computeBoundingBox();
  assert(geometry.boundingBox.min.y >= -1.321 && geometry.boundingBox.max.y <= 1.11, 'Product keeps its framing envelope');
}
assert(packaging.getTubeProfile(0.5).z > 0.34, 'Tube has a full, convex middle');
assert(packaging.getTubeProfile(1).z < 0.05, 'Tube still pinches cleanly into its top seal');
assert(cap.boundingBox.max.x / packaging.getTubeProfile(0.15).x < 0.7, 'Cap is narrower than the filled lower body');
assert(tube.boundingBox.max.x < 0.6, 'Wider tube still fits the complete collection');

const nativeBounds = {
  tube: new THREE.Box3().union(tube.boundingBox).union(cap.boundingBox).union(
    new THREE.Box3(new Vector3(-0.595, 0.9175, -0.049), new Vector3(0.595, 1.1025, 0.049))),
  serum: new THREE.Box3().union(bottle.boundingBox).union(packaging.getCollarGeo().boundingBox)
    .union(packaging.getBulbGeo().boundingBox),
};
const targetHeight = productBounds.tube.maxY - productBounds.tube.minY;
for (const kind of ['tube', 'serum']) {
  const bounds = nativeBounds[kind];
  const presentation = getModelPresentation(kind);
  const height = (bounds.max.y - bounds.min.y) * presentation.scale;
  const baseline = bounds.min.y * presentation.scale + presentation.y;
  assert(Math.abs(height - targetHeight) < 0.000001, `${kind}: displayed packaging height matches`);
  assert(Math.abs(baseline - productBounds.tube.minY) < 0.000001, `${kind}: bases share one baseline`);
}

for (const isMobile of [false, true]) {
  for (const height of [600, 768, 923, 1080]) {
    const fit = getPresentationSize(isMobile, height);
    for (let active = 0; active < products.length; active++) {
      const hero = context.heroLayout(active, active, 0, isMobile, height);
      const settledHero = context.heroLayout(active, active, 1, isMobile, height);
      const scan = context.scanLayout(active, (active + 0.5) / products.length, isMobile, height);
      const collection = context.showcaseLayout(active, active, 0.5, isMobile, height);
      for (const layout of [hero, settledHero, scan, collection]) {
        assert.equal(layout.scale, fit.scale, 'Hero, scan and collection use the same scale');
        assert.equal(layout.z, 0, 'No chapter moves a product closer to enlarge it');
        assert.equal(layout.y, fit.y, 'All products retain a consistent stage baseline');
      }
      const neighbor = context.showcaseLayout((active + 1) % products.length, active, 0.5, isMobile, height);
      assert.equal(neighbor.scale, collection.scale, 'Selection never enlarges a product or shrinks its neighbors');
      assert.equal(neighbor.z, collection.z, 'Carousel neighbors share the same camera distance');
    }
  }
}

const glassMesh = new THREE.Mesh(bottle, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
glassMesh.updateMatrixWorld();
const ray = new THREE.Raycaster();
const position = liquid.attributes.position;
for (let index = 0; index < position.count; index += 17) {
  const x = position.getX(index), y = position.getY(index), z = position.getZ(index);
  const radius = Math.hypot(x, z);
  if (radius < 0.01) continue;
  // Avoid casting exactly along duplicated angular seams, where ray/edge precision is ambiguous.
  const angle = Math.atan2(x, z) + 0.0001;
  ray.set(new Vector3(0, y, 0), new Vector3(Math.sin(angle), 0, Math.cos(angle)));
  const wall = ray.intersectObject(glassMesh, false)[0];
  assert(wall && radius < wall.distance - 0.001,
    `Liquid stays inside glass: vertex=${index}, y=${y}, radius=${radius}, wall=${wall?.distance}`);
}
const { finishProps, glassProps } = await load('src/three/materials.ts');
assert(finishProps('matte').roughness > finishProps('dewy').roughness, 'Packaging finishes retain distinct roughness');
assert(glassProps(false).transmission > 0.9 && glassProps(false).opacity === 1, 'Desktop glass uses physical transmission');
assert(glassProps(false).thickness > 0 && glassProps(false).metalness === 0, 'Glass has optical thickness and no metallic coating');
assert.equal(glassProps(true).transmission, 0, 'Mobile glass avoids the transmission pass');

// Projection checks catch the reported heading/product collision without claiming browser visual QA.
for (const [width, height] of [[768, 600], [1024, 768], [1366, 768], [1907, 923], [1920, 1080]]) {
  const layout = context.heroLayout(0, 0, 0, false, height);
  const camera = new PerspectiveCamera(32, width / height, 0.08, 60);
  camera.position.set(0, 0.26, 6.6);
  camera.lookAt(0, 0.02, 0);
  camera.updateMatrixWorld();
  const top = new Vector3(0, 1.11 * layout.scale + layout.y, layout.z + 0.25).project(camera);
  const productTop = (1 - top.y) * height / 2;
  const headingSize = height <= 740 ? 40 : Math.max(48, Math.min(width * 0.05, 68));
  const headingTop = height <= 740 ? 76 : Math.max(78, height * 0.076);
  assert(headingTop + headingSize * 1.3 + 6 < productTop, `${width}x${height}: One has room above the product`);
}

for (let active = 0; active < products.length; active++) {
  for (const progress of [0.12, 0.5, 0.9, 1]) {
    const layouts = products.map((_, index) => context.showcaseLayout(index, active, progress, false));
    assert(layouts.every(layout => layout.scale > 0.7), 'All six desktop products remain visible');
    assert.equal(new Set(layouts.map(layout => layout.x)).size, products.length);
  }
}

for (const [width, height] of [[768, 1024], [1024, 768], [1366, 768], [1920, 1080], [2560, 1080]]) {
  const aspect = width / height;
  const cameraSource = read('src/three/CameraRig.tsx');
  const distanceExpression = cameraSource.match(/const distance = (.*)/)?.[1];
  assert(distanceExpression, 'Camera fit expression exists');
  const distance = vm.runInNewContext(distanceExpression, { aspect, isMobile: false, Math });
  const halfWidth = distance * Math.tan(Math.PI * 16 / 180) * aspect;

  for (let index = 0; index < products.length; index++) {
    const layout = context.showcaseLayout(index, 0, 1, false);
    assert(Math.abs(layout.x) + 0.6 * layout.scale < halfWidth, `${width}: product ${index} fits the camera`);
  }
}

for (let index = 0; index < products.length; index++) {
  for (const local of [scanTiming.start, 0.5, scanTiming.end, scanTiming.returnStart]) {
    const layout = context.scanLayout(index, (index + local) / products.length, false);
    assert(Math.abs(layout.rotY - Math.PI) < 0.000001, 'Back label holds still throughout the scan');
  }
}

assert(!/atelier|ritual|AtelierUI|RitualUI/.test(read('src/App.tsx')));
assert(!/Formulation|Production/.test(read('src/components/Nav.tsx')));
assert(!/FormulationLab3D|ProductionRitual3D/.test(read('src/three/Scene.tsx')));
console.log(
  'PASS: moving particles, all animation gates, non-bouncing progress, font assets, six scans, replay, stable back labels, ' +
  'desktop collection at five sizes, uniform product heights/scales, packaging geometry, ' +
  'liquid containment, glass materials, removed chapters.'
);
