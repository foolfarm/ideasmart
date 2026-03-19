import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  // Detect the proxy host dynamically from the first HTTP request.
  // The Manus proxy uses a subdomain like 3000-xxx.manus.computer — we need to tell
  // the Vite HMR client to connect to that host (not localhost:5173).
  let proxyHost: string | undefined;

  const serverOptions = {
    middlewareMode: true,
    hmr: { 
      server,
      // clientPort 443 + protocol wss: browser connects via the Manus HTTPS proxy
      clientPort: 443,
      protocol: 'wss',
      // host will be patched below once we know the proxy domain
    } as any,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // Patch HMR host on first request so the browser connects to the correct proxy domain
  app.use((req, _res, next) => {
    if (!proxyHost) {
      const host = req.headers['x-forwarded-host'] as string || req.headers['host'] as string;
      if (host && !host.startsWith('localhost') && !host.startsWith('127.')) {
        proxyHost = host.split(':')[0];
        // Patch the Vite HMR config so subsequent client scripts use the right host
        try {
          (vite as any).config.server.hmr.host = proxyHost;
        } catch (_) {}
      }
    }
    next();
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

  // Patch @vite/client on-the-fly to inject the correct proxy host for HMR WebSocket.
  // Vite hardcodes __HMR_HOSTNAME__=null which causes the browser to use importMetaUrl.hostname
  // from the module URL (localhost:5173) instead of the proxy domain.
  // We intercept the /@vite/client request and replace the socketHost line dynamically.
  // Compatible with Vite 5, 6, and 7 (pattern: `${null || importMetaUrl.hostname}:...`)
  app.use('/@vite/client', (req, res, next) => {
    // Priority: x-forwarded-host > Host > Referer > Origin
    // The Manus proxy may set different headers depending on configuration.
    // We try multiple sources to find the proxy domain.
    let hostname = '';

    // 1. x-forwarded-host (set by some proxies)
    const xfh = req.headers['x-forwarded-host'] as string;
    if (xfh) hostname = xfh.split(':')[0];

    // 2. Host header (set by the proxy to the proxy domain)
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
      const host = req.headers['host'] as string || '';
      const h = host.split(':')[0];
      if (h && h !== 'localhost' && h !== '127.0.0.1') hostname = h;
    }

    // 3. Referer header (browser always sends this when loading sub-resources)
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
      const referer = req.headers['referer'] as string || '';
      try {
        const refUrl = new URL(referer);
        const h = refUrl.hostname;
        if (h && h !== 'localhost' && h !== '127.0.0.1') hostname = h;
      } catch (_) {}
    }

    // 4. Origin header
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
      const origin = req.headers['origin'] as string || '';
      try {
        const originUrl = new URL(origin);
        const h = originUrl.hostname;
        if (h && h !== 'localhost' && h !== '127.0.0.1') hostname = h;
      } catch (_) {}
    }

    // 5. Use cached proxyHost from earlier requests
    if ((!hostname || hostname === 'localhost' || hostname === '127.0.0.1') && proxyHost) {
      hostname = proxyHost;
    }

    console.log(`[HMR Patch] @vite/client request - resolved hostname: ${hostname || 'none'} (host: ${req.headers['host']}, xfh: ${req.headers['x-forwarded-host']}, referer: ${req.headers['referer']})`);

    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
      return next();
    }
    // Let Vite serve the file first, then intercept the response
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    let body = '';
    let intercepted = false;

    (res as any).write = function(chunk: any, ...args: any[]) {
      if (!intercepted) {
        body += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
        return true;
      }
      return originalWrite(chunk, ...args);
    };

    (res as any).end = function(chunk?: any, ...args: any[]) {
      if (!intercepted) {
        intercepted = true;
        if (chunk) body += typeof chunk === 'string' ? chunk : chunk.toString('utf8');

        let patched = body;

        // Vite 7 pattern: `${null || importMetaUrl.hostname}:${hmrPort || importMetaUrl.port}${...}`
        // Replace the ENTIRE socketHost template literal with a hardcoded value
        patched = patched.replace(
          /`\$\{null \|\| importMetaUrl\.hostname\}:\$\{hmrPort \|\| importMetaUrl\.port\}\$\{"?\/"?\}`/g,
          `"${hostname}:443/"`
        );

        // Fallback: replace just the hostname part if full pattern didn't match
        patched = patched.replace(
          /`\$\{null \|\| importMetaUrl\.hostname\}:\$\{/g,
          `\`\${"${hostname}"}:\${`
        );

        // Vite 5/6 legacy pattern (fallback): `${null || importMetaUrl.hostname}`
        patched = patched.replace(
          /`\$\{null \|\| importMetaUrl\.hostname\}/g,
          `\`\${"${hostname}"}`
        );

        // Replace serverHost (localhost:5173/) with proxy hostname:443/
        patched = patched.replace(
          /const serverHost = "localhost:\d+\/"/g,
          `const serverHost = "${hostname}:443/"`
        );

        // Replace directSocketHost (localhost:PORT/) with proxy hostname:443/
        patched = patched.replace(
          /const directSocketHost = "localhost:\d+\/"/g,
          `const directSocketHost = "${hostname}:443/"`
        );

        const buf = Buffer.from(patched, 'utf8');
        res.setHeader('Content-Length', buf.length);
        return originalEnd(buf);
      }
      return originalEnd(chunk, ...args);
    };

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

  // File con hash nel nome (bundle JS/CSS) — cache immutable per 1 anno
  app.use('/assets', express.static(path.join(distPath, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }));

  // Altri file statici (favicon, manifest, robots) — cache 1 giorno
  app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      // index.html non deve mai essere in cache (per aggiornamenti deploy)
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
