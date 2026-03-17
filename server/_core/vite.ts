import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // Intercept Vite's 504 "Outdated Optimize Dep" responses and convert them to a
  // JS reload script. Must be placed BEFORE vite.middlewares so we can wrap res.writeHead
  // and res.end before Vite calls them.
  app.use((req, res, next) => {
    const isViteAsset =
      req.url?.includes('/node_modules/.vite/') ||
      req.url?.startsWith('/@fs/') ||
      req.url?.startsWith('/@vite/') ||
      req.url?.startsWith('/src/');

    if (isViteAsset) {
      const RELOAD_SCRIPT = 'if(typeof window!=="undefined"){console.warn("[IdeaSmart] Stale bundle, reloading...");setTimeout(()=>window.location.reload(),50);}';
      const RELOAD_LEN = Buffer.byteLength(RELOAD_SCRIPT, 'utf8');

      // Intercept res.statusCode setter — Vite sets statusCode=504 directly (not via writeHead)
      // We use Object.defineProperty to intercept this assignment.
      let _statusCode = res.statusCode;
      const proto = Object.getPrototypeOf(res);
      try {
        Object.defineProperty(res, 'statusCode', {
          get() { return _statusCode; },
          set(code: number) {
            _statusCode = code;
            if (code === 504) {
              // Redirect to 200 and prepare reload script headers
              _statusCode = 200;
              res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
              res.setHeader('Content-Length', RELOAD_LEN);
            }
          },
          configurable: true,
        });
      } catch (_) {
        // defineProperty may fail in some environments; fall back gracefully
      }

      // Override Cache-Control for all Vite dev modules
      const originalSetHeader = res.setHeader.bind(res);
      (res as any).setHeader = function(name: string, value: any) {
        if (name.toLowerCase() === 'cache-control') {
          return originalSetHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        }
        return originalSetHeader(name, value);
      };

      // Intercept res.end — when Vite calls end() after setting statusCode=504,
      // we serve the reload script instead of the empty body.
      const originalEnd = res.end.bind(res);
      (res as any).end = function(chunk?: any, ...args: any[]) {
        // Check if this was originally a 504 (now remapped to 200)
        // We detect it by checking if Content-Type is our JS type and chunk is empty
        const ct = res.getHeader('Content-Type');
        const isStale = ct === 'application/javascript; charset=utf-8' && 
                        (!chunk || chunk === '' || (Buffer.isBuffer(chunk) && chunk.length === 0));
        if (isStale) {
          return originalEnd(RELOAD_SCRIPT, 'utf8');
        }
        return originalEnd(chunk, ...args);
      };
    }
    next();
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      // Inject the current Vite browserHash as the epoch for stale-bundle detection.
      // When Vite regenerates deps (new hash), the browser will detect the mismatch
      // via sessionStorage and force a hard reload before React loads.
      let viteEpoch = 'dev';
      try {
        const metaPath = path.resolve(import.meta.dirname, '../..', 'node_modules/.vite/deps/_metadata.json');
        if (fs.existsSync(metaPath)) {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          viteEpoch = meta.browserHash || meta.hash || 'dev';
        }
      } catch (_) {}
      template = template.replace('__VITE_EPOCH__', viteEpoch);

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 
        "Content-Type": "text/html",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
