import React from "react";
import { Copy, Check, Printer, AlertTriangle, Thermometer, ShieldAlert, Calendar } from "lucide-react";
import { SavedRTEProduct } from "../types";

interface LabelPresenterProps {
  product: SavedRTEProduct;
}

export const LabelPresenter: React.FC<LabelPresenterProps> = ({ product }) => {
  const [copied, setCopied] = React.useState(false);
  const [productionTime, setProductionTime] = React.useState<string>(() => {
    // Current time or product creation time
    const d = new Date(product.createdAt);
    return isNaN(d.getTime()) ? new Date().toISOString().substring(0, 16) : d.toISOString().substring(0, 16);
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(product.sku);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate Expiry Date dynamically based on selected Production Date & Shelf Life Days
  const computedExpiryDate = React.useMemo(() => {
    const prodDate = new Date(productionTime);
    if (isNaN(prodDate.getTime())) return new Date();
    prodDate.setDate(prodDate.getDate() + (product.shelfLife || 1));
    return prodDate;
  }, [productionTime, product.shelfLife]);

  const [timeLeftStr, setTimeLeftStr] = React.useState("");
  const [isNearExpiry, setIsNearExpiry] = React.useState(false);
  const [isExpired, setIsExpired] = React.useState(false);

  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = computedExpiryDate.getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeftStr("KEDALUWARSA / EXPIRED");
        setIsExpired(true);
        setIsNearExpiry(true);
        return;
      }

      setIsExpired(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Near expiry if less than 24 hours remaining
      setIsNearExpiry(diff < 24 * 60 * 60 * 1000);

      if (days > 0) {
        setTimeLeftStr(`${days} hari, ${hours} jam lagi`);
      } else if (hours > 0) {
        setTimeLeftStr(`${hours} jam, ${mins} menit lagi`);
      } else {
        setTimeLeftStr(`${mins} menit lagi`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // update every minute
    return () => clearInterval(interval);
  }, [computedExpiryDate]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup terblokir! Izinkan popup untuk mencetak label.");
      return;
    }

    const formattedProd = new Date(productionTime).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const formattedExp = computedExpiryDate.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Label RTE - ${product.name}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              color: #000;
              width: 320px;
              margin: 0 auto;
            }
            .label-box {
              border: 3px double #000;
              padding: 15px;
              box-sizing: border-box;
              text-align: center;
              background-color: #fff;
            }
            .header {
              font-size: 16px;
              font-weight: bold;
              border-bottom: 2px dashed #000;
              padding-bottom: 5px;
              margin-bottom: 8px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              margin: 5px 0;
              text-transform: uppercase;
            }
            .sku {
              font-size: 16px;
              font-weight: bold;
              background-color: #000;
              color: #fff;
              display: inline-block;
              padding: 4px 8px;
              margin: 8px 0;
              letter-spacing: 1px;
            }
            .meta-grid {
              text-align: left;
              font-size: 11px;
              line-height: 1.4;
              margin-bottom: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .barcode-sim {
              letter-spacing: 3px;
              font-size: 20px;
              font-weight: normal;
              margin: 10px 0 2px 0;
              font-family: 'Courier New', monospace;
            }
            .temp-badge {
              border: 1px solid #000;
              font-weight: bold;
              padding: 2px 6px;
              font-size: 10px;
              text-transform: uppercase;
              margin-top: 5px;
              display: inline-block;
            }
            .allergens {
              font-size: 10px;
              font-style: italic;
              margin-top: 5px;
              text-align: left;
              border-top: 1px dashed #000;
              padding-top: 5px;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="label-box">
            <div class="header">READY-TO-EAT FOOD SAFETY</div>
            <div class="title">${product.name}</div>
            <div class="sku">${product.sku}</div>
            <div class="meta-grid">
              <div class="meta-row"><strong>PROD:</strong> <span>${formattedProd}</span></div>
              <div class="meta-row"><strong>EXPIRY:</strong> <span>${formattedExp}</span></div>
              <div class="meta-row"><strong>SHELF LIFE:</strong> <span>${product.shelfLife} Hari / Days</span></div>
              <div class="meta-row"><strong>TEMP:</strong> <span>\${tempText(product.temp)}</span></div>
            </div>
            <div class="barcode-sim">||||||||||||||||||||||||</div>
            <div class="temp-badge">${product.temp === "CH" ? "KEEP CHILLED (2-4°C)" : product.temp === "FR" ? "KEEP FROZEN (<= -18°C)" : "STORE AMBIENT (20-25°C)"}</div>
            ${product.allergens && product.allergens.length > 0 ? `<div class="allergens"><strong>ALLERGENS:</strong> ${product.allergens.join(", ")}</div>` : ""}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const tempText = (code: string) => {
    switch (code) {
      case "CH": return "CHILLED (2-4°C)";
      case "FR": return "FROZEN (<= -18°C)";
      case "AM": return "AMBIENT (20-25°C)";
      case "WA": return "WARM (>= 60°C)";
      default: return code;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        
        {/* Print Configuration controls */}
        <div className="flex-1 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Simulasi Keamanan & Cetak Label</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sesuaikan tanggal dan waktu produksi untuk mensimulasikan kepatuhan standardisasi HACCP, masa pakai, dan kalkulator hitung mundur kedaluwarsa secara langsung di lapangan.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-600">
              Waktu Produksi / Pengemasan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={productionTime}
                onChange={(e) => setProductionTime(e.target.value)}
                className="w-full text-sm font-mono bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 outline-none transition font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Real-time warnings based on food constraints */}
          <div className="space-y-3 pt-2">
            {isExpired ? (
              <div className="flex items-start gap-3 bg-red-50 border border-red-150 p-4 rounded-xl text-red-800">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-600 mt-0.5" id="alert-icon-expired" />
                <div>
                  <h5 className="text-xs font-semibold uppercase">Peringatan: Kedaluwarsa Tercapai</h5>
                  <p className="text-[11px] leading-relaxed mt-1 opacity-90">
                    Produk ini telah melewati masa penyimpanan aman ({product.shelfLife} hari). Anda <strong>DILARANG</strong> mendistribusikan produk ini kepada konsumen sekunder karena risiko pertumbuhan kontaminan biologis patogen.
                  </p>
                </div>
              </div>
            ) : isNearExpiry ? (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-150 p-4 rounded-xl text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" id="alert-icon-near" />
                <div>
                  <h5 className="text-xs font-semibold uppercase">Peringatan: Segera Kedaluwarsa</h5>
                  <p className="text-[11px] leading-relaxed mt-1 opacity-90">
                    Masa simpan produk menyisakan kurang dari 24 jam. Direkomendasikan melakukan diskon harga penjualan atau segera memprioritaskan stok ini di barisan depan rak pajang (rotasi FIFO).
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl text-emerald-800 flex items-start gap-3">
                <div className="p-1 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase">RTE Freshness Status: AMAN</h5>
                  <p className="text-[11px] leading-relaxed mt-1 opacity-90">
                    Produk dalam kondisi prima untuk dipajang. Patuhi kebersihan wadah serta kontrol kelebaban suhu ruang untuk memperpanjang daya simpan visual estetis.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-medium py-3 px-4 rounded-xl shadow-lg transition duration-150"
              id="btn-print-thermal"
            >
              <Printer className="w-4 h-4" />
              Cetak Label Fisik
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 active:scale-[0.98] text-xs font-medium py-3 px-4 rounded-xl transition duration-150"
              id="btn-copy-sku"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Salin Kode SKU
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visual Simulated Thermal Label Box */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col items-center">
          <p className="text-[11px] text-slate-400 font-mono mb-2 uppercase tracking-wide">Pratinjau Label Fisik (320px/58mm)</p>
          <div className="w-full max-w-[280px] bg-[#fcfcfc] border-2 border-slate-200 rounded-xl p-5 shadow-inner relative font-mono text-slate-900 select-none">
            {/* Thread of details */}
            <div className="text-center py-1 border-b border-dashed border-slate-800 text-[10px] font-bold tracking-widest text-slate-700">
              READY TO EAT OPERATIONS
            </div>

            {/* Expire Live Barcode */}
            <div className="text-center mt-3">
              <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
                {product.temp === "CH" ? "CHILLED" : product.temp === "FR" ? "FROZEN" : product.temp === "WA" ? "WARM" : "AMBIENT"}
              </span>
            </div>

            <h3 className="text-center font-bold text-sm text-slate-950 uppercase tracking-tight mt-2.5 break-words line-clamp-2 px-1">
              {product.name}
            </h3>

            {/* Simulating QR/Barcode code */}
            <div className="text-center my-3 bg-slate-50 py-1 inline-block w-full border border-slate-100 rounded">
              <p className="text-[9px] text-slate-400 tracking-[0.2em] font-normal select-none">||||||||||||||||||||||||||</p>
              <p className="text-[11px] font-bold tracking-wider text-slate-950 mt-0.5">{product.sku}</p>
            </div>

            {/* Metadata timings */}
            <div className="text-[10px] space-y-1.5 text-slate-800 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">PENGEMASAN:</span>
                <span className="font-semibold text-right">
                  {new Date(productionTime).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">BEST BEFORE:</span>
                <span className="font-bold text-slate-950 text-right">
                  {computedExpiryDate.toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-100/65 rounded px-1.5 py-0.5 mt-0.5">
                <span className="text-slate-500 font-bold">SUHU SIMPAN:</span>
                <span className="font-bold text-slate-900 text-right text-[9px]">{tempText(product.temp)}</span>
              </div>
            </div>

            {/* Countdown widget */}
            <div className="my-3 text-center">
              <p className="text-[8px] text-slate-400 tracking-wider">HITUNG MUNDUR KESEGARAN</p>
              <div className={`text-xs font-bold py-1 rounded mt-1 ${
                isExpired ? "bg-red-100 text-red-800 border border-red-300" :
                isNearExpiry ? "bg-amber-100 text-amber-800 border border-amber-300" :
                "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
                {timeLeftStr}
              </div>
            </div>

            {product.allergens && product.allergens.length > 0 && (
              <div className="text-[9px] text-slate-600 text-left border-t border-dashed border-slate-350 pt-2 leading-snug">
                <span className="font-bold text-slate-700">ALERGEN: </span>
                <span>{product.allergens.join(", ")}</span>
              </div>
            )}

            {/* Bottom mini-barcode strip */}
            <div className="text-center pt-2.5 border-t border-slate-100 mt-2 flex justify-between items-center text-[8px] text-slate-400">
              <span>FIFO REQUIRED</span>
              <span>STANDAR HACCP GRUP</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
