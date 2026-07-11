#!/usr/bin/env node
/**
 * Regenerate PWA icons + browser favicons from public/app-icon-dark.png
 * and public/app-icon-light.png.
 *
 * Sources may be exported with a flat black (or light) matte — edge flood-fill
 * restores a true alpha channel so in-app logos blend with the UI.
 *
 * Usage: npm run pwa:icons
 */
import { copyFileSync, existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const publicDir = join(root, "public");
const appDir = join(root, "app");

const sources = {
  dark: join(publicDir, "app-icon-dark.png"),
  light: join(publicDir, "app-icon-light.png"),
};

for (const path of Object.values(sources)) {
  if (!existsSync(path)) {
    console.error(`Missing ${path}`);
    process.exit(1);
  }
}

/** Remove solid matte connected to image edges (restores intended transparency). */
function removeEdgeMatte({ data, width, height, channels }, tolerance = 24) {
  const bg = [data[0], data[1], data[2]];
  const alpha = new Uint8Array(width * height).fill(255);
  const visited = new Uint8Array(width * height);
  const queue = [];
  let head = 0;

  const matchesMatte = (idx) => {
    const i = idx * channels;
    return (
      Math.abs(data[i] - bg[0]) <= tolerance &&
      Math.abs(data[i + 1] - bg[1]) <= tolerance &&
      Math.abs(data[i + 2] - bg[2]) <= tolerance
    );
  };

  const visit = (idx) => {
    if (idx < 0 || idx >= width * height || visited[idx]) return;
    if (!matchesMatte(idx)) return;
    visited[idx] = 1;
    alpha[idx] = 0;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    visit(x);
    visit((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    visit(y * width);
    visit(y * width + width - 1);
  }

  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) visit(idx - 1);
    if (x < width - 1) visit(idx + 1);
    if (y > 0) visit(idx - width);
    if (y < height - 1) visit(idx + width);
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let idx = 0; idx < width * height; idx += 1) {
    const si = idx * channels;
    const di = idx * 4;
    rgba[di] = data[si];
    rgba[di + 1] = data[si + 1];
    rgba[di + 2] = data[si + 2];
    rgba[di + 3] = alpha[idx];
  }

  return rgba;
}

async function loadTransparentSource(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels === 4) {
    let transparentPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) transparentPixels += 1;
    }
    if (transparentPixels > 0) {
      return sharp(sourcePath).ensureAlpha();
    }
  }

  const rgba = removeEdgeMatte({
    data,
    width: info.width,
    height: info.height,
    channels: info.channels,
  });

  return sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

async function writeTransparentMaster(sourcePath, destPath) {
  const image = await loadTransparentSource(sourcePath);
  const buffer = await image.png().toBuffer();
  writeFileSync(destPath, buffer);
}

async function resizeTransparent(sourcePath, size) {
  const image = await loadTransparentSource(sourcePath);
  return image
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png();
}

/** Build a multi-size .ico whose entries store PNG payloads. */
function buildPngIco(entries) {
  const count = entries.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;

  const directory = Buffer.alloc(headerSize);
  directory.writeUInt16LE(0, 0);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(count, 4);

  for (let i = 0; i < count; i += 1) {
    const { size, png } = entries[i];
    const entryOffset = 6 + i * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, entryOffset);
    directory.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);
    directory.writeUInt8(0, entryOffset + 2);
    directory.writeUInt8(0, entryOffset + 3);
    directory.writeUInt16LE(1, entryOffset + 4);
    directory.writeUInt16LE(32, entryOffset + 6);
    directory.writeUInt32LE(png.length, entryOffset + 8);
    directory.writeUInt32LE(offset, entryOffset + 12);
    offset += png.length;
  }

  return Buffer.concat([directory, ...entries.map((entry) => entry.png)]);
}

async function buildFaviconIco(sourcePath) {
  const faviconEntries = [];
  for (const size of [16, 32, 48]) {
    const image = await resizeTransparent(sourcePath, size);
    const png = await image.toBuffer();
    faviconEntries.push({ size, png });
  }
  return buildPngIco(faviconEntries);
}

// Normalize masters — transparent PNGs written back to public/.
await writeTransparentMaster(sources.dark, sources.dark);
await writeTransparentMaster(sources.light, sources.light);

const transparentSources = {
  dark: sources.dark,
  light: sources.light,
};

// PWA + iOS home screen — dark logo (OS may add its own tile bg).
const pwaOutputs = [
  { out: "icon-192.png", size: 192, source: transparentSources.dark },
  { out: "icon-512.png", size: 512, source: transparentSources.dark },
  { out: "apple-touch-icon.png", size: 180, source: transparentSources.dark },
];

for (const { out, size, source } of pwaOutputs) {
  const image = await resizeTransparent(source, size);
  await image.toFile(join(publicDir, out));
}

// Browser tab PNG favicons (prefers-color-scheme in layout metadata).
const faviconOutputs = [
  { out: "favicon-dark.png", size: 32, source: transparentSources.dark },
  { out: "favicon-light.png", size: 32, source: transparentSources.light },
  { out: "icon-dark-192.png", size: 192, source: transparentSources.dark },
  { out: "icon-light-192.png", size: 192, source: transparentSources.light },
];

for (const { out, size, source } of faviconOutputs) {
  const image = await resizeTransparent(source, size);
  await image.toFile(join(publicDir, out));
}

// Next.js app router file conventions (dark fallback).
copyFileSync(join(publicDir, "icon-192.png"), join(appDir, "icon.png"));
copyFileSync(
  join(publicDir, "apple-touch-icon.png"),
  join(appDir, "apple-icon.png"),
);

// .ico fallback for browsers without media-query favicon support.
writeFileSync(
  join(appDir, "favicon.ico"),
  await buildFaviconIco(transparentSources.dark),
);

// Remove legacy logo assets superseded by app-icon-dark/light.png.
for (const legacy of ["W.png", "logo-w.png"]) {
  const legacyPath = join(publicDir, legacy);
  if (existsSync(legacyPath)) {
    unlinkSync(legacyPath);
    console.log(`Removed legacy ${legacy}`);
  }
}

console.log(
  "PWA icons updated — masters & derivatives keep transparent backgrounds.",
);
