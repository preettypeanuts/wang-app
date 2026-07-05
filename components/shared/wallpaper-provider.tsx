"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CUSTOM_WALLPAPER_ID, DEFAULT_WALLPAPER_ID } from "@/config/wallpapers";
import { DEFAULT_WALLPAPER_MASK } from "@/config/wallpaper-mask";
import {
  deleteCustomWallpaper,
  readCustomWallpaper,
  writeCustomWallpaper,
} from "@/lib/wallpaper/custom-storage";
import {
  processWallpaperFile,
  WallpaperUploadError,
} from "@/lib/wallpaper/process-image";
import { resolveActiveWallpaper } from "@/lib/wallpaper/resolve-wallpaper";
import {
  readStoredWallpaperMask,
  readStoredWallpaperMaskColor,
  writeStoredWallpaperMask,
  writeStoredWallpaperMaskColor,
} from "@/lib/wallpaper/mask-storage";
import type { WallpaperMaskColor } from "@/types/wallpaper";
import {
  readStoredWallpaperId,
  writeStoredWallpaperId,
} from "@/lib/wallpaper/storage";
import type { Wallpaper, WallpaperId } from "@/types/wallpaper";

interface WallpaperContextValue {
  wallpaper: Wallpaper;
  wallpaperId: WallpaperId;
  customWallpaperUrl: string | null;
  maskOpacity: number;
  maskColor: WallpaperMaskColor;
  isUploading: boolean;
  uploadError: string | null;
  setWallpaperId: (id: WallpaperId) => void;
  setMaskOpacity: (value: number) => void;
  setMaskColor: (value: WallpaperMaskColor) => void;
  uploadCustomWallpaper: (file: File) => Promise<void>;
  removeCustomWallpaper: () => Promise<void>;
}

const WallpaperContext = createContext<WallpaperContextValue | null>(null);

interface WallpaperProviderProps {
  children: React.ReactNode;
}

async function loadInitialWallpaperState(): Promise<{
  wallpaperId: WallpaperId;
  customWallpaperUrl: string | null;
}> {
  const [storedId, customWallpaperUrl] = await Promise.all([
    Promise.resolve(readStoredWallpaperId()),
    readCustomWallpaper(),
  ]);

  if (storedId === CUSTOM_WALLPAPER_ID && !customWallpaperUrl) {
    writeStoredWallpaperId(DEFAULT_WALLPAPER_ID);
    return { wallpaperId: DEFAULT_WALLPAPER_ID, customWallpaperUrl: null };
  }

  return { wallpaperId: storedId, customWallpaperUrl };
}

export function WallpaperProvider({ children }: WallpaperProviderProps) {
  const [wallpaperId, setWallpaperIdState] =
    useState<WallpaperId>(DEFAULT_WALLPAPER_ID);
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string | null>(
    null,
  );
  const [maskOpacity, setMaskOpacityState] = useState(DEFAULT_WALLPAPER_MASK);
  const [maskColor, setMaskColorState] = useState<WallpaperMaskColor>("black");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    void loadInitialWallpaperState().then(
      ({ wallpaperId, customWallpaperUrl }) => {
        setWallpaperIdState(wallpaperId);
        setCustomWallpaperUrl(customWallpaperUrl);
      },
    );
    setMaskOpacityState(readStoredWallpaperMask());
    setMaskColorState(readStoredWallpaperMaskColor());
  }, []);

  const setWallpaperId = useCallback((id: WallpaperId) => {
    setUploadError(null);
    setWallpaperIdState(id);
    writeStoredWallpaperId(id);
  }, []);

  const setMaskOpacity = useCallback((value: number) => {
    setMaskOpacityState(value);
    writeStoredWallpaperMask(value);
  }, []);

  const setMaskColor = useCallback((value: WallpaperMaskColor) => {
    setMaskColorState(value);
    writeStoredWallpaperMaskColor(value);
  }, []);

  const uploadCustomWallpaper = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const dataUrl = await processWallpaperFile(file);
      await writeCustomWallpaper(dataUrl);
      setCustomWallpaperUrl(dataUrl);
      setWallpaperIdState(CUSTOM_WALLPAPER_ID);
      writeStoredWallpaperId(CUSTOM_WALLPAPER_ID);
    } catch (error) {
      const message =
        error instanceof WallpaperUploadError
          ? error.message
          : "Gagal mengunggah wallpaper.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeCustomWallpaper = useCallback(async () => {
    await deleteCustomWallpaper();
    setCustomWallpaperUrl(null);
    setUploadError(null);
    setWallpaperIdState(DEFAULT_WALLPAPER_ID);
    writeStoredWallpaperId(DEFAULT_WALLPAPER_ID);
  }, []);

  const wallpaper = useMemo(
    () => resolveActiveWallpaper(wallpaperId, customWallpaperUrl),
    [customWallpaperUrl, wallpaperId],
  );

  const value = useMemo<WallpaperContextValue>(
    () => ({
      wallpaper,
      wallpaperId,
      customWallpaperUrl,
      maskOpacity,
      maskColor,
      isUploading,
      uploadError,
      setWallpaperId,
      setMaskOpacity,
      setMaskColor,
      uploadCustomWallpaper,
      removeCustomWallpaper,
    }),
    [
      customWallpaperUrl,
      isUploading,
      maskColor,
      maskOpacity,
      removeCustomWallpaper,
      setMaskColor,
      setMaskOpacity,
      setWallpaperId,
      uploadCustomWallpaper,
      uploadError,
      wallpaper,
      wallpaperId,
    ],
  );

  return (
    <WallpaperContext.Provider value={value}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper(): WallpaperContextValue {
  const context = useContext(WallpaperContext);

  if (!context) {
    throw new Error("useWallpaper must be used within WallpaperProvider");
  }

  return context;
}
