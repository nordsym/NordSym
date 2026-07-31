import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const port = 4173;
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".vtt": "text/vtt; charset=utf-8",
  ".woff2": "font/woff2"
};
const previewHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'"
};

function targetPath(urlPath) {
  const clean = decodeURIComponent(String(urlPath || "/").split("?")[0]);
  const relative = normalize(clean).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  let target = join(root, relative);
  if (!target.startsWith(root)) return null;
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
  return target;
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);

  if (request.method === "GET" && requestUrl.pathname === "/api/availability") {
    response.writeHead(200, {
      ...previewHeaders,
      "Content-Type": "application/json; charset=utf-8"
    });
    response.end(JSON.stringify({
      preview: true,
      date: requestUrl.searchParams.get("date") || "",
      offered: ["09:30", "11:00", "14:00", "16:00"],
      busy: ["11:00"],
      capped: false
    }));
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/book") {
    response.writeHead(409, {
      ...previewHeaders,
      "Content-Type": "application/json; charset=utf-8"
    });
    response.end(JSON.stringify({
      success: false,
      error: "preview_booking_disabled"
    }));
    return;
  }

  const target = targetPath(request.url);
  if (!target || !existsSync(target) || !statSync(target).isFile()) {
    response.writeHead(404, {
      ...previewHeaders,
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    ...previewHeaders,
    "Content-Type": mime[extname(target)] || "application/octet-stream",
  });
  if (target === join(root, "book", "index.html")) {
    const previewHtml = readFileSync(target, "utf8").replace(
      'var availabilityEndpoint = "https://nordsym.app.n8n.cloud/webhook/availability";',
      'var availabilityEndpoint = "/api/availability";'
    );
    response.end(previewHtml);
    return;
  }
  createReadStream(target).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Meta E2E preview: http://127.0.0.1:${port}/output/meta-e2e-preview-2026-07-30/`);
});
