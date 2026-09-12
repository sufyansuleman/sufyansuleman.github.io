// Dev QA: screenshot built pages from dist/ at desktop + mobile widths.
// Usage: node scripts/shoot.mjs [route ...]   (default: all)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = 'dist';
const OUT = process.env.SHOOT_OUT ?? 'qa';
const routes = process.argv.slice(2).length ? process.argv.slice(2)
  : ['/', '/about/', '/tools/', '/apps/', '/courses/', '/publications/', '/data/', '/projects/', '/cv/', '/contact/'];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml' };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  try {
    const body = await readFile(join(DIST, p));
    res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nf'); }
}).listen(0);
const port = server.address().port;

const { mkdir } = await import('node:fs/promises');
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp });
  for (const r of routes) {
    await page.goto(`http://localhost:${port}${r}`, { waitUntil: 'networkidle' });
    const name = r === '/' ? 'home' : r.replaceAll('/', '');
    await page.screenshot({ path: `${OUT}/${name}-${label}.png`, fullPage: true });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > vp.width) console.warn(`OVERFLOW ${r} @${label}: scrollWidth ${sw}`);
  }
  await page.close();
}
await browser.close();
server.close();
console.log(`done → ${OUT}/`);
