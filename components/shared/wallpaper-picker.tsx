import { WallpaperGrid } from "@/components/shared/wallpaper-grid";
import { WallpaperMaskSlider } from "@/components/shared/wallpaper-mask-slider";
import { WallpaperUpload } from "@/components/shared/wallpaper-upload";

export function WallpaperPicker() {
  return (
    <div className="space-y-3">
      <WallpaperUpload />
      <WallpaperMaskSlider />
      <WallpaperGrid />
    </div>
  );
}
