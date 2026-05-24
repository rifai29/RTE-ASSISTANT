import React from "react";
import { Search, Thermometer, Calendar, Trash2, Download, AlertTriangle, RefreshCw, Layers, CheckCircle } from "lucide-react";
import { SavedRTEProduct } from "../types";
import { CATEGORY_OPTIONS, TEMP_OPTIONS, INITIAL_PRODUCTS } from "../data";
import { LabelPresenter } from "./LabelPresenter";

interface SKUCatalogProps {
  products: SavedRTEProduct[];
  onDeleteProduct: (id: string) => void;
  onResetToDefault: () => void;
}

export const SKUCatalog: React.FC<SKUCatalogProps> = ({ products, onDeleteProduct, onResetToDefault }) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [selectedTemp, setSelectedTemp] = React.useState("ALL");
  const [selectedProduct, setSelectedProduct] = React.useState<SavedRTEProduct | null>(null);

  // Auto-expand first product seed if available
  React.useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  // Handle export to CSV
  const handleExportCSV = () => {
    const headers = ["Nama Produk", "SKU Kode", "Kategori", "Suhu Simpan", "Masa Simpan (Hari)", "Tanggal Dibuat", "Daftar Allergen", "Catatan"];
    const rows = products.map((p) => [
      p.name,
      p.sku,
      p.category,
      p.temp,
      p.shelfLife,
      new Date(p.createdAt).toLocaleDateString("id-ID"),
      (p.allergens || []).join("; "),
      p.notes || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Katalog_Kode_Produk_RTE_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products based on state filters
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
      const matchesTemp = selectedTemp === "ALL" || p.temp === selectedTemp;
      return matchesSearch && matchesCategory && matchesTemp;
    });
  }, [products, searchTerm, selectedCategory, selectedTemp]);

  // Bento Statistics
  const stats = React.useMemo(() => {
    const total = products.length;
    const chilled = products.filter(p => p.temp === "CH").length;
    const frozen = products.filter(p => p.temp === "FR").length;
    const ambient = products.filter(p => p.temp === "AM").length;
    
    return { total, chilled, frozen, ambient };
  }, [products]);

  return (
    <div className="space-y-8">
      
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total SKU Terdaftar</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500">item</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Terstandardisasi HACCP
          </div>
        </div>

        <div className="bg-blue-50/55 border border-blue-100/50 rounded-2xl p-5">
          <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Chilled (2-4°C)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-blue-950">{stats.chilled}</span>
            <span className="text-xs text-blue-700">produk</span>
          </div>
          <div className="text-[10px] text-blue-500 mt-1 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse"></span>
            Wajib Suhu Chiller
          </div>
        </div>

        <div className="bg-cyan-50/55 border border-cyan-100/50 rounded-2xl p-5">
          <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">Frozen (≤ -18°C)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-cyan-950">{stats.frozen}</span>
            <span className="text-xs text-cyan-700">produk</span>
          </div>
          <div className="text-[10px] text-cyan-500 mt-1 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"></span>
            Penyimpanan Beku
          </div>
        </div>

        <div className="bg-emerald-50/55 border border-emerald-100/50 rounded-2xl p-5">
          <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Ambient & Warm</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-950">{stats.ambient}</span>
            <span className="text-xs text-emerald-700">produk</span>
          </div>
          <div className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Suhu Nyaman Sehat
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: SKU Search & Inventory Table */}
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Inventaris Kode</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Cari, sortir, atau ekspor database SKU Ready-To-Eat.</p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs py-2 px-3.5 rounded-xl transition font-medium"
                id="btn-export-csv"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor .CSV
              </button>
              <button
                onClick={onResetToDefault}
                className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs py-2 px-3.5 rounded-xl transition font-medium"
                title="Kembalikan data bawaan pabrik"
                id="btn-reset-default"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search inputs */}
            <div className="relative sm:col-span-1">
              <input
                type="text"
                placeholder="Cari kode/nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-8 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
            </div>

            {/* Filter Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-600 font-medium"
            >
              <option value="ALL">Semua Kategori</option>
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>

            {/* Filter Temp dropdown */}
            <select
              value={selectedTemp}
              onChange={(e) => setSelectedTemp(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-600 font-medium"
            >
              <option value="ALL">Semua Suhu</option>
              {TEMP_OPTIONS.map(t => (
                <option key={t.code} value={t.code}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-y-auto max-h-[440px] divide-y divide-slate-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const isActive = selectedProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition ${
                      isActive ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                          p.temp === "CH" ? "bg-blue-100 text-blue-800" : 
                          p.temp === "FR" ? "bg-cyan-100 text-cyan-800" : 
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {p.temp}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-400 break-all">
                          {p.sku}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Masa simpan: {p.shelfLife} hari &deg; Terdaftar {new Date(p.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus ${p.name} dari katalog?`)) {
                            onDeleteProduct(p.id);
                            if (selectedProduct?.id === p.id) {
                              setSelectedProduct(null);
                            }
                          }
                        }}
                        className="p-1 px-2.5 rounded-lg border border-slate-100 hover:border-rose-100 text-slate-400 hover:text-rose-600 transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <AlertTriangle className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs">Tidak ada produk RTE yang cocok dengan pencarian.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detail Expanded Card with Print Label Presenter */}
        <div className="lg:col-span-6 space-y-6">
          {selectedProduct ? (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>Informasi Detail SKU</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-100">
                    <CheckCircle className="w-3.5 h-3.5" /> AKTIF
                  </span>
                </h3>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Nama Produk:</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedProduct.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Standard SKU:</span>
                    <span className="font-mono font-bold text-slate-800 tracking-wider text-sm mt-0.5 block">{selectedProduct.sku}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-3">
                    <span className="text-slate-400 block font-medium">Catatan / Instruksi Tambahan:</span>
                    <span className="text-slate-600 leading-relaxed italic block mt-1">
                      {selectedProduct.notes || "Tidak ada catatan kustom."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Renders the Print Label simulator */}
              <LabelPresenter product={selectedProduct} />
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-semibold uppercase tracking-wider">Belum Ada Kode Terpilih</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                Silakan tambahkan produk baru di tab pembangun kode atau klik salah satu produk di daftar inventaris.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
