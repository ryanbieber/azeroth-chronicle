import { Buffer } from 'node:buffer';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const output = resolve('public/models/azeroth/black-empire-map-research/terrain.research.glb');
const gridSize = 33;
const positions = [];
const colors = [];
const indices = [];

for (let row = 0; row < gridSize; row += 1) {
  const z = -5 + (row / (gridSize - 1)) * 10;
  for (let column = 0; column < gridSize; column += 1) {
    const x = -5 + (column / (gridSize - 1)) * 10;
    const nx = x / 4.35;
    const nz = z / 4.55;
    const angle = Math.atan2(nz, nx);
    const radial = Math.hypot(nx, nz);
    const coastline = 0.91 + Math.sin(angle * 3 + 0.5) * 0.075 + Math.cos(angle * 5 - 0.8) * 0.045;
    const inland = coastline - radial;
    const ridge = Math.sin(x * 1.35 + z * 0.55) * Math.cos(z * 1.05 - x * 0.3) * 0.07;
    const centralRise = Math.exp(-(x * x + z * z) / 5.2) * 0.18;
    const height = inland > 0 ? 0.035 + inland * 0.48 + ridge + centralRise : -0.24;
    positions.push(x, height, z);

    const elevation = Math.max(0, Math.min(1, (height - 0.02) / 0.56));
    colors.push(
      0.16 + elevation * 0.12,
      0.19 + elevation * 0.08,
      0.16 + elevation * 0.06,
    );
  }
}

for (let row = 0; row < gridSize - 1; row += 1) {
  for (let column = 0; column < gridSize - 1; column += 1) {
    const a = row * gridSize + column;
    const b = a + 1;
    const c = a + gridSize;
    const d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
}

const normals = new Float32Array(positions.length);
for (let index = 0; index < indices.length; index += 3) {
  const ai = indices[index] * 3;
  const bi = indices[index + 1] * 3;
  const ci = indices[index + 2] * 3;
  const ab = [positions[bi] - positions[ai], positions[bi + 1] - positions[ai + 1], positions[bi + 2] - positions[ai + 2]];
  const ac = [positions[ci] - positions[ai], positions[ci + 1] - positions[ai + 1], positions[ci + 2] - positions[ai + 2]];
  const normal = [
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  ];
  for (const vertexIndex of [ai, bi, ci]) {
    normals[vertexIndex] += normal[0];
    normals[vertexIndex + 1] += normal[1];
    normals[vertexIndex + 2] += normal[2];
  }
}
for (let index = 0; index < normals.length; index += 3) {
  const length = Math.hypot(normals[index], normals[index + 1], normals[index + 2]) || 1;
  normals[index] /= length;
  normals[index + 1] /= length;
  normals[index + 2] /= length;
}

const terrainPositions = new Float32Array(positions);
const terrainColors = new Float32Array(colors);
const terrainIndices = new Uint16Array(indices);
const oceanPositions = new Float32Array([-5, -0.055, -5, 5, -0.055, -5, 5, -0.055, 5, -5, -0.055, 5]);
const oceanNormals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
const oceanIndices = new Uint16Array([0, 2, 1, 0, 3, 2]);
const terrainHeights = positions.filter((_, index) => index % 3 === 1);
const terrainMinY = Math.min(...terrainHeights);
const terrainMaxY = Math.max(...terrainHeights);

const chunks = [terrainPositions, normals, terrainColors, terrainIndices, oceanPositions, oceanNormals, oceanIndices];
const offsets = [];
let binaryLength = 0;
for (const chunk of chunks) {
  binaryLength = Math.ceil(binaryLength / 4) * 4;
  offsets.push(binaryLength);
  binaryLength += chunk.byteLength;
}
const binary = Buffer.alloc(Math.ceil(binaryLength / 4) * 4);
chunks.forEach((chunk, index) => Buffer.from(chunk.buffer).copy(binary, offsets[index]));

const [terrainPositionOffset, terrainNormalOffset, terrainColorOffset, terrainIndexOffset, oceanPositionOffset, oceanNormalOffset, oceanIndexOffset] = offsets;
const gltf = {
  asset: { version: '2.0', generator: 'Azeroth Chronicle original research-terrain generator' },
  scene: 0,
  scenes: [{ nodes: [0, 1] }],
  nodes: [{ mesh: 0, name: 'Interpretive primordial landmass' }, { mesh: 1, name: 'Primordial ocean' }],
  meshes: [
    { primitives: [{ attributes: { POSITION: 0, NORMAL: 1, COLOR_0: 2 }, indices: 3, material: 0 }] },
    { primitives: [{ attributes: { POSITION: 4, NORMAL: 5 }, indices: 6, material: 1 }] },
  ],
  materials: [
    { name: 'Interpretive terrain', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0.05, roughnessFactor: 0.92 }, doubleSided: true },
    { name: 'Primordial ocean', pbrMetallicRoughness: { baseColorFactor: [0.025, 0.07, 0.09, 0.94], metallicFactor: 0.12, roughnessFactor: 0.48 }, alphaMode: 'BLEND', doubleSided: true },
  ],
  buffers: [{ byteLength: binary.length }],
  bufferViews: [
    { buffer: 0, byteOffset: terrainPositionOffset, byteLength: terrainPositions.byteLength, target: 34962 },
    { buffer: 0, byteOffset: terrainNormalOffset, byteLength: normals.byteLength, target: 34962 },
    { buffer: 0, byteOffset: terrainColorOffset, byteLength: terrainColors.byteLength, target: 34962 },
    { buffer: 0, byteOffset: terrainIndexOffset, byteLength: terrainIndices.byteLength, target: 34963 },
    { buffer: 0, byteOffset: oceanPositionOffset, byteLength: oceanPositions.byteLength, target: 34962 },
    { buffer: 0, byteOffset: oceanNormalOffset, byteLength: oceanNormals.byteLength, target: 34962 },
    { buffer: 0, byteOffset: oceanIndexOffset, byteLength: oceanIndices.byteLength, target: 34963 },
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, count: terrainPositions.length / 3, type: 'VEC3', min: [-5, terrainMinY, -5], max: [5, terrainMaxY, 5] },
    { bufferView: 1, componentType: 5126, count: normals.length / 3, type: 'VEC3' },
    { bufferView: 2, componentType: 5126, count: terrainColors.length / 3, type: 'VEC3' },
    { bufferView: 3, componentType: 5123, count: terrainIndices.length, type: 'SCALAR', min: [0], max: [terrainPositions.length / 3 - 1] },
    { bufferView: 4, componentType: 5126, count: 4, type: 'VEC3', min: [-5, -0.055, -5], max: [5, -0.055, 5] },
    { bufferView: 5, componentType: 5126, count: 4, type: 'VEC3' },
    { bufferView: 6, componentType: 5123, count: oceanIndices.length, type: 'SCALAR', min: [0], max: [3] },
  ],
};

const json = Buffer.from(JSON.stringify(gltf));
const paddedJsonLength = Math.ceil(json.length / 4) * 4;
const paddedBinaryLength = Math.ceil(binary.length / 4) * 4;
const totalLength = 12 + 8 + paddedJsonLength + 8 + paddedBinaryLength;
const glb = Buffer.alloc(totalLength);
glb.writeUInt32LE(0x46546c67, 0);
glb.writeUInt32LE(2, 4);
glb.writeUInt32LE(totalLength, 8);
glb.writeUInt32LE(paddedJsonLength, 12);
glb.writeUInt32LE(0x4e4f534a, 16);
json.copy(glb, 20);
glb.fill(0x20, 20 + json.length, 20 + paddedJsonLength);
const binaryHeader = 20 + paddedJsonLength;
glb.writeUInt32LE(paddedBinaryLength, binaryHeader);
glb.writeUInt32LE(0x004e4942, binaryHeader + 4);
binary.copy(glb, binaryHeader + 8);

await mkdir(dirname(output), { recursive: true });
await writeFile(output, glb);
process.stdout.write(`Generated ${output} (${glb.length} bytes)\n`);
