// Capture a screenshot for each catalog item with a site/launch link.
// Usage: node scripts/screenshots.mjs
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { load } from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'src/data/catalog.yml');
const outDir = path.join(root, 'public/screenshots');

mkdirSync(outDir, { recursive: true });

const catalog = load(readFileSync(catalogPath, 'utf8'));
const items = catalog.items ?? [];

const targets = items
  .map((item) => {
    const url = item.links?.launch ?? item.links?.site;
    return url ? { slug: item.slug, url } : null;
  })
  .filter(Boolean);

const HIDE_COOKIE_BANNERS_CSS = `
  [id*="cookie" i], [class*="cookie" i],
  [id*="consent" i], [class*="consent" i] { display: none !important; }
`;

async function shoot(browser, { slug, url }) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  } catch (err) {
    console.warn(`[warn] navigation issue for ${slug} (${url}): ${err.message}`);
  }
  try {
    await page.addStyleTag({ content: HIDE_COOKIE_BANNERS_CSS });
  } catch {
    // no-op: page may already be closed/navigated away
  }
  await page.waitForTimeout(800);
  const outPath = path.join(outDir, `${slug}.jpg`);
  try {
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 70 });
    console.log(`[ok] ${slug} -> ${path.relative(root, outPath)}`);
  } catch (err) {
    console.warn(`[warn] screenshot failed for ${slug}: ${err.message}`);
  } finally {
    await page.close();
  }
}

const browser = await chromium.launch();
for (const target of targets) {
  await shoot(browser, target);
}
await browser.close();
