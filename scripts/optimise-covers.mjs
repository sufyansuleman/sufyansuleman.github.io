// Converts public/covers/*.png to compressed .jpg (quality 82, max width 1600) and removes the PNG.
import sharp from 'sharp';
import { readdir, unlink } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const DIR = new URL('../public/covers/', import.meta.url);
const dirPath = new URL(DIR).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const files = (await readdir(dirPath)).filter((f) => extname(f).toLowerCase() === '.png');

for (const file of files) {
  const src = join(dirPath, file);
  const dest = join(dirPath, `${basename(file, extname(file))}.jpg`);
  await sharp(src)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toFile(dest);
  await unlink(src);
  console.log(`${file} -> ${basename(dest)}`);
}
