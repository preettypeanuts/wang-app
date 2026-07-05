const DB_NAME = "monmon-app";
const DB_VERSION = 1;
const STORE_NAME = "settings";
const CUSTOM_WALLPAPER_KEY = "custom-wallpaper";

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

export async function readCustomWallpaper(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = await runStoreRequest("readonly", (store) =>
      store.get(CUSTOM_WALLPAPER_KEY),
    );

    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

export async function writeCustomWallpaper(dataUrl: string): Promise<void> {
  await runStoreRequest("readwrite", (store) =>
    store.put(dataUrl, CUSTOM_WALLPAPER_KEY),
  );
}

export async function deleteCustomWallpaper(): Promise<void> {
  await runStoreRequest("readwrite", (store) =>
    store.delete(CUSTOM_WALLPAPER_KEY),
  );
}
