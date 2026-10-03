import type { NextConfig } from "next";
import { defaultLocale } from "./app/i18n/config";

// NEXT_STATIC_EXPORT=1 builds a fully static site for the desktop (Electron)
// and mobile (Capacitor) packages. Static export cannot use redirects(), so
// the root "/" hand-off lives in the locale shim written by
// scripts/static-entry.mjs. The default pipeline (Vercel / vinext) is unchanged.
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      // Directory-style URLs (en/index.html) so every static server —
      // Electron's app:// handler, Capacitor's asset server, plain hosts —
      // resolves /{locale}/ without extension guessing.
      trailingSlash: true,
    }
  : {
      // Every route lives under /[locale], so `app/[locale]/layout.tsx` is the root
      // layout and there is no page at `/`. Send bare visits to the default
      // language. (Accept-Language negotiation would need middleware, which the
      // Cloudflare/vinext target does not run — the in-app switcher covers it.)
      async redirects() {
        return [{ source: "/", destination: `/${defaultLocale}`, permanent: false }];
      },
    };

export default nextConfig;
