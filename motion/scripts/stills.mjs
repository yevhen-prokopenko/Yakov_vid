// Renders review stills: node scripts/stills.mjs <outDir> <sec,sec,...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [outDir, secs] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const id of ['Dynamic', 'Calm']) {
  const composition = await selectComposition({serveUrl, id});
  for (const s of secs.split(',').map(Number)) {
    const frame = Math.round(s * 30) - (id === 'Dynamic' ? 25 : 0);
    await renderStill({serveUrl, composition, frame, output: path.join(outDir, `${id}_${String(s).padStart(5, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 85});
  }
  console.log(id, 'done');
}
