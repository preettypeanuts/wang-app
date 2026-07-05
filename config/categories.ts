export interface TransactionCategoryDefinition {
  id: string;
  label: string;
  description: string;
  examples: readonly string[];
  keywords: readonly string[];
}

export const TRANSACTION_CATEGORIES = [
  {
    id: "food",
    label: "Makanan & Minum",
    description:
      "Makan di luar, kafe, restoran, warteg, snack, jajanan, delivery makanan.",
    examples: ["makan warteg 15k", "kopi 25k", "grabfood 80k"],
    keywords: [
      "makan",
      "minum",
      "warteg",
      "resto",
      "restoran",
      "kopi",
      "snack",
      "jajanan",
      "grabfood",
      "gofood",
      "starbucks",
      "sarapan",
      "kafe",
      "cafe",
      "nasi",
    ],
  },
  {
    id: "groceries",
    label: "Sembako & Groceries",
    description:
      "Belanja harian, supermarket, sayur, buah, bahan makanan rumah tangga.",
    examples: ["indomaret 75k", "supermarket 250k", "beli sayur 40k"],
    keywords: [
      "indomaret",
      "alfamart",
      "supermarket",
      "hypermart",
      "carrefour",
      "sembako",
      "groceries",
      "sayur",
      "buah",
    ],
  },
  {
    id: "transport",
    label: "Transportasi",
    description:
      "Ojek online, taksi, bensin, parkir, tol, servis kendaraan, tiket umum.",
    examples: ["grab 25k", "gojek 18k", "bensin 100k", "parkir 5k"],
    keywords: [
      "grab",
      "gojek",
      "ojol",
      "maxim",
      "bluebird",
      "taxi",
      "bensin",
      "pertamax",
      "parkir",
      "tol",
      "transport",
      "kereta",
      "bus",
      "servis motor",
    ],
  },
  {
    id: "shopping",
    label: "Belanja & Fashion",
    description:
      "Pakaian, sepatu, aksesoris, elektronik, kendaraan, laptop/HP, marketplace, pembelian barang besar.",
    examples: [
      "beli baju 150k",
      "shopee 75k",
      "beli mobil 100jt",
      "laptop 12jt",
    ],
    keywords: [
      "beli mobil",
      "mobil bekas",
      "mobil",
      "motor",
      "kendaraan",
      "beli motor",
      "beli laptop",
      "laptop",
      "handphone",
      "smartphone",
      "hp ",
      " hp",
      "iphone",
      "samsung",
      "elektronik",
      "gadget",
      "komputer",
      "pc ",
      "beli baju",
      "beli ",
      " beli",
      "belanja",
      "checkout",
      "cicilan",
      "angsuran",
      "fashion",
      "shopee",
      "tokopedia",
      "lazada",
      "zara",
      "uniqlo",
    ],
  },
  {
    id: "housing",
    label: "Rumah & Sewa",
    description: "Kontrakan, sewa, KPR, perbaikan rumah, furniture, properti.",
    examples: ["sewa kos 1.5jt", "kpr 3jt", "cat rumah 500k"],
    keywords: [
      "sewa",
      "kontrak",
      "kontrakan",
      "kost",
      "kpr",
      "rumah",
      "furniture",
      "renov",
    ],
  },
  {
    id: "utilities",
    label: "Tagihan & Utilitas",
    description: "Listrik, air, gas, internet rumah, pulsa, PPOB, PDAM, PLN.",
    examples: ["listrik 350k", "pdam 80k", "wifi 300k", "pulsa 50k"],
    keywords: [
      "listrik",
      "pln",
      "pdam",
      "air",
      "wifi",
      "internet",
      "pulsa",
      "ppob",
      "token listrik",
      "bayar",
      "tagihan",
      "byr",
    ],
  },
  {
    id: "subscription",
    label: "Langganan",
    description:
      "Streaming, gym, cloud, SaaS, membership digital, langganan bulanan.",
    examples: ["netflix 54k", "spotify 55k", "icloud 49k", "gym 300k"],
    keywords: [
      "netflix",
      "spotify",
      "youtube premium",
      "icloud",
      "langganan",
      "subscription",
      "gym",
      "membership",
      "disney",
    ],
  },
  {
    id: "entertainment",
    label: "Hiburan",
    description: "Bioskop, konser, game, event, rekreasi, hobi, tiket hiburan.",
    examples: ["nonton 50k", "konser 350k", "steam 120k"],
    keywords: [
      "nonton",
      "bioskop",
      "cinema",
      "konser",
      "game",
      "steam",
      "hiburan",
      "ticket",
      "tiket",
    ],
  },
  {
    id: "health",
    label: "Kesehatan & Medis",
    description: "Obat, dokter, apotek, vitamin, lab, rumah sakit, dental.",
    examples: ["obat 45k", "dokter 150k", "checkup 300k"],
    keywords: [
      "obat",
      "dokter",
      "apotek",
      "klinik",
      "vitamin",
      "rumah sakit",
      "rs ",
      "dental",
      "medis",
    ],
  },
  {
    id: "education",
    label: "Pendidikan",
    description: "Sekolah, kuliah, kursus, buku, les, uang pangkal, SPP.",
    examples: ["spp 500k", "kursus 300k", "beli buku 80k"],
    keywords: [
      "spp",
      "sekolah",
      "kuliah",
      "kursus",
      "les",
      "buku",
      "pendidikan",
      "udemy",
      "bootcamp",
    ],
  },
  {
    id: "personal",
    label: "Perawatan Diri",
    description: "Salon, barbershop, skincare, kosmetik, spa, grooming.",
    examples: ["potong rambut 50k", "skincare 120k", "spa 200k"],
    keywords: [
      "salon",
      "barber",
      "potong rambut",
      "skincare",
      "kosmetik",
      "spa",
      "facial",
    ],
  },
  {
    id: "family",
    label: "Keluarga & Anak",
    description:
      "Kebutuhan anak, bayi, orang tua, kirim uang ke keluarga, allowance, uang jajan.",
    examples: ["transfer mama 500k", "kirim ibu 1jt", "popok 150k", "uang jajan anak 50k"],
    keywords: [
      "mama",
      "papa",
      "ibu",
      "ayah",
      "mami",
      "papi",
      "anak",
      "bayi",
      "popok",
      "susu formula",
      "mainan anak",
      "orang tua",
      "ortu",
      "keluarga",
      "adik",
      "kakak",
      "nenek",
      "kakek",
      "istri",
      "suami",
      "uang jajan",
      "allowance",
    ],
  },
  {
    id: "travel",
    label: "Liburan & Travel",
    description: "Hotel, pesawat, visa, wisata, staycation, perjalanan liburan.",
    examples: ["hotel 800k", "tiket pesawat 1.2jt", "visa 2jt"],
    keywords: [
      "hotel",
      "pesawat",
      "tiket pesawat",
      "travel",
      "liburan",
      "wisata",
      "staycation",
      "airbnb",
      "visa",
    ],
  },
  {
    id: "pets",
    label: "Hewan Peliharaan",
    description: "Makanan pet, vet, grooming hewan, aksesoris pet.",
    examples: ["makan kucing 80k", "vet 150k", "grooming anjing 100k"],
    keywords: ["kucing", "anjing", "pet", "vet", "hewan", "peliharaan"],
  },
  {
    id: "gifts",
    label: "Hadiah & Donasi",
    description:
      "Hadiah ulang tahun, charity, sedekah, zakat, amplop, traktir teman.",
    examples: ["hadiah 200k", "donasi 100k", "zakat 500k"],
    keywords: ["hadiah", "donasi", "sedekah", "zakat", "infak", "charity", "traktir"],
  },
  {
    id: "business",
    label: "Bisnis & Kerja",
    description:
      "Biaya operasional usaha, alat kerja, stok dagang, meeting klien.",
    examples: ["stok barang 1jt", "alat kerja 300k", "makan klien 150k"],
    keywords: [
      "bisnis",
      "usaha",
      "stok",
      "operasional",
      "kantor",
      "klien",
      "invoice",
    ],
  },
  {
    id: "insurance",
    label: "Asuransi",
    description: "Premi asuransi kesehatan, jiwa, kendaraan, properti.",
    examples: ["asuransi mobil 2jt", "premi bpjs 400k"],
    keywords: ["asuransi", "premi", "polis", "bpjs", "allianz", "prudential"],
  },
  {
    id: "fees",
    label: "Biaya & Pajak",
    description:
      "Admin bank, biaya transfer bank, provisi, pajak, denda, bunga pinjaman — bukan kirim uang ke orang.",
    examples: ["admin bank 6500", "biaya transfer 2500", "pajak 500k", "denda 50k"],
    keywords: [
      "admin bank",
      "biaya admin",
      "pajak",
      "denda",
      "bunga pinjaman",
      "provisi",
      "biaya transfer",
      "biaya provisi",
    ],
  },
  {
    id: "investment",
    label: "Investasi",
    description:
      "Beli saham/reksadana/crypto (pengeluaran) atau dividen/bunga/profit (pemasukan).",
    examples: ["beli saham 1jt", "dividen 200k", "reksadana 500k"],
    keywords: [
      "saham",
      "reksadana",
      "crypto",
      "bitcoin",
      "dividen",
      "bibit",
      "stockbit",
      "invest",
    ],
  },
  {
    id: "salary",
    label: "Gaji & Upah",
    description: "Gaji bulanan, upah, THR, tunjangan tetap dari employer.",
    examples: ["gaji 5jt", "upah 500k", "thr 10jt"],
    keywords: ["gaji", "upah", "thr", "tunjangan", "payroll"],
  },
  {
    id: "side_income",
    label: "Pemasukan Sampingan",
    description: "Freelance, jual barang, komisi, bonus, cashback masuk, side hustle.",
    examples: ["freelance 2jt", "jual laptop 3jt", "komisi 150k"],
    keywords: [
      "freelance",
      "jual",
      "komisi",
      "bonus",
      "cashback",
      "side hustle",
      "terima",
      "masuk",
    ],
  },
  {
    id: "other",
    label: "Lainnya",
    description: "Transaksi yang tidak cocok kategori di atas.",
    examples: ["transfer 100k", "misc 20k"],
    keywords: [],
  },
] as const satisfies readonly TransactionCategoryDefinition[];

export type TransactionCategoryId =
  (typeof TRANSACTION_CATEGORIES)[number]["id"];

export const TRANSACTION_CATEGORY_IDS = new Set<string>(
  TRANSACTION_CATEGORIES.map((category) => category.id),
);

/** Primary income categories — used when type=income. */
export const INCOME_CATEGORY_IDS = new Set<TransactionCategoryId>([
  "salary",
  "side_income",
  "investment",
  "gifts",
  "other",
]);

/** Legacy ids from older versions — mapped on read/normalize. */
const LEGACY_CATEGORY_ALIASES: Record<string, TransactionCategoryId> = {
  bills: "utilities",
};

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  TRANSACTION_CATEGORIES.map((category) => [category.id, category.label]),
);

export function isTransactionCategory(
  value: string,
): value is TransactionCategoryId {
  return TRANSACTION_CATEGORY_IDS.has(value);
}

export function getCategoryLabel(categoryId: string): string {
  const normalized = normalizeCategory(categoryId);
  return CATEGORY_LABELS[normalized] ?? CATEGORY_LABELS.other;
}

export function normalizeCategory(value: string): TransactionCategoryId {
  const normalized = value.trim().toLowerCase();

  if (isTransactionCategory(normalized)) {
    return normalized;
  }

  const legacy = LEGACY_CATEGORY_ALIASES[normalized];
  if (legacy) {
    return legacy;
  }

  return "other";
}

export function isIncomeCategory(
  category: TransactionCategoryId,
): boolean {
  return INCOME_CATEGORY_IDS.has(category);
}

export function resolveCategoryForType(
  category: TransactionCategoryId,
  type: "income" | "expense",
): TransactionCategoryId {
  if (type === "income") {
    if (isIncomeCategory(category)) {
      return category;
    }

    if (category === "business") {
      return "side_income";
    }

    return "side_income";
  }

  if (category === "salary" || category === "side_income") {
    return "other";
  }

  return category;
}

export function buildGeminiCategoryInstruction(): string {
  const expenseCategories = TRANSACTION_CATEGORIES.filter(
    (category) =>
      category.id !== "salary" && category.id !== "side_income",
  );
  const incomeCategories = TRANSACTION_CATEGORIES.filter((category) =>
    isIncomeCategory(category.id as TransactionCategoryId),
  );

  const expenseLines = expenseCategories.map((category) => {
    const exampleText = category.examples.join("; ");
    return `- ${category.id} (${category.label}): ${category.description} Contoh: ${exampleText}.`;
  });

  const incomeLines = incomeCategories.map((category) => {
    const exampleText = category.examples.join("; ");
    return `- ${category.id} (${category.label}): ${category.description} Contoh: ${exampleText}.`;
  });

  return [
    "Semua deskripsi transaksi user dalam Bahasa Indonesia (Indonesia). Pahami istilah lokal sehari-hari.",
    "Kategori WAJIB salah satu id berikut (lowercase, persis).",
    "",
    "Pengeluaran (expense):",
    ...expenseLines,
    "",
    "Pemasukan (income) — pilih yang paling tepat:",
    ...incomeLines,
    "",
    "Aturan kategori:",
    "1. Pilih kategori paling spesifik. 'other' HANYA opsi terakhir jika benar-benar tidak ada yang cocok.",
    "2. Makan di restoran = food; belanja supermarket = groceries (bukan food).",
    "3. Listrik/pulsa/wifi = utilities; Netflix/Spotify/gym = subscription.",
    "4. Hotel/pesawat liburan = travel; grab harian = transport.",
    "5. Pemasukan: gaji/upah/THR = salary; freelance/jual barang/komisi = side_income.",
    "6. Dividen/bunga/profit investasi = investment; terima hadiah = gifts.",
    "7. Pengeluaran: jangan gunakan salary atau side_income.",
    "8. Field category hanya berisi id, bukan label Indonesia.",
    "9. Beli mobil/motor/kendaraan, laptop, HP, elektronik, pakaian, marketplace = shopping.",
    "10. Bayar tagihan/listrik/internet/pulsa = utilities; cicilan/angsuran barang = shopping.",
    "11. Jika ada kata beli/bayar/makan/transport, WAJIB pilih kategori spesifik — bukan other.",
    "12. Transfer/kirim uang ke orang (mama, papa, ibu, keluarga, teman) = family atau gifts — BUKAN fees.",
    "13. fees HANYA untuk biaya admin bank, provisi, pajak, denda — bukan nominal transfer ke orang.",
  ].join("\n");
}
