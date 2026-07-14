import {
  CUSTOM_WALLPAPER_SLOT_IDS,
  type CustomWallpaperSlots,
  EMPTY_CUSTOM_WALLPAPER_SLOTS,
  MAX_CUSTOM_WALLPAPERS,
} from "@/lib/wallpaper/custom-wallpaper";

const DB_NAME = "wang-app";
const DB_VERSION = 1;
const STORE_NAME = "settings";
const CUSTOM_WALLPAPERS_KEY = "custom-wallpapers";
const LEGACY_CUSTOM_WALLPAPER_KEY = "custom-wallpaper";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

function runStoreRequest<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = run(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error ?? new Error("IndexedDB request failed"));
      }),
  );
}

function normalizeSlots(value: unknown): CustomWallpaperSlots {
  if (!Array.isArray(value)) {
    return [...EMPTY_CUSTOM_WALLPAPER_SLOTS];
  }

  const slots: CustomWallpaperSlots = [...EMPTY_CUSTOM_WALLPAPER_SLOTS];
  for (let index = 0; index < MAX_CUSTOM_WALLPAPERS; index += 1) {
    const entry = value[index];
    slots[index] = typeof entry === "string" ? entry : null;
  }

  return slots;
}

async function migrateLegacyCustomWallpaper(): Promise<CustomWallpaperSlots> {
  try {
    const legacy = await runStoreRequest("readonly", (store) =>
      store.get(LEGACY_CUSTOM_WALLPAPER_KEY),
    );

    if (typeof legacy !== "string") {
      return [...EMPTY_CUSTOM_WALLPAPER_SLOTS];
    }

    const slots: CustomWallpaperSlots = [legacy, null, null];
    await writeCustomWallpaperSlots(slots);
    await runStoreRequest("readwrite", (store) =>
      store.delete(LEGACY_CUSTOM_WALLPAPER_KEY),
    );

    return slots;
  } catch {
    return [...EMPTY_CUSTOM_WALLPAPER_SLOTS];
  }
}

export async function readCustomWallpaperSlots(): Promise<CustomWallpaperSlots> {
  if (typeof window === "undefined") {
    return [...EMPTY_CUSTOM_WALLPAPER_SLOTS];
  }

  try {
    const value = await runStoreRequest("readonly", (store) =>
      store.get(CUSTOM_WALLPAPERS_KEY),
    );

    if (value === undefined) {
      return migrateLegacyCustomWallpaper();
    }

    return normalizeSlots(value);
  } catch {
    return [...EMPTY_CUSTOM_WALLPAPER_SLOTS];
  }
}

export async function writeCustomWallpaperSlots(
  slots: CustomWallpaperSlots,
): Promise<void> {
  await runStoreRequest("readwrite", (store) =>
    store.put(normalizeSlots(slots), CUSTOM_WALLPAPERS_KEY),
  );
}

export async function setCustomWallpaperAtSlot(
  slot: number,
  dataUrl: string | null,
): Promise<CustomWallpaperSlots> {
  const slots = await readCustomWallpaperSlots();

  if (slot < 0 || slot >= MAX_CUSTOM_WALLPAPERS) {
    throw new Error("Slot wallpaper tidak valid.");
  }

  slots[slot] = dataUrl;
  await writeCustomWallpaperSlots(slots);

  return slots;
}

export { CUSTOM_WALLPAPER_SLOT_IDS };
