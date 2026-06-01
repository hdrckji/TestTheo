const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  // On ignore la query string (?region=...) pour résoudre le fichier
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  // Sécurité : empêche la traversée de répertoire
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  serveFile(filePath, res);
});

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Si le fichier n'existe pas et n'a pas d'extension, on tente d'ajouter .html
      // (ex: /region -> /region.html). Gère les redirections "clean URLs" en cache.
      if (!path.extname(filePath)) {
        return fs.readFile(filePath + ".html", (err2, data2) => {
          if (err2) {
            res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
            return res.end("<h1>404 - Page introuvable</h1>");
          }
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(data2);
        });
      }
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>404 - Page introuvable</h1>");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
