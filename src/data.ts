import { CategoryOption, SubCategoryOption, TempOption, SavedRTEProduct } from "./types";

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { code: "FO", name: "Makanan Berat (Food)", description: "Nasi, lauk pauk, mie, pasta, salad, serta makanan berat siap saji" },
  { code: "BV", name: "Minuman (Beverage)", description: "Kopi, jus buah segar, susu, teh, dan minuman kemasan dingin" },
  { code: "SN", name: "Camilan (Snack)", description: "Puding, keripik, buah potong, gorengan premium, dessert cup" },
  { code: "BA", name: "Bakery & Pastry", description: "Sourdough, croissant, donat, muffin, roti manis, sandwich bakery" }
];

export const SUBCATEGORY_OPTIONS: SubCategoryOption[] = [
  // Food subcats
  { code: "NK", name: "Nasi & Karbohidrat", categoryCode: "FO" },
  { code: "LP", name: "Lauk Pauk Siap Santap", categoryCode: "FO" },
  { code: "MP", name: "Mie & Pasta Siap Saji", categoryCode: "FO" },
  { code: "SD", name: "Salad & Sayuran Segar", categoryCode: "FO" },
  
  // Beverage subcats
  { code: "CF", name: "Kopi & Kafein", categoryCode: "BV" },
  { code: "JS", name: "Jus & Minuman Buah", categoryCode: "BV" },
  { code: "ML", name: "Susu & Susu Nabati", categoryCode: "BV" },
  { code: "TH", name: "Teh & Infused Water", categoryCode: "BV" },

  // Snack subcats
  { code: "DS", name: "Dessert & Puding", categoryCode: "SN" },
  { code: "BP", name: "Buah Potong Segar", categoryCode: "SN" },
  { code: "GM", name: "Gorengan & Camilan Gurih", categoryCode: "SN" },

  // Bakery subcats
  { code: "CR", name: "Croissant & Danish", categoryCode: "BA" },
  { code: "SW", name: "Sandwich & Panini", categoryCode: "BA" },
  { code: "RT", name: "Roti Manis & Bun", categoryCode: "BA" },
];

export const TEMP_OPTIONS: TempOption[] = [
  { code: "CH", name: "Chilled (Dingin)", tempRange: "2°C - 4°C", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { code: "FR", name: "Frozen (Beku)", tempRange: "≤ -18°C", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { code: "AM", name: "Ambient (Suhu Ruangan)", tempRange: "20°C - 25°C", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { code: "WA", name: "Warm (Hangat)", tempRange: "≥ 60°C", color: "bg-amber-50 text-amber-700 border-amber-200" }
];

export const INITIAL_PRODUCTS: SavedRTEProduct[] = [
  {
    id: "rte-1",
    name: "Nasi Goreng Kambing Kebon Sirih",
    sku: "RTE-FO-NK-NGK-CH-03-01",
    category: "FO",
    subCategory: "NK",
    temp: "CH",
    shelfLife: 3,
    seq: "01",
    createdAt: "2026-05-24T08:00:00Z",
    notes: "Kemasan boks tahan microwave. Disajikan hangat.",
    allergens: ["Gandum / Gluten", "Kedelai / Soy"],
    handlingInstructions: "Simpan di kulkas chiller suhu 2-4°C. Panaskan dalam microwave selama 2 menit (daya medium-high) sebelum dikonsumsi oleh pelanggan."
  },
  {
    id: "rte-2",
    name: "Cappuccino Cold Brew Blend",
    sku: "RTE-BV-CF-CCB-CH-05-01",
    category: "BV",
    subCategory: "CF",
    temp: "CH",
    shelfLife: 5,
    seq: "01",
    createdAt: "2026-05-24T08:30:00Z",
    notes: "Botol PET 250ml. Kocok dahulu sebelum diminum.",
    allergens: ["Susu Sapi (Laktosa)"],
    handlingInstructions: "Harus tetap dingin di chiller. Jauhkan dari sinar matahari langsung untuk mencegah susu pecah."
  },
  {
    id: "rte-3",
    name: "Croissant Smoked Beef Cheese",
    sku: "RTE-BA-SW-CSB-AM-02-01",
    category: "BA",
    subCategory: "SW",
    temp: "AM",
    shelfLife: 2,
    seq: "01",
    createdAt: "2026-05-23T09:00:00Z",
    notes: "Pastry mentega premium dengan isian daging sapi asap & keju leleh.",
    allergens: ["Gandum / Gluten", "Suku Sapi / Dairy", "Telur / Egg"],
    handlingInstructions: "Simpan di rak pajang suhu ruang kering. Optimal dipanaskan sekilas di Oven / Air Fryer 1 menit sebelum disajikan agar renyah kembali."
  },
  {
    id: "rte-4",
    name: "Mango Cream Pudding Cup",
    sku: "RTE-SN-DS-MCP-CH-04-02",
    category: "SN",
    subCategory: "DS",
    temp: "CH",
    shelfLife: 4,
    seq: "02",
    createdAt: "2026-05-24T07:15:00Z",
    notes: "Dilengkapi vla vanilla manis terpisah.",
    allergens: ["Susu Sapi / Dairy"],
    handlingInstructions: "Wajib dingin. Jangan ditumpuk lebih dari 3 tingkat agar cup kemasan pudding tidak retak."
  }
];
