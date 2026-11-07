import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'dist');
const productionEntries = [
  'index.html',
  'module-two-preview.html',
  'styles.css',
  'src',
  'public',
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of productionEntries) {
  await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
}

console.log(`Production files copied to ${output}`);
