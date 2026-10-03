/** Write the static site's root entry after `NEXT_STATIC_EXPORT=1 next build`.
 *
 * Static export has no page at "/" (and redirects() is unavailable in export
 * mode), so Electron, Capacitor, and plain static hosts boot through this file.
 * It routes "/" to the best locale for the platform, and rescues hard
 * navigations like "/zh" when a server falls back to index.html instead of
 * resolving the locale directory.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";

const outDir = process.argv[2] ?? "out";
const locales = ["en", "es", "hi", "zh", "ar", "pt", "fr", "de", "ja", "ru", "id", "ko"];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Anatomy Atelier</title>
<script>
(function () {
  var locales = ${JSON.stringify(locales)};
  var path = location.pathname;
  var match = path.match(/^\\/([a-z]{2})(?:\\/|\\.html)?(?:$|\\/)/);
  var target;
  if (match && locales.indexOf(match[1]) !== -1) {
    // Asked for a locale (e.g. "/zh") but got this shim: go to its real entry.
    target = "/" + match[1] + "/index.html";
    if (path === target) return; // never loop
  } else {
    var lang = (navigator.language || "en").toLowerCase().slice(0, 2);
    target = "/" + (locales.indexOf(lang) !== -1 ? lang : "en") + "/index.html";
  }
  location.replace(target);
})();
</script>
</head>
<body>
<noscript>
<ul>
<li><a href="/en/index.html">English</a></li>
<li><a href="/es/index.html">Español</a></li>
<li><a href="/hi/index.html">हिन्दी</a></li>
<li><a href="/zh/index.html">中文</a></li>
<li><a href="/ar/index.html">العربية</a></li>
<li><a href="/pt/index.html">Português</a></li>
<li><a href="/fr/index.html">Français</a></li>
<li><a href="/de/index.html">Deutsch</a></li>
<li><a href="/ja/index.html">日本語</a></li>
<li><a href="/ru/index.html">Русский</a></li>
<li><a href="/id/index.html">Indonesia</a></li>
<li><a href="/ko/index.html">한국어</a></li>
</ul>
</noscript>
</body>
</html>
`;

mkdirSync(outDir, {recursive: true});
writeFileSync(join(outDir, "index.html"), html);
console.log(`wrote locale entry ${join(outDir, "index.html")}`);
