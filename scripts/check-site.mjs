import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = join(projectRoot, "dist");
let itemCount = 0;
let mediaCount = 0;

function checkReference(value, fromFile) {
  if (!value || /^(?:[a-z]+:|\/\/|#)/i.test(value)) return;
  const cleanPath = decodeURIComponent(value.split(/[?#]/)[0]);
  const absolutePath = resolve(dirname(fromFile), cleanPath);
  const sitePath = relative(siteRoot, absolutePath);
  assert.ok(sitePath !== ".." && !sitePath.startsWith(".." + "/") &&
    !sitePath.startsWith(".." + "\\") && !isAbsolute(sitePath),
  `Reference outside dist in ${relative(siteRoot, fromFile)}`);
  assert.ok(existsSync(absolutePath), `Missing file ${value} in ${relative(siteRoot, fromFile)}`);
}

for (const file of readdirSync(siteRoot)) {
  const absolutePath = join(siteRoot, file);
  if (!statSync(absolutePath).isFile()) continue;
  const source = readFileSync(absolutePath, "utf8");
  if (file.endsWith(".js")) {
    const result = spawnSync(process.execPath, ["--check", absolutePath], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || `Invalid JavaScript in ${file}`);
  }
  if (file.endsWith(".html")) {
    for (const [, value] of source.matchAll(/\b(?:src|href|poster|data-src|data-mobile-src|data-desktop-src|srcset)="([^"]*)"/g)) {
      checkReference(value, absolutePath);
    }
  }
  if (file.endsWith(".css")) {
    for (const [, value] of source.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      checkReference(value, absolutePath);
    }
  }
}

const menuPath = join(siteRoot, "menu-data.js");
const context = { window: {} };
vm.runInNewContext(readFileSync(menuPath, "utf8"), context, { timeout: 1000 });
const menu = context.window.ANGELS_MENU;
assert.equal(menu?.currency, "PLN", "Menu currency must be PLN");

function checkItems(items, location) {
  assert.ok(Array.isArray(items), `Items must be an array in ${location}`);
  for (const item of items) {
    assert.ok(typeof item.name === "string" && item.name.trim(), `Missing name in ${location}`);
    assert.ok(Array.isArray(item.prices) && item.prices.length, `Missing prices for ${item.name}`);
    for (const price of item.prices) {
      assert.ok(Number.isFinite(price.value) && price.value >= 0, `Invalid price for ${item.name}`);
      assert.ok(price.label == null || typeof price.label === "string", `Invalid price label for ${item.name}`);
    }
    for (const field of ["image", "video"]) {
      if (!item[field]) continue;
      assert.equal(typeof item[field], "string", `Invalid ${field} for ${item.name}`);
      assert.ok(item[field].startsWith("assets/"), `Use a local asset for ${item.name}`);
      checkReference(item[field], menuPath);
      mediaCount++;
    }
    if (item.video) {
      assert.ok(item.image, `Missing video poster for ${item.name}`);
      assert.ok(item.video.endsWith(".mp4"), `Use an MP4 video for ${item.name}`);
    }
    itemCount++;
  }
}

for (const section of ["bar", "kitchen"]) {
  const groups = menu[section]?.groups;
  assert.ok(Array.isArray(groups), `Missing groups in ${section}`);
  const keys = new Set();
  for (const group of groups) {
    assert.ok(typeof group.key === "string" && /[a-z0-9]/i.test(group.key), `Missing category key in ${section}`);
    const slug = group.key.toLowerCase().replace(/&/g, "-and-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    assert.ok(!keys.has(slug), `Duplicate category key in ${section}: ${group.key}`);
    keys.add(slug);
    assert.ok(typeof group.title === "string" && group.title.trim(), `Missing category title for ${group.key}`);
    assert.ok(Array.isArray(group.subgroups), `Missing subgroups for ${group.key}`);
    group.subgroups.forEach((subgroup) => checkItems(subgroup.items, group.key));
  }
}
checkItems(menu.hookah?.items, "hookah");
console.log(`Site check passed. ${itemCount} menu positions and ${mediaCount} media references checked.`);
