// Copies the design assets into public/ (originals in ../design stay where they are).
// Re-run with `npm run assets` after new renders land; the 24 fps loops in anim24/ win when present.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const design = fileURLToPath(new URL('../../design/', import.meta.url));
const pub = fileURLToPath(new URL('../public/', import.meta.url));
const out = (...p) => { const d = join(pub, ...p.slice(0, -1)); mkdirSync(d, { recursive: true }); return join(pub, ...p); };

// 3D icons
for (const f of readdirSync(join(design, 'icons3d/out'))) if (f.endsWith('.png')) cpSync(join(design, 'icons3d/out', f), out('icons3d', f));

// Mascot stills (idle + poses), dark and light
const blender = join(design, 'mascot3d/blender/out');
for (const theme of ['dark', 'light']) {
  cpSync(join(blender, `mascot-${theme}.png`), out('mascot', `idle-${theme}.png`));
  for (const pose of ['wave', 'peek', 'cheer', 'celebrate']) cpSync(join(blender, `pose-${pose}-${theme}.png`), out('mascot', `${pose}-${theme}.png`));
  // Arm loops: prefer the smoother 24 fps render when it has been encoded
  for (const loop of ['wave', 'celebrate']) {
    const smooth = join(blender, 'anim24', `${loop}-${theme}.webp`);
    const src = existsSync(smooth) ? join(blender, 'anim24') : join(blender, 'anim');
    cpSync(join(src, `${loop}-${theme}.webp`), out('mascot', `${loop}-${theme}.webp`));
    const still = existsSync(join(src, `${loop}-${theme}-still.png`)) ? src : join(blender, 'anim');
    cpSync(join(still, `${loop}-${theme}-still.png`), out('mascot', `${loop}-${theme}-still.png`));
    console.log(`${loop}-${theme}: ${src.endsWith('anim24') ? '24 fps' : '12 fps'} loop`);
  }
}

// Teacher photos: originals are 2-9 MB, so scale to 960 px wide for the web (ffmpeg)
for (let i = 1; i <= 4; i++) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(design, 'images', `teacher${i}.jpg`), '-vf', 'scale=960:-2', '-q:v', '4', out('images', `teacher${i}.jpg`)]);
}
console.log('assets copied to public/');
