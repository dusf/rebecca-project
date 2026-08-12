const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = {
  html: 'text/html', css: 'text/css', js: 'application/javascript',
  png: 'image/png', svg: 'image/svg+xml', json: 'application/json'
};
const root = process.cwd();
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') u = '/shop/index.html';
  const f = path.join(root, u);
  fs.readFile(f, (e, d) => {
    if (e) { res.statusCode = 404; res.end('404'); return; }
    res.setHeader('Content-Type', mime[path.extname(f).slice(1)] || 'text/plain');
    res.end(d);
  });
}).listen(8080, () => console.log('server up on 8080'));
