import {
  WALLPAPER_BROWSER_UNSUPPORTED,
  WALLPAPER_DOWNLOAD_FAILED,
  WALLPAPER_FILE_SIZE_MAX,
  WALLPAPER_FORMAT_INVALID,
  WALLPAPER_LINK_EMPTY,
  WALLPAPER_LINK_INVALID,
  WALLPAPER_LINK_NOT_IMAGE,
  WALLPAPER_LINK_PROTOCOL,
  WALLPAPER_LOAD_URL_FAILED,
  WALLPAPER_PROCESS_FAILED,
  WALLPAPER_READ_IMAGE_FAILED,
} from "@/config/settings-labels";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_EDGE_PX = 1920;
const OUTPUT_QUALITY = 0.85;

const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class WallpaperUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WallpaperUploadError";
  }
}

function loadImageFromObjectUrl(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new WallpaperUploadError(WALLPAPER_READ_IMAGE_FAILED));

    image.src = objectUrl;
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  return loadImageFromObjectUrl(objectUrl).finally(() => {
    URL.revokeObjectURL(objectUrl);
  });
}

function loadImageFromUrlWithCrossOrigin(
  url: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new WallpaperUploadError(WALLPAPER_LOAD_URL_FAILED));

    image.src = url;
  });
}

function scaleDimensions(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const largestEdge = Math.max(width, height);

  if (largestEdge <= maxEdge) {
    return { width, height };
  }

  const scale = maxEdge / largestEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function encodeImageElement(image: HTMLImageElement): string {
  const { width, height } = scaleDimensions(
    image.naturalWidth,
    image.naturalHeight,
    MAX_EDGE_PX,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new WallpaperUploadError(WALLPAPER_BROWSER_UNSUPPORTED);
  }

  context.drawImage(image, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", OUTPUT_QUALITY);
  if (!dataUrl.startsWith("data:image/jpeg")) {
    throw new WallpaperUploadError(WALLPAPER_PROCESS_FAILED);
  }

  return dataUrl;
}

function assertAcceptedImageMime(mime: string): void {
  if (mime && !mime.startsWith("image/")) {
    throw new WallpaperUploadError(WALLPAPER_LINK_NOT_IMAGE);
  }

  if (mime && !ACCEPTED_MIME_TYPES.has(mime)) {
    throw new WallpaperUploadError(WALLPAPER_FORMAT_INVALID);
  }
}

export function normalizeWallpaperUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new WallpaperUploadError(WALLPAPER_LINK_EMPTY);
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new WallpaperUploadError(WALLPAPER_LINK_INVALID);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new WallpaperUploadError(WALLPAPER_LINK_PROTOCOL);
  }

  return url.toString();
}

async function loadImageFromRemoteUrl(url: string): Promise<HTMLImageElement> {
  try {
    const response = await fetch(url, { mode: "cors" });

    if (!response.ok) {
      throw new WallpaperUploadError(WALLPAPER_DOWNLOAD_FAILED);
    }

    const blob = await response.blob();

    if (blob.size > MAX_FILE_SIZE_BYTES) {
      throw new WallpaperUploadError(WALLPAPER_FILE_SIZE_MAX);
    }

    assertAcceptedImageMime(blob.type);

    const file = new File([blob], "wallpaper", {
      type: blob.type || "image/jpeg",
    });

    return loadImageFromFile(file);
  } catch (error) {
    if (error instanceof WallpaperUploadError) {
      throw error;
    }
  }

  return loadImageFromUrlWithCrossOrigin(url);
}

export async function processWallpaperFile(file: File): Promise<string> {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    throw new WallpaperUploadError(WALLPAPER_FORMAT_INVALID);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new WallpaperUploadError(WALLPAPER_FILE_SIZE_MAX);
  }

  const image = await loadImageFromFile(file);
  return encodeImageElement(image);
}

export async function processWallpaperFromUrl(input: string): Promise<string> {
  const url = normalizeWallpaperUrl(input);
  const image = await loadImageFromRemoteUrl(url);
  return encodeImageElement(image);
}
