import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
for (const page of ["index.html", "menu.html"]) {
  const path = join(siteRoot, page);
  const html = readFileSync(path, "utf8");
  const updated = html.replace(/(src|href)="([a-zA-Z0-9._/-]+\.(?:css|js))(?:\?[^"]*)?"/g, (_match, attribute, asset) => {
    const version = createHash("sha256").update(readFileSync(join(siteRoot, asset))).digest("hex").slice(0, 12);
    return `${attribute}="${asset}?v=${version}"`;
  });
  if (updated !== html) writeFileSync(path, updated);
}
console.log("CSS and JavaScript URLs now match their file contents.");
