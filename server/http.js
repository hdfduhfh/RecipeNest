/* Local website and server-side AI gateway. Never serve server code or secrets. */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { validateRequest, makeContext } = require('./chat');
const { loadConfig, configured, generate } = require('./provider');
const root = path.join(__dirname, '..');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.md': 'text/plain; charset=utf-8',
};
function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(data));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0,
      failed = false;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 64000) {
        if (!failed) reject(Object.assign(new Error('Too large'), { status: 413 }));
        failed = true;
      } else if (!failed) chunks.push(chunk);
    });
    req.on('end', () => {
      if (!failed) {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new Error('Invalid JSON'));
        }
      }
    });
    req.on('error', reject);
  });
}
function sameSite(req) {
  const port = req.socket.localPort;
  const origins = [`http://127.0.0.1:${port}`, `http://localhost:${port}`];
  return (
    origins.includes('http://' + req.headers.host) &&
    (!req.headers.origin || origins.includes(req.headers.origin)) &&
    !['cross-site', 'same-site'].includes(req.headers['sec-fetch-site'])
  );
}
function createServer(options = {}) {
  const config = options.config || loadConfig(root);
  const ask = options.generate || generate;
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/recipes.json'), 'utf8'));
  let active = 0,
    attempts = [];
  return http.createServer(async (req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }
    if (pathname.startsWith('/api/')) {
      if (!sameSite(req)) {
        json(res, 403, { error: 'Request must come from this local website.' });
        return;
      }
      if (pathname === '/api/chat/status' && req.method === 'GET') {
        json(res, 200, { configured: configured(config) });
        return;
      }
      if (pathname !== '/api/chat') {
        json(res, 404, { error: 'Not found' });
        return;
      }
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        json(res, 405, { error: 'Use POST.' });
        return;
      }
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) {
        json(res, 415, { error: 'Use JSON.' });
        return;
      }
      if (!configured(config)) {
        json(res, 503, { error: 'AI is not configured. Use the recipe guide.' });
        return;
      }
      attempts = attempts.filter((time) => Date.now() - time < 60000);
      if (active >= 2 || attempts.length >= 12) {
        res.setHeader('Retry-After', '60');
        json(res, 429, { error: 'Please wait before asking again.' });
        return;
      }
      let request;
      try {
        request = validateRequest(await readBody(req), data.recipes);
      } catch (error) {
        json(res, error.status || 400, { error: 'Invalid chat request.' });
        return;
      }
      // Recheck after the body arrives: simultaneous slow requests must share the same limit.
      attempts = attempts.filter((time) => Date.now() - time < 60000);
      if (active >= 2 || attempts.length >= 12) {
        res.setHeader('Retry-After', '60');
        json(res, 429, { error: 'Please wait before asking again.' });
        return;
      }
      attempts.push(Date.now());
      active += 1;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 40000);
      res.on('close', () => {
        if (!res.writableEnded) controller.abort();
      });
      try {
        const context = makeContext(data, request);
        const answer = await ask(config, context, request, controller.signal);
        if (typeof answer !== 'string' || !answer.trim()) throw new Error('Empty response');
        if (!res.destroyed)
          json(res, 200, {
            answer: answer.slice(0, 16000),
            recipeIds: context.recipeIds,
            mode: 'ai',
          });
      } catch {
        if (!res.destroyed)
          json(res, 502, { error: 'AI unavailable. Retry or use the recipe guide.' });
      } finally {
        clearTimeout(timer);
        active -= 1;
      }
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    const allowed =
      pathname === '/' ||
      pathname === '/index.html' ||
      /^\/(?:assets|css|js|data|templates|docs)\//.test(pathname);
    const segments = pathname.split(/[\\/]/);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (
      !allowed ||
      segments.some((part) => part.startsWith('.') || part.includes(':')) ||
      !file.startsWith(root + path.sep) ||
      !types[path.extname(file).toLowerCase()]
    ) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(file).toLowerCase()],
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'same-origin',
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const stream = fs.createReadStream(file);
      stream.on('error', () => res.destroy());
      stream.pipe(res);
    });
  });
}
function main() {
  const port = Number(process.env.PORT || 4175),
    server = createServer();
  server.on('error', (error) => {
    console.error(`Cannot start RecipeNest (${error.code}). Try another PORT.`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () =>
    console.log(
      `RecipeNest: http://127.0.0.1:${port}\nPress Ctrl+C to stop. See CHATBOT-SETUP.md to connect AI.`
    )
  );
}
module.exports = { createServer, main };
