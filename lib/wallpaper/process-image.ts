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

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new WallpaperUploadError("Gagal membaca gambar."));
    };

    image.src = objectUrl;
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

export async function processWallpaperFile(file: File): Promise<string> {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    throw new WallpaperUploadError("Format harus JPG, PNG, atau WebP.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new WallpaperUploadError("Ukuran file maksimal 8 MB.");
  }

  const image = await loadImageFromFile(file);
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
    throw new WallpaperUploadError(
      "Browser tidak mendukung pemrosesan gambar.",
    );
  }

  context.drawImage(image, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", OUTPUT_QUALITY);
  if (!dataUrl.startsWith("data:image/jpeg")) {
    throw new WallpaperUploadError("Gagal memproses wallpaper.");
  }

  return dataUrl;
}
