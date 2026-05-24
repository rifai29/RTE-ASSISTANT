import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
const getGeminiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    // We do not crash the server on missing API key; we just let routes fall back gracefully
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
};

// API routes definition

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiKeyAvailable: !!process.env.GEMINI_API_KEY });
});

// Helper for static mockup generation
const mockGenerateSKU = (name: string, category: string, subCategory: string, temp: string, shelfLife: string, seq: string) => {
  const catCode = (category || "FO").toUpperCase().substring(0, 2);
  const subCode = (subCategory || "NK").toUpperCase().substring(0, 2);
  const words = name.trim().split(/\s+/);
  let abbr = "PRD";
  if (words.length >= 3) {
    abbr = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    abbr = (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 3) {
    abbr = words[0].substring(0, 3).toUpperCase();
  }
  const cleanTemp = (temp || "CH").toUpperCase().substring(0, 2);
  const cleanShelf = String(shelfLife || "03").padStart(2, "0");
  const cleanSeq = String(seq || "01").padStart(2, "0");

  const sku = `RTE-${catCode}-${subCode}-${abbr}-${cleanTemp}-${cleanShelf}-${cleanSeq}`;

  return {
    sku,
    categoryName: catCode === "FO" ? "Makanan Berat (Food)" : catCode === "BV" ? "Minuman (Beverage)" : catCode === "SN" ? "Camilan (Snack)" : "Bakery & Pastry",
    subCategoryName: subCode === "NK" ? "Nasi & Karbohidrat" : subCode === "CO" ? "Kopi & Kafein" : subCode === "SW" ? "Sandwich & Roti Isi" : "Variant/Lainnya",
    temperatureLabel: cleanTemp === "CH" ? "Chilled (Dingin 2-4°C)" : cleanTemp === "FR" ? "Frozen (Beku <= -18°C)" : cleanTemp === "AM" ? "Ambient (Suhu Ruang 20-25°C)" : "Warm (Hangat 60°C)",
    shelfLifeExplanation: `${cleanShelf} hari penyimpanan optimal sejak waktu produksi.`,
    allergens: ["Gandum / Gluten", "Susu / Dairy"],
    codeDecomposition: {
      prefix: "RTE (Ready-To-Eat)",
      category: `${catCode} (${catCode === "FO" ? "Food" : "Beverage"})`,
      subCategory: `${subCode} (Sub-tipe)`,
      abbr: `${abbr} (Singkatan Nama)`,
      temp: `${cleanTemp} (${cleanTemp === "CH" ? "Chilled" : "Frozen"})`,
      shelfLife: `${cleanShelf} Hari Kedaluwarsa`,
      seq: `${cleanSeq} (Nomor Urut / Batch)`
    },
    handlingInstructions: "Simpan pada suhu terkendali. Pastikan label kedaluwarsa terlihat jelas sebelum didistribusikan ke etalase toko."
  };
};

// API: Generate product code
app.post("/api/gemini/generate-sku", async (req, res) => {
  const { name, category, subCategory, temp, shelfLife, seq, customDescription } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Product name is required" });
  }

  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

  if (!hasKey) {
    // Graceful fallback to local generator
    console.log("No Gemini API Key found. Returning local generated mockup.");
    const mock = mockGenerateSKU(name, category, subCategory, temp, shelfLife, seq);
    return res.json({ result: mock, source: "local" });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      Create a standardized product code SKU and rich metadata for a Ready-To-Eat (RTE) item with the following details:
      Product Name: "${name}"
      Requested Category (2 letter code suggested, e.g. FO for Food, BV for Beverage, SN for Snack, BA for Bakery): "${category}"
      Requested Sub-category (2 letter code suggested, e.g. SW, NK, CO): "${subCategory}"
      Requested Temperature requirement (CH: Chilled, FR: Frozen, AM: Ambient, WA: Warm): "${temp}"
      Shelf Life in Days: "${shelfLife}"
      Sequence/Batch number: "${seq}"
      Additional Details: "${customDescription || 'N/A'}"

      RTE SKU Standards to follow strictly:
      Format: RTE-[CAT]-[SUB]-[ABBR]-[TEMP]-[SHELF_LIFE]-[SEQ]
      Where:
      - RTE is literal.
      - [CAT] is a 2-letter uppercase category code.
      - [SUB] is a 2-letter uppercase sub-type code.
      - [ABBR] is a 3-letter uppercase abbreviation of the product name (e.g. Nasi Goreng -> NSG). Make sure it represents the product name beautifully.
      - [TEMP] is a 2-letter uppercase storage temp code (CH, FR, AM, WA).
      - [SHELF_LIFE] is 2-digit zero-padded number of shelf life days (e.g. 03).
      - [SEQ] is 2-digit zero-padded sequence number (e.g. 01).

      Output must be in JSON adhering to Indonesian language.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sku: { type: Type.STRING, description: "Generated code SKU e.g. RTE-FO-NK-NSG-CH-03-01" },
            categoryName: { type: Type.STRING, description: "Indonesian category name" },
            subCategoryName: { type: Type.STRING, description: "Indonesian subcategory name" },
            temperatureLabel: { type: Type.STRING, description: "Storage temperature advice in Indonesian (e.g. Chilled (2-4°C))" },
            shelfLifeExplanation: { type: Type.STRING, description: "Indonesian explanation of shelf life" },
            allergens: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Allergens likely contained in the specified product in Indonesian" 
            },
            codeDecomposition: {
              type: Type.OBJECT,
              properties: {
                prefix: { type: Type.STRING, description: "Format prefix e.g. RTE (Ready-To-Eat)" },
                category: { type: Type.STRING, description: "e.g. FO (Food / Makanan)" },
                subCategory: { type: Type.STRING, description: "e.g. NK (Nasi & Karbohidrat)" },
                abbr: { type: Type.STRING, description: "e.g. NSG (Nasi Goreng)" },
                temp: { type: Type.STRING, description: "e.g. CH (Chilled)" },
                shelfLife: { type: Type.STRING, description: "e.g. 03 (3 Hari)" },
                seq: { type: Type.STRING, description: "e.g. 01 (Batch/Urutan)" }
              },
              required: ["prefix", "category", "subCategory", "abbr", "temp", "shelfLife", "seq"]
            },
            handlingInstructions: { type: Type.STRING, description: "Indonesian operational food handling instructions" }
          },
          required: ["sku", "categoryName", "subCategoryName", "temperatureLabel", "shelfLifeExplanation", "allergens", "codeDecomposition", "handlingInstructions"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ result: data, source: "gemini" });
  } catch (error: any) {
    console.error("Gemini SKU Generation error:", error);
    // Fallback to local
    const mock = mockGenerateSKU(name, category, subCategory, temp, shelfLife, seq);
    return res.json({ result: mock, source: "local", error: error?.message || "Gemini unavailable" });
  }
});

// API: Parse/Decode existing SKU code
app.post("/api/gemini/decode-sku", async (req, res) => {
  const { sku } = req.body;

  if (!sku) {
    return res.status(400).json({ error: "Product SKU is required" });
  }

  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

  if (!hasKey) {
    // Fallback parser
    console.log("No Gemini API Key found. Parsing with mock regex.");
    const parts = sku.toUpperCase().split("-");
    const isValid = parts.length === 7 && parts[0] === "RTE";
    
    if (!isValid) {
      return res.json({
        result: {
          isValid: false,
          errorReason: "Format kode tidak sesuai standar. Harus berisi 7 segmen dipisahkan tanda strip (contoh: RTE-FO-NK-NSG-CH-03-01).",
          category: "Tidak Diketahui",
          subCategory: "Tidak Diketahui",
          productNameGuess: "Tidak Diketahui",
          temperatureReq: "Tidak Diketahui",
          shelfLifeDays: 0,
          allergensWarning: "Tidak Ada Informasi",
          operationalTips: "Periksa kembali struktur kode produk RTE Anda."
        },
        source: "local"
      });
    }

    const cat = parts[1];
    const sub = parts[2];
    const tempCode = parts[4];
    const shelf = parseInt(parts[5], 10) || 0;

    return res.json({
      result: {
        isValid: true,
        errorReason: "",
        category: cat === "FO" ? "Makanan Utama (Food)" : cat === "BV" ? "Minuman (Beverage)" : cat === "SN" ? "Camilan (Snack)" : "Bakery / Kue",
        subCategory: `${sub} (Sub-golongan)`,
        productNameGuess: `Produk dengan inisial '${parts[3]}'`,
        temperatureReq: tempCode === "CH" ? "Chill Dingin 2-4°C" : tempCode === "FR" ? "Beku/Frozen <= -18°C" : "Ambient/Suhu Ruang",
        shelfLifeDays: shelf,
        allergensWarning: "Dapat mengandung Gandum, Telur, atau Kacang-kacangan bergantung pada varian.",
        operationalTips: "Pastikan rotasi FIFO (First In First Out) diterapkan dengan ketat."
      },
      source: "local"
    });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      Analyze and decode the following Ready-To-Eat (RTE) Product SKU: "${sku}"
      Standard format expectation is: RTE-[CAT]-[SUB]-[ABBR]-[TEMP]-[SHELF_LIFE]-[SEQ]
      Check if it is valid, decompose the segments and provide informative guesses and food safety advice in Indonesian.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: "True if code follows the 7-segment standard pattern" },
            errorReason: { type: Type.STRING, description: "Why it is invalid, empty if valid" },
            category: { type: Type.STRING, description: "Category decoded in Indonesian" },
            subCategory: { type: Type.STRING, description: "Subcategory decoded in Indonesian" },
            productNameGuess: { type: Type.STRING, description: "Educated guess of what product this is based on abbreviation e.g. NSG might be Nasi Goreng" },
            temperatureReq: { type: Type.STRING, description: "Decoded storage temperature requirement in Indonesian" },
            shelfLifeDays: { type: Type.INTEGER, description: "Decoded shelf life in days" },
            allergensWarning: { type: Type.STRING, description: "Typical allergen risk warning for this code in Indonesian" },
            operationalTips: { type: Type.STRING, description: "Food safety/serving tip in Indonesian" }
          },
          required: ["isValid", "errorReason", "category", "subCategory", "productNameGuess", "temperatureReq", "shelfLifeDays", "allergensWarning", "operationalTips"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ result: data, source: "gemini" });
  } catch (error: any) {
    console.error("Gemini SKU Decode error:", error);
    return res.status(500).json({ error: "Failed to decode SKU via Gemini: " + error?.message });
  }
});


// Serve files in development / production
startServer();

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
