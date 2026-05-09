/**
 * Compose app/page.tsx and app/layout.tsx for the generated project.
 *
 * The composer is the only piece that needs to know how to stitch
 * library imports + slot content into valid TSX. Everything else
 * (fixed templates, source files) is mechanical copy.
 */

import type { Project } from "../project/types";
import type { ProjectPlan, PlanSection } from "../project/types";
import type { ComponentManifest } from "../types";
import { sanitizeSectionContent } from "./sanitize";

/** Generate app/layout.tsx — wraps everything in <LibraryRoot> with the chosen theme. */
export function composeLayout(project: Project, plan: ProjectPlan): string {
  const businessName = escapeJsx(project.form.business.name || "Site");
  const description = escapeJsx(
    project.form.business.what?.slice(0, 160) || "Built with Flowwwzy"
  );

  return `import type { Metadata } from "next";
import "./globals.css";
import LibraryRoot from "@/components/library/_lib/LibraryRoot";

export const metadata: Metadata = {
  title: ${JSON.stringify(businessName)},
  description: ${JSON.stringify(description)},
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <LibraryRoot palette=${JSON.stringify(plan.paletteId)} fontPair=${JSON.stringify(plan.fontPair)}>
          {children}
        </LibraryRoot>
      </body>
    </html>
  );
}
`;
}

/**
 * Generate app/page.tsx — imports each block referenced in the plan,
 * declares typed content constants, renders them in order.
 */
export function composePage(plan: ProjectPlan, manifests: ComponentManifest[]): string {
  const imports: string[] = [];
  const contentDecls: string[] = [];
  const elements: string[] = [];

  plan.sections.forEach((section, i) => {
    const manifest = manifests.find((m) => m.id === section.manifestId);
    if (!manifest) {
      // Skip silently — operator should validate the plan before generating.
      // We emit a comment so the absence is visible in the output.
      elements.push(`      {/* unknown block: ${section.manifestId} */}`);
      return;
    }

    const componentName = uniqueComponentName(manifest, i);
    const contentVar = `block${i}_${camelize(manifest.id)}`;
    const importPath = "@/" + manifest.filePath.replace(/\.tsx$/, "");

    const safeContent = sanitizeSectionContent(
      section.manifestId,
      (section.content as Record<string, unknown>) || {}
    );
    imports.push(`import ${componentName} from ${JSON.stringify(importPath)};`);
    contentDecls.push(
      `const ${contentVar} = ${JSON.stringify(safeContent, null, 2)};`
    );
    elements.push(`      <${componentName} {...${contentVar}} />`);
  });

  return `${imports.join("\n")}

${contentDecls.join("\n\n")}

export default function Page() {
  return (
    <>
${elements.join("\n")}
    </>
  );
}
`;
}

// ─── helpers ──────────────────────────────────────────────────────────

function uniqueComponentName(manifest: ComponentManifest, idx: number): string {
  // Convert kebab/snake → PascalCase, suffix with idx so duplicates don't clash.
  const base = manifest.id
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return `${base}${idx}`;
}

function camelize(s: string): string {
  return s.replace(/[-_](.)/g, (_, c: string) => c.toUpperCase());
}

function escapeJsx(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" } as Record<string, string>)[c] || c);
}
