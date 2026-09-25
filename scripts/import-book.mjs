// Import an authored book HTML into public/books/<slug>/ for the site.
// Copies the referenced images, rewrites their paths, and applies the
// site-side patches the source file does not carry: Urdu web font,
// Nastaliq line heights, analytics and the read counter.
//
// Usage: node scripts/import-book.mjs
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';
import { load } from 'js-yaml';

const books = [
  {
    slug: 'mizaj-shanasi',
    src: 'C:/HE_Sufyan/my_Books/mezaj_shenasi/publishing/mizaj-shanasi-urdu.html',
    assetsRoot: 'C:/HE_Sufyan/my_Books/mezaj_shenasi/assets',
    lang: 'ur',
    // "N readers"; {n} is replaced with the count of unique visitors
    counterLabel: '{n} قارئین'
  }
];

const profile = load(await readFile('src/data/profile.yml', 'utf8'));
const GOAT = profile.analytics?.goatcounter ?? '';

for (const book of books) {
  const outDir = join('public', 'books', book.slug);
  let html = await readFile(book.src, 'utf8');

  // images: ../assets/chapter-01/sketches/x.jpeg -> images/chapter-01/x.jpeg
  const refs = [...html.matchAll(/\.\.\/assets\/(chapter-\d+)\/sketches\/([^"']+)/g)];
  for (const [, chapter, file] of refs) {
    const dest = join(outDir, 'images', chapter, basename(file));
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(join(book.assetsRoot, chapter, 'sketches', file), dest);
  }
  html = html.replace(/\.\.\/assets\/(chapter-\d+)\/sketches\//g, 'images/$1/');

  // Urdu web font, so the book reads the same without local fonts installed
  html = html.replace(
    '  <style>',
    `  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet" />
  <style>`
  );
  html = html.replace(
    /font-family: "PreviewUrdu",/,
    'font-family: "Noto Nastaliq Urdu", "PreviewUrdu",'
  );

  // Nastaliq is a tall script and the source styles are set for a fallback
  // font, so lines collide once the web font swaps in. These overrides are
  // appended last, after the source CSS, so they win without touching it.
  html = html.replace(
    '</head>',
    `  <style>
    body { line-height: 2.1; }
    h1 { font-size: clamp(2rem, 4vw, 3rem); line-height: 1.75; }
    h2, h3, h4 { line-height: 1.85; }
    h2 { margin-top: 1.6em; }
    p, li, dd, dt, td, th, blockquote, figcaption { line-height: 2.1; }
    .subtitle, .meta-value, .eyebrow, .footer-note { line-height: 2; }
    article { line-height: 2.15; }
    .image-card figcaption { line-height: 1.95; }
    .read-count { margin: 28px 0 8px; text-align: center; color: var(--muted); font-size: 0.95rem; }
    @media (max-width: 720px) {
      article { line-height: 2.15; }
      h1 { line-height: 1.8; }
    }
  </style>
</head>`
  );

  // analytics and read count
  if (GOAT) {
    const path = `/books/${book.slug}/`;
    html = html.replace(
      '</body>',
      `  <p class="read-count" id="read-count" hidden></p>
  <script>
    (function () {
      var el = document.getElementById('read-count');
      fetch('https://${GOAT}.goatcounter.com/counter/' + encodeURIComponent('${path}') + '.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (d) {
          var n = Number(String(d.count_unique || d.count).replace(/[^0-9]/g, ''));
          if (!isFinite(n) || n < 1) return;
          el.textContent = ${JSON.stringify(book.counterLabel)}.replace('{n}', n.toLocaleString('${book.lang}'));
          el.hidden = false;
        })
        .catch(function () {});
    })();
  </script>
  <script data-goatcounter="https://${GOAT}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>`
    );
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), html);
  console.log(`${book.slug}: ${refs.length} images, ${(html.length / 1024).toFixed(0)} KB`);
}
