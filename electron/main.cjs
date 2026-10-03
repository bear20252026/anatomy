/* Electron main process: serves the statically exported Next.js site (out/)
 * over a custom app:// scheme so that absolute paths (/_next, /models) work
 * unchanged. Unknown paths fall back to the root locale shim instead of a
 * blank page. Responses are read with fs (asar-safe) and never set
 * Content-Encoding. */
const {app, BrowserWindow, protocol} = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const {existsSync} = require('node:fs');

const ROOT = path.join(__dirname, '..', 'out');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.txt': 'text/plain; charset=utf-8',
};

protocol.registerSchemesAsPrivileged([
  {scheme: 'app', privileges: {standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true}},
]);

function inside(file) {
  return file === ROOT || file.startsWith(ROOT + path.sep);
}

/** Try exact path, extensionless .html, directory index — then the shim. */
async function resolve(pathname) {
  const candidates = pathname.endsWith('/')
    ? [pathname + 'index.html']
    : [pathname, pathname + '.html', pathname + '/index.html'];
  for (const candidate of candidates) {
    const file = path.normalize(path.join(ROOT, candidate));
    if (inside(file) && existsSync(file)) return file;
  }
  const fallback = path.join(ROOT, 'index.html');
  return existsSync(fallback) ? fallback : null;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 360,
    minHeight: 500,
    backgroundColor: '#f7f0e7',
    autoHideMenuBar: true,
    webPreferences: {contextIsolation: true, nodeIntegration: false, sandbox: true},
  });
  win.loadURL('app://bundle/');
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  return win;
}

app.whenReady().then(() => {
  protocol.handle('app', async (request) => {
    try {
      const url = new URL(request.url);
      const pathname = decodeURIComponent(url.pathname);
      const file = await resolve(pathname);
      if (!file) return new Response('Not found', {status: 404});
      const body = await fs.readFile(file);
      const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
      return new Response(body, {headers: {'Content-Type': type, 'Cache-Control': 'no-cache'}});
    } catch {
      return new Response('Not found', {status: 404});
    }
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
