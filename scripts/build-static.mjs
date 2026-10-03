/** Cross-platform static export for the native packages.
 * Sets NEXT_STATIC_EXPORT=1 (read by next.config.ts to switch to
 * output: "export") and then writes the root locale shim into out/. */
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const build = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: root,
  stdio: "inherit",
  env: {...process.env, NEXT_STATIC_EXPORT: "1", WRANGLER_LOG_PATH: ".wrangler/wrangler.log"},
});
if (build.status !== 0) process.exit(build.status ?? 1);

const shim = spawnSync(process.execPath, [path.join(root, "scripts", "static-entry.mjs"), "out"], {
  cwd: root,
  stdio: "inherit",
});
process.exit(shim.status ?? 0);
