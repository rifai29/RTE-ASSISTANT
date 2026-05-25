import React from "react";
import { Sparkles, Calendar, PlusCircle, Bookmark, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, TEMP_OPTIONS } from "../data";
import { GeneratedSKUDetails, SavedRTEProduct } from "../types";

interface SKUBuilderProps {
  onSaveProduct: (newProduct: SavedRTEProduct) => void;
}

export const SKUBuilder: React.FC<SKUBuilderProps> = ({ onSaveProduct }) => {
  // Form States
  const [productName, setProductName] = React.useState("");
  const [pluCode, setPluCode] = React.useState(""); // PLU code for quick cash register scanning
  const [category, setCategory] = React.useState("FO");
  const [subCategory, setSubCategory] = React.useState("NK");
  const [temp, setTemp] = React.useState("CH");
  const [shelfLife, setShelfLife] = React.useState("3");
  const [seq, setSeq] = React.useState("01");
  const [customDescription, setCustomDescription] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Loading, API response & error states
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [skuResult, setSkuResult] = React.useState<GeneratedSKUDetails | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<"gemini" | "local" | null>(null);

  // Automatically update suggested subcategories when category changes
  const filteredSubCategories = React.useMemo(() => {
    const list = SUBCATEGORY_OPTIONS.filter((sub) => sub.categoryCode === category);
    if (list.length > 0 && !list.some((s) => s.code === subCategory)) {
      setSubCategory(list[0].code);
    }
    return list;
  }, [category]);

  const generateRTECode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMsg("Nama produk tidak boleh kosong!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSkuResult(null);
    setIsSaved(false);

    try {
      const response = await fetch("/api/gemini/generate-sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName,
          category,
          subCategory,
          temp,
          shelfLife,
          seq,
          customDescription
        })
      });

      if (!response.ok) {
        throw new Error("Gagal terhubung dengan server pengolah kode.");
      }

      const resData = await response.json();
      if (resData.result) {
        setSkuResult(resData.result);
        setDataSource(resData.source);
      } else {
        throw new Error("Format respons tidak valid.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan teknis saat meminta pembuatan kode AI. Tetap membuat kode lokal.");
      
      // Secondary client-side fallback to guarantee absolute robust 100% uptime:
      const words = productName.trim().split(/\s+/);
      let abbr = "PRD";
      if (words.length >= 3) {
        abbr = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      } else if (words.length === 2) {
        abbr = (words[0].substring(0, 2) + words[1][0]).toUpperCase();
      } else if (words.length === 1 && words[0].length >= 3) {
        abbr = words[0].substring(0, 3).toUpperCase();
      }
      const uCat = category.toUpperCase().substring(0, 2);
      const uSub = subCategory.toUpperCase().substring(0, 2);
      const uTemp = temp.toUpperCase().substring(0, 2);
      const uShelf = String(shelfLife || "03").padStart(2, "0");
      const uSeq = String(seq || "01").padStart(2, "0");
      
      const computedSku = `RTE-${uCat}-${uSub}-${abbr}-${uTemp}-${uShelf}-${uSeq}`;
      
      setSkuResult({
        sku: computedSku,
        categoryName: category === "FO" ? "Makanan Berat" : category === "BV" ? "Minuman" : category === "SN" ? "Camilan" : "Bakery & Pastry",
        subCategoryName: SUBCATEGORY_OPTIONS.find(s => s.code === subCategory)?.name || "Lain-lain",
        temperatureLabel: temp === "CH" ? "Chilled (Dingin 2-4°C)" : temp === "FR" ? "Frozen (Beku)" : "Ambient (Suhu Ruang)",
        shelfLifeExplanation: `${shelfLife} hari kesegaran optimal.`,
        allergens: ["Gandum / Gluten", "Susu / Dairy"],
        codeDecomposition: {
          prefix: "RTE (Ready-To-Eat)",
          category: `${uCat} (Kategori)`,
          subCategory: `${uSub} (Sub-tipe)`,
          abbr: `${abbr} (Nama Produk)`,
          temp: `${uTemp} (Suhu)`,
          shelfLife: `${uShelf} Hari`,
          seq: `${uSeq} (Urutan/Batch)`
        },
        handlingInstructions: "Simpan pada suhu terkendali. Lakukan pemeriksaan visual sebelum disajikan."
      });
      setDataSource("local");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToCatalog = () => {
    if (!skuResult) return;

    const newPrd: SavedRTEProduct = {
      id: `rte-${Date.now()}`,
      name: productName,
      sku: skuResult.sku,
      pluCode: pluCode.trim() || undefined,
      category,
      subCategory,
      temp,
      shelfLife: parseInt(shelfLife, 10) || 1,
      seq,
      createdAt: new Date().toISOString(),
      notes: notes || customDescription,
      allergens: skuResult.allergens,
      handlingInstructions: skuResult.handlingInstructions
    };

    onSaveProduct(newPrd);
    setIsSaved(true);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Input parameters form block */}
      <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Format Ulang & Buat Kode Baru</h3>
            <p className="text-xs text-slate-500">Buat kode SKU standardisasi industri Ready-to-Eat cepat didukung asisten AI.</p>
          </div>
        </div>

        <form onSubmit={generateRTECode} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Target Product Name */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Nama Produk RTE <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Contoh: Pop Mie Rasa Soto Cup atau Kopi Espresso Hot</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Masukkan keterangan ringkas nama makanan/minuman"
                className="w-full text-sm bg-slate-50/70 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 font-medium"
                required
              />
            </div>

            {/* PLU Cashier Code (POS) Input */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Kode PLU Kasir / Mesin POS (Opsional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Contoh: 5012 untuk Mie Kup, 4001 untuk Arabika</span>
              </label>
              <input
                type="text"
                value={pluCode}
                onChange={(e) => setPluCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Masukkan nomor PLU kasir (misal 5012)"
                className="w-full text-sm bg-slate-50/70 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Kategori Utama</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-100"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.name} ({cat.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Sub-category based on selected category */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Sub-Kategori</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-100"
              >
                {filteredSubCategories.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Storage Temperature Requirement */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 font-medium">Suhu Penyimpanan Mandatori</label>
              <select
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-100"
              >
                {TEMP_OPTIONS.map((tp) => (
                  <option key={tp.code} value={tp.code}>
                    {tp.name} &middot; ({tp.tempRange})
                  </option>
                ))}
              </select>
            </div>

            {/* Shelf-Life Expiry Counter in Days */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Masa Simpan Kedaluwarsa (Hari)</label>
              <input
                type="number"
                min="0"
                max="99"
                value={shelfLife}
                onChange={(e) => setShelfLife(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {/* Sequence number / Batch ID */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Sequence / Nomor Batch Urut</label>
              <input
                type="text"
                maxLength={2}
                value={seq}
                onChange={(e) => setSeq(e.target.value.replace(/\D/g, ""))}
                placeholder="01"
                className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-center font-mono outline-none transition focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {/* Internal Admin Operator Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Catatan/Instruksi Operator</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Kemas vacuum pack kedap udara"
                className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* AI Context enrichment info box */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Deskripsi Bahan & Cara Kerja (Opsional untuk AI)</span>
                <span className="text-[10px] text-slate-400 font-normal">Membantu AI mendeteksi allergen otomatis</span>
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={2}
                placeholder="Kandungan: telur dadar rebus, tahu goreng, saus kacang pedas, kecap manis..."
                className="w-full text-sm bg-slate-50/70 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 resize-none"
              />
            </div>

          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
               type="submit"
               disabled={isLoading}
               className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/10 active:scale-[0.99] transition duration-150 cursor-pointer"
               id="btn-generate-sku-rte"
             >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Memproses Logika Kode RTE...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Buat Struktur Kode RTE
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Result Display Output */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Grid ambient background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950 border border-blue-900 rounded-full px-2.5 py-1">
                Output Hasil Kode
              </span>
              {dataSource && (
                <span className="text-[10px] text-slate-400 italic">
                  Sumber data: {dataSource === "gemini" ? "🤖 Gemini AI" : "🏡 Komputasi Lokal"}
                </span>
              )}
            </div>

            {skuResult ? (
              <div className="space-y-5">
                {/* Huge Code Block */}
                <div>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">Standardized SKU</p>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-xl font-mono font-bold tracking-wider text-blue-400 break-all select-all">
                      {skuResult.sku}
                    </span>
                  </div>
                </div>

                {/* Micro Analysis Segment breakdown */}
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Uraian Struktur Segmen:</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-950/60 p-2 border border-slate-800 rounded">
                      <span className="text-slate-500 block">Prefix:</span>
                      <span className="text-slate-200">{skuResult.codeDecomposition.prefix}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 border border-slate-800 rounded">
                      <span className="text-slate-500 block">Kategori [CAT]:</span>
                      <span className="text-slate-200 font-bold">{skuResult.codeDecomposition.category}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 border border-slate-800 rounded col-span-2">
                      <span className="text-slate-500 block">Sub-Kategori [SUB]:</span>
                      <span className="text-slate-200">{skuResult.codeDecomposition.subCategory}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 border border-slate-800 rounded text-amber-300">
                      <span className="text-slate-500 block">Inisial Nama [ABBR]:</span>
                      <span className="font-bold">{skuResult.codeDecomposition.abbr}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 border border-slate-800 rounded">
                      <span className="text-slate-500 block">Suhu Penjagaan [TEMP]:</span>
                      <span className="text-slate-200">{skuResult.codeDecomposition.temp}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 border border-slate-800 rounded">
                      <span className="text-slate-500 block">Daya Simpan [SHELF]:</span>
                      <span className="text-slate-200">{skuResult.codeDecomposition.shelfLife}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 border border-slate-800 rounded">
                      <span className="text-slate-500 block">Nomor Seri/Seq:</span>
                      <span className="text-slate-200">{skuResult.codeDecomposition.seq}</span>
                    </div>
                  </div>
                </div>

                {/* Additional metadata info blocks */}
                <div className="border-t border-slate-850 pt-4 space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-mono uppercase">Info Kategori</h4>
                      <p className="text-xs text-slate-200 font-medium">{skuResult.categoryName} &middot; {skuResult.subCategoryName}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-mono uppercase">Suhu Kerja</h4>
                      <p className="text-xs text-slate-200 font-medium">{skuResult.temperatureLabel}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] text-slate-400 font-mono uppercase mb-1">Kemungkinan Alergen Terkait</h4>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {skuResult.allergens.length > 0 ? (
                        skuResult.allergens.map((alg, index) => (
                          <span key={index} className="text-[10px] bg-red-950/60 text-red-300 border border-red-900/60 rounded px-2 py-0.5 font-semibold">
                            {alg}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Bebas Allergen Umum</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] text-slate-400 font-mono uppercase">Protokol Higienitas / Penanganan</h4>
                    <p className="text-xs text-slate-300 leading-relaxed italic">{skuResult.handlingInstructions}</p>
                  </div>
                </div>

                {/* Save to shelf catalog button */}
                <div className="pt-3">
                  <button
                    onClick={handleSaveToCatalog}
                    disabled={isSaved}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold py-3.5 px-4 rounded-xl transition duration-150 active:scale-[0.98] shadow-lg shadow-blue-500/10 cursor-pointer"
                    id="btn-save-catalog"
                  >
                    <Bookmark className="w-4 h-4" />
                    {isSaved ? "Tersimpan Ke Katalog Utama" : "Simpan Ke Daftar Katalog Utama"}
                  </button>
                </div>
              </div>
            ) : (
              /* Waiting state placeholder */
              <div className="py-16 text-center text-slate-500 space-y-4">
                <div className="w-12 h-12 bg-slate-850/65 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-800">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Katalog Kosong</h4>
                  <p className="text-[11px] leading-relaxed max-w-[200px] mx-auto mt-1">
                    Silakan isi form di samping kiri dan klik tombol buat struktur untuk melihat hasil visualisasi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Education Widget explaining standards for RTE food codes */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 text-amber-800 text-xs leading-relaxed flex gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-amber-900 uppercase tracking-wider text-[11px]">STANDAR KODE RTE INTERNASIONAL</h5>
            <p>
              Struktur pembagian kode ini didesain berdasarkan standar penjaminan kualitas makanan <strong>HACCP & ISO 22000</strong>. Segmen penanda suhu penting untuk memastikan petugas operasional dapur menyusun bahan makanan baku dan siap saji secara terdistribusi di wadah penyimpanan pendingin yang tepat guna mencegah perkembangbiakan kotoran mikrobiologi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
