/**
 * Loads library source files from disk at runtime.
 *
 * Works in Vercel functions because next.config.js sets
 * outputFileTracingIncludes for the generate route — Next.js bundles
 * the library source alongside the function.
 *
 * Provides one function per piece the generator needs:
 *   loadBlockSource(filePath)    → "use client"; ...React component...
 *   loadHelperSource(name)       → LibraryRoot, Container, etc.
 *   loadLibraryCss()             → app/library.css contents (token vars)
 */

import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();

/**
 * Read a library block by its manifest filePath
 * (e.g. "components/library/heroes/HeroCenteredDisplay.tsx").
 */
export async function loadBlockSource(filePath: string): Promise<string> {
  const abs = path.join(ROOT, filePath);
  return fs.readFile(abs, "utf8");
}

/** Helpers shared by all blocks (LibraryRoot, Container primitives). */
export async function loadHelperSources(): Promise<Record<string, string>> {
  const helpers = [
    "components/library/_lib/LibraryRoot.tsx",
    "components/library/_lib/Container.tsx",
  ];
  const out: Record<string, string> = {};
  await Promise.all(
    helpers.map(async (rel) => {
      out[rel] = await fs.readFile(path.join(ROOT, rel), "utf8");
    })
  );
  return out;
}

/** Token CSS file (palette swatches + font vars). */
export async function loadLibraryCss(): Promise<string> {
  return fs.readFile(path.join(ROOT, "app/library.css"), "utf8");
}
