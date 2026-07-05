export type WallpaperId =
  | "default"
  | "aurora"
  | "sunset"
  | "ocean"
  | "forest"
  | "midnight"
  | "rose"
  | "custom";

export type WallpaperKind = "gradient" | "image";

export type WallpaperMaskColor = "black" | "white";

export interface Wallpaper {
  id: WallpaperId;
  label: string;
  preview: string;
  background: string;
  kind: WallpaperKind;
}
