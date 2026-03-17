import type { Plugin, ResolvedConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface PrerenderOptions {
  routes: string[];
  /** 等待页面渲染的时间（毫秒），默认 5000 */
  renderAfterTime?: number;
  /** 预渲染用的本地服务端口，默认 8789 */
  port?: number;
  /**
   * API 代理配置，将匹配前缀的请求转发到目标服务器。
   * 例如: { '/api': 'http://localhost:8080' }
   */
  proxy?: Record<string, string>;
}

function createProxyHandler(proxyMap: Record<string, string>) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
    const url = req.url || '';
    for (const [prefix, target] of Object.entries(proxyMap)) {
      if (url.startsWith(prefix)) {
        const targetUrl = `${target}${url}`;
        try {
          const { default: http } = await import(target.startsWith('https') ? 'node:https' : 'node:http');
          const proxyReq = http.request(targetUrl, { method: req.method, headers: req.headers }, (proxyRes: IncomingMessage) => {
            res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
            proxyRes.pipe(res);
          });
          proxyReq.on('error', () => {
            res.writeHead(502);
            res.end('Proxy error');
          });
          req.pipe(proxyReq);
        } catch {
          res.writeHead(502);
          res.end('Proxy error');
        }
        return true;
      }
    }
    return false;
  };
}

export function setupPrerender(options: PrerenderOptions): Plugin {
  let config: ResolvedConfig;
  const { routes, renderAfterTime = 5000, port = 8789, proxy = {} } = options;

  return {
    name: 'vite-plugin-custom-prerender',
    apply: 'build',
    enforce: 'post',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async closeBundle() {
      if (routes.length === 0) return;

      const outDir = path.isAbsolute(config.build.outDir)
        ? config.build.outDir
        : path.resolve(config.root, config.build.outDir);

      const indexHtml = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexHtml)) {
        console.warn('[prerender] index.html not found, skipping prerender.');
        return;
      }

      console.log(`\n[prerender] Starting prerender for ${routes.length} route(s)...`);

      const { createServer } = await import('node:http');
      const { default: puppeteer } = await import('puppeteer');

      const handleProxy = createProxyHandler(proxy);

      const server = createServer(async (req, res) => {
        if (await handleProxy(req, res)) return;

        let filePath = path.join(outDir, req.url?.split('?')[0] || '/');

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = indexHtml;
        }

        const ext = path.extname(filePath);
        const mimeTypes: Record<string, string> = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
        };

        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      });

      await new Promise<void>((resolve) => {
        server.listen(port, resolve);
      });

      try {
        const browser = await puppeteer.launch({ headless: true });

        for (const route of routes) {
          console.log(`[prerender] Rendering: ${route}`);
          const page = await browser.newPage();

          try {
            await page.goto(`http://localhost:${port}${route}`, {
              waitUntil: 'domcontentloaded',
              timeout: 60000
            });
          } catch (e) {
            console.warn(`[prerender] Navigation warning for ${route}:`, (e as Error).message);
          }

          if (renderAfterTime > 0) {
            await new Promise(r => setTimeout(r, renderAfterTime));
          }

          const html = await page.content();
          await page.close();

          const outputPath = path.join(outDir, route, 'index.html');
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, html, 'utf-8');
          console.log(`[prerender] Saved: ${path.relative(outDir, outputPath)}`);
        }

        await browser.close();
      } finally {
        server.close();
      }

      console.log('[prerender] Done.\n');
    }
  };
}
