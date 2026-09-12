// Renders public/og.png (1200x630) from profile.yml using the site's palette.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';

const profile = load(readFileSync('src/data/profile.yml', 'utf8'));
const photo = readFileSync('public/photo-512.jpg').toString('base64');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;width:1200px;height:630px;font-family:Inter,Segoe UI,system-ui,sans-serif;background:linear-gradient(135deg,#F4F6F8 0%,#FFFFFF 60%);color:#0B2545;display:flex;align-items:center;justify-content:space-between;padding:0 88px;box-sizing:border-box}
  h1{font-size:76px;margin:0;letter-spacing:-0.03em;font-weight:700}
  .k{font-size:34px;color:#0E9F8E;margin:14px 0 26px;font-weight:600}
  .a{font-size:24px;color:#64748B;line-height:1.35;max-width:640px}
  .u{position:absolute;left:88px;bottom:44px;font-size:22px;color:#94A3B8}
  img{width:300px;height:300px;border-radius:50%;box-shadow:0 12px 40px rgba(11,37,69,.18)}
  .bar{position:absolute;left:0;top:0;width:100%;height:10px;background:linear-gradient(90deg,#0B2545,#0E9F8E)}
</style></head><body><div class="bar"></div>
<div><h1>${profile.name}</h1><div class="k">${profile.tagline}</div>
<div class="a">${profile.title}, ${profile.affiliation}<br>${profile.affiliation_secondary ?? ''}</div>
<div class="u">sufyansuleman.github.io</div></div>
<img src="data:image/jpeg;base64,${photo}"></body></html>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html); await p.screenshot({ path: 'public/og.png' }); await b.close(); console.log('public/og.png written');
