import { CategoryOption, SubCategoryOption, TempOption, SavedRTEProduct } from "./types";

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { code: "FO", name: "Makanan Jadi (RTE Food)", description: "Mie seduh, cup noodle, bento instan, oden, dan nasi siap saji" },
  { code: "BV", name: "Minuman Seduh (RTE Beverage)", description: "Kopi seduh, cappucino cup, es kopi susu, teh seduh, cokelat hangat" },
  { code: "SN", name: "Camilan Hangat (RTE Snack)", description: "Gorengan, oden kuah pedas, puding cup, dessert manis instan" },
  { code: "BA", name: "Roti & Bun (Ready to Eat)", description: "Roti bakar instan, sandwich, donat, bun banso" }
];

export const SUBCATEGORY_OPTIONS: SubCategoryOption[] = [
  // Food subcats
  { code: "MS", name: "Mie Seduh & Cup Noodle", categoryCode: "FO" },
  { code: "RI", name: "Rice Cup & Bento Instan", categoryCode: "FO" },
  { code: "OD", name: "Oden & Sup Hangat", categoryCode: "FO" },
  
  // Beverage subcats
  { code: "KP", name: "Kopi Seduh & Racikan", categoryCode: "BV" },
  { code: "TH", name: "Teh & Susu Hangat", categoryCode: "BV" },
  { code: "CD", name: "Minuman Dingin / Ice Blend", categoryCode: "BV" },

  // Snack subcats
  { code: "GH", name: "Gorengan / Sosis Bakar", categoryCode: "SN" },
  { code: "DS", name: "Dessert & Puding Cup", categoryCode: "SN" },

  // Bakery subcats
  { code: "SW", name: "Sandwich & Toast", categoryCode: "BA" },
  { code: "RT", name: "Roti & Donat Manis", categoryCode: "BA" },
];

export const TEMP_OPTIONS: TempOption[] = [
  { code: "WA", name: "Warm / Hot (Seduh Panas)", tempRange: "≥ 60°C", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { code: "CH", name: "Chilled (Es / Dingin)", tempRange: "2°C - 4°C", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { code: "AM", name: "Ambient (Suhu Ruang)", tempRange: "20°C - 25°C", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { code: "FR", name: "Frozen (Sediaan Beku)", tempRange: "≤ -18°C", color: "bg-cyan-50 text-cyan-700 border-cyan-200" }
];

export const INITIAL_PRODUCTS: SavedRTEProduct[] = [
  {
    id: "rte-1",
    name: "Pop Mie Cup Rasa Baso Spesial",
    sku: "RTE-FO-MS-PMB-WA-01-01",
    pluCode: "5012",
    category: "FO",
    subCategory: "MS",
    temp: "WA",
    shelfLife: 1, // Freshly brewed on-site, must be consumed within 1 day (ideal within 2 hours)
    seq: "01",
    createdAt: "2026-05-25T08:00:00Z",
    notes: "Mie seduh air panas suhu dispenser QC ≥ 85°C. Sajikan dengan segel foil dirapatkan.",
    allergens: ["Gandum / Gluten", "Kedelai / MSG"],
    handlingInstructions: "Tuang air panas hingga batas garis di dalam cup. Diamkan tertutup selama 3 menit. Berikan garpu plastik bersih ke pelanggan."
  },
  {
    id: "rte-2",
    name: "Kopi Hitam Tubruk Arabika (Hot Cup)",
    sku: "RTE-BV-KP-KHT-WA-01-02",
    pluCode: "4001",
    category: "BV",
    subCategory: "KP",
    temp: "WA",
    shelfLife: 1, // Best hot
    seq: "02",
    createdAt: "2026-05-15T08:30:00Z",
    notes: "Gula pasir sachet 2 pcs terpisah. Cup kertas foodgrade anti-panas dengan sleeve berlogo.",
    allergens: [],
    handlingInstructions: "Seduh bubuk kopi dengan air panas mendidih. Berikan penutup lid berlubang guna menghindari cipratan pada pelanggan."
  },
  {
    id: "rte-3",
    name: "Es Kopi Susu Creamy Gula Aren",
    sku: "RTE-BV-KP-KSA-CH-01-03",
    pluCode: "4005",
    category: "BV",
    subCategory: "KP",
    temp: "CH",
    shelfLife: 2, // Chilled expiry milk-based
    seq: "03",
    createdAt: "2026-05-24T09:00:00Z",
    notes: "Campuran espresso matang, krimer berkualitas, susu segar UHT, dan sirup aren organik cair.",
    allergens: ["Susu Sapi (Laktosa)"],
    handlingInstructions: "Simpan di chiller bawah bar suhu 2-4°C sebelum disajikan dengan es batu kristal bersih."
  },
  {
    id: "rte-4",
    name: "Indomie Cup Goreng Seduh Instan",
    sku: "RTE-FO-MS-IGC-WA-01-04",
    pluCode: "5018",
    category: "FO",
    subCategory: "MS",
    temp: "WA",
    shelfLife: 1,
    seq: "04",
    createdAt: "2026-05-25T07:15:00Z",
    notes: "Tiriskan air kaldu sisa rebusan lewat lubang khusus penutup sebelum bumbu dicampurkan.",
    allergens: ["Gandum / Gluten", "Kedelai / Bawang"],
    handlingInstructions: "Lakukan QC air panas dispenser bertekanan stabil. Tambahkan taburan bawang goreng renyah di atas mie setelah matang."
  }
];
