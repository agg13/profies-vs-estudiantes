// Servidor alternativo para equipos que tienen Node.js pero no Python.
// No forma parte de la lógica del videojuego.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = 8000;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg'
};

http.createServer((request, response) => {
  const requested = decodeURIComponent(request.url.split('?')[0]);
  const relative = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
  const filePath = path.resolve(root, relative);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Acceso no permitido');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Archivo no encontrado');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream'
    });
    response.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Servidor listo en http://localhost:${port}`);
  console.log('Presiona Ctrl+C para detenerlo.');
});
