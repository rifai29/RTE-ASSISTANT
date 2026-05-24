import React from "react";
import { Search, ShieldAlert, CheckCircle2, RotateCcw, AlertCircle, BookOpen } from "lucide-react";
import { DecodedSKUDetails } from "../types";

export const SKUDecoder: React.FC = () => {
  const [skuInput, setSkuInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [decodedResult, setDecodedResult] = React.useState<DecodedSKUDetails | null>(null);
  const [source, setSource] = React.useState<"gemini" | "local" | null>(null);

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSku = skuInput.trim().toUpperCase();
    if (!cleanSku) {
      setErrorMsg("Harap masukkan kode SKU terlebih dahulu!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setDecodedResult(null);

    try {
      const response = await fetch("/api/gemini/decode-sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: cleanSku })
      });

      if (!response.ok) {
        throw new Error("Gagal memanggil server dekoder.");
      }

      const resData = await response.json();
      if (resData.result) {
        setDecodedResult(resData.result);
        setSource(resData.source);
      } else {
        throw new Error("Format respons tidak valid.");
      }
    } catch (err: any) {
      console.error(err);
      
      // Local fallback parser to guarantee absolute robust 100% execution
      const parts = cleanSku.split("-");
      const isValidFormat = parts.length === 7 && parts[0] === "RTE";

      if (!isValidFormat) {
        setDecodedResult({
          isValid: false,
          errorReason: "Format kode tidak sesuai standar 7-segmen. Contoh format yang benar: RTE-FO-NK-NSG-CH-03-01.",
          category: "Tidak Diketahui",
          subCategory: "Tidak Diketahui",
          productNameGuess: "Tidak Diketahui",
          temperatureReq: "Tidak Diketahui",
          shelfLifeDays: 0,
          allergensWarning: "Tidak Ada Informasi",
          operationalTips: "Pastikan kode berawalan RTE dan dipisahkan 6 tanda strip (-)."
        });
      } else {
        const catCode = parts[1];
        const subCode = parts[2];
        const tempCode = parts[4];
        const shelf = parseInt(parts[5], 10) || 0;

        setDecodedResult({
          isValid: true,
          errorReason: "",
          category: catCode === "FO" ? "Makanan Berat (Food)" : catCode === "BV" ? "Minuman (Beverage)" : catCode === "SN" ? "Camilan (Snack)" : "Bakery",
          subCategory: `${subCode} (Kode Sub-golongan)`,
          productNameGuess: `Nama inisial kata '${parts[3]}'`,
          temperatureReq: tempCode === "CH" ? "Chill Dingin (2-4°C)" : tempCode === "FR" ? "Beku (<= -18°C)" : "Ambient (Suhu Ruang)",
          shelfLifeDays: shelf,
          allergensWarning: "Kemungkinan mengandung gandum, susu, telur berdasarkan golongan siap-saji.",
          operationalTips: "Simpan pada rak pajang berlabel yang sesuai dengan kepatuhan HACCP."
        });
      }
      setSource("local");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSkuInput("");
    setDecodedResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header summary */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <BookOpen className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Dekoder & Validasi Kode RTE</h3>
          <p className="text-xs text-slate-500">
            Salin dan tempel kode produk RTE di bawah untuk memeriksa kesahihan format, menerjemahkan kode singkatan produk serta tips penyimpanan higienitas operasi dapur.
          </p>
        </div>

        {/* Form input field search */}
        <form onSubmit={handleDecode} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              placeholder="Contoh: RTE-FO-NK-NGK-CH-03-01"
              className="w-full text-sm font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl pl-11 pr-4 py-3.5 outline-none transition uppercase tracking-wider text-slate-800 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none uppercase tracking-wide text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl text-center active:scale-[0.98] transition shadow-md shadow-blue-500/10 cursor-pointer"
              id="btn-trigger-decode"
            >
              Terjemahkan
            </button>
            {skuInput && (
              <button
                type="button"
                onClick={handleClear}
                className="p-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
                id="btn-clear-decode"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {errorMsg && (
          <div className="bg-rose-50 text-rose-700 border border-rose-100 p-4 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Decoder Output presentation rendering */}
        {decodedResult && (
          <div className="border border-slate-100 bg-slate-50/70 p-6 rounded-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4">
              <div className="flex items-center gap-2">
                {decodedResult.isValid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-widest bg-blue-100/60 px-2.5 py-1 rounded">
                      Kode Valid / Standar
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-600 animate-bounce" />
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-widest bg-rose-100 px-2.5 py-1 rounded">
                      KODE TIDAK STANDAR / INVALID
                    </span>
                  </>
                )}
              </div>
              {source && (
                <span className="text-[10px] text-slate-400">
                  Model: {source === "gemini" ? "AI Gemini 3.5" : "Parser Pola Lokal"}
                </span>
              )}
            </div>

            {/* Error detail if invalid */}
            {!decodedResult.isValid && (
              <div className="bg-red-50 text-red-900 border border-red-150 rounded-xl p-4 text-xs leading-relaxed">
                <span className="font-bold block uppercase mb-1">Kegagalan Format Ditemukan:</span>
                {decodedResult.errorReason}
              </div>
            )}

            {/* Structured translation layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-mono block">KATEGORI PRODUK</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">{decodedResult.category}</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-mono block">SUB-GOLONGAN</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">{decodedResult.subCategory}</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-mono block">PERKIRAAN NAMA PRODUK</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">{decodedResult.productNameGuess}</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-mono block">SUHU PENYIMPANAN WAJIB</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">{decodedResult.temperatureReq}</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 md:col-span-2">
                <span className="text-[10px] text-slate-400 font-mono block">DURASI MASAK / DAYA SIMPAN SEBAGAI MAKANAN RTE</span>
                <span className="text-sm font-bold text-blue-700 block mt-0.5">{decodedResult.shelfLifeDays} Hari (Optimal Freshness)</span>
              </div>
            </div>

            {/* Warm warnings */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">PERINGATAN RISIKO ALLERGEN</span>
                <p className="text-xs text-rose-700 font-medium leading-relaxed mt-1">{decodedResult.allergensWarning}</p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-mono block">OPERASIONAL HIGIENITAS FOOD SAFETY</span>
                <p className="text-xs text-slate-600 leading-relaxed mt-1 italic font-medium">"{decodedResult.operationalTips}"</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
