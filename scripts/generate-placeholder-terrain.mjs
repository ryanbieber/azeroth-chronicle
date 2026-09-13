import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Buffer } from 'node:buffer';
import process from 'node:process';

const output = resolve('public/models/azeroth/black-empire-map-placeholder/terrain.placeholder.glb');
const positions = new Float32Array([
  -5, 0, -5,
  5, 0, -5,
  5, 0, 5,
  -5, 0, 5,
  0, 0.35, 0,
]);
const indices = new Uint16Array([
  0, 1, 4,
  1, 2, 4,
  2, 3, 4,
  3, 0, 4,
]);
const binary = Buffer.alloc(positions.byteLength + indices.byteLength);
Buffer.from(positions.buffer).copy(binary, 0);
Buffer.from(indices.buffer).copy(binary, positions.byteLength);

const gltf = {
  asset: { version: '2.0', generator: 'Azeroth Chronicle placeholder generator' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0, name: 'Placeholder terrain' }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] }],
  materials: [{
    name: 'Archive terrain',
    pbrMetallicRoughness: { baseColorFactor: [0.09, 0.12, 0.1, 1], metallicFactor: 0.08, roughnessFactor: 0.92 },
  }],
  buffers: [{ byteLength: binary.byteLength }],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: positions.byteLength, target: 34962 },
    { buffer: 0, byteOffset: positions.byteLength, byteLength: indices.byteLength, target: 34963 },
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, count: 5, type: 'VEC3', min: [-5, 0, -5], max: [5, 0.35, 5] },
    { bufferView: 1, componentType: 5123, count: 12, type: 'SCALAR', min: [0], max: [4] },
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
