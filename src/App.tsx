import React from "react";
import { Layers, PlusCircle, BookOpen, Utensils, ShieldCheck, Heart, Info, Sparkles, LayoutDashboard, Truck, ShieldAlert } from "lucide-react";
import { SavedRTEProduct } from "./types";
import { INITIAL_PRODUCTS } from "./data";
import { SKUCatalog } from "./components/SKUCatalog";
import { SKUBuilder } from "./components/SKUBuilder";
import { SKUDecoder } from "./components/SKUDecoder";

export default function App() {
  // Tabs: "catalog" | "create" | "decode"
  const [activeTab, setActiveTab] = React.useState<"catalog" | "create" | "decode">("catalog");

  // Load products from localStorage or fall back to Initial seed products
  const [products, setProducts] = React.useState<SavedRTEProduct[]>(() => {
    const saved = localStorage.getItem("rte_products_catalog");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved RTE products:", e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Sync to localStorage on any changes
  React.useEffect(() => {
    localStorage.setItem("rte_products_catalog", JSON.stringify(products));
  }, [products]);

  // Handler: Save newly generated product code
  const handleSaveProduct = (newProduct: SavedRTEProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    // Smoothly redirect user back to the catalog view to see their item!
    setTimeout(() => {
      setActiveTab("catalog");
    }, 400);
  };

  // Handler: Delete product from catalog
  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Handler: Reset to original demo data
  const handleResetToDefault = () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang data katalog ke versi default pabrik?")) {
      setProducts(INITIAL_PRODUCTS);
      localStorage.removeItem("rte_products_catalog");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased">
      
      {/* SIDEBAR NAVIGATION - Dark Professional Theme */}
      <aside className="w-72 bg-slate-950 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-900">
        
        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3 border-b border-slate-900">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/30">
            R
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-tight leading-none uppercase">RTE Master</h1>
            <span className="text-[10px] text-slate-500 font-medium">HACCP & ISO 22000 Standard</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Manajemen Kode</p>
          
          <button
            onClick={() => setActiveTab("catalog")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
              activeTab === "catalog"
                ? "bg-slate-900 border-l-4 border-blue-500 text-white shadow-sm"
                : "hover:bg-slate-900/60 text-slate-400 hover:text-slate-200"
            }`}
            id="tab-catalog"
          >
            <Layers className={`w-4 h-4 shrink-0 ${activeTab === "catalog" ? "text-blue-500" : ""}`} />
            <span>Katalog & Fresh-Timer</span>
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
              activeTab === "create"
                ? "bg-slate-900 border-l-4 border-blue-500 text-white shadow-sm"
                : "hover:bg-slate-900/60 text-slate-400 hover:text-slate-200"
            }`}
            id="tab-create"
          >
            <PlusCircle className={`w-4 h-4 shrink-0 ${activeTab === "create" ? "text-blue-500" : ""}`} />
            <span>Buat Kode Baru (AI)</span>
          </button>

          <button
            onClick={() => setActiveTab("decode")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
              activeTab === "decode"
                ? "bg-slate-900 border-l-4 border-blue-500 text-white shadow-sm"
                : "hover:bg-slate-900/60 text-slate-400 hover:text-slate-200"
            }`}
            id="tab-decode"
          >
            <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === "decode" ? "text-blue-500" : ""}`} />
            <span>Dekoder & Validator</span>
          </button>

          {/* Supplementary mock sections that enrich the layout according to the requested design HTML */}
          <div className="pt-6">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Sistem Logistik (Mock)</p>
            
            <div className="flex items-center justify-between px-4 py-3 rounded-xl text-xs text-slate-500 cursor-not-allowed hover:bg-slate-900/20">
              <div className="flex items-center space-x-3">
                <Truck className="w-4 h-4 shrink-0 text-slate-600" />
                <span>Pengiriman & Suplai</span>
              </div>
              <span className="text-[9px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded font-mono uppercase">Locked</span>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-xl text-xs text-slate-500 cursor-not-allowed hover:bg-slate-900/20">
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-600" />
                <span>Analitik Dapur</span>
              </div>
              <span className="text-[9px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded font-mono uppercase">Locked</span>
            </div>
          </div>
        </nav>

        {/* User Card */}
        <div className="p-6 border-t border-slate-900 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-200 uppercase">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white font-medium truncate">Admin Gudang</p>
              <p className="text-[10px] text-slate-500 truncate">ID #99212 &bull; QC-HACCP</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CORE WORKSPACE - Light Professional Layout */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-start gap-6 px-8 shadow-sm flex-shrink-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-bold tracking-wider uppercase">
              RTE MASTER MANAGER v2.0
            </span>
            <h1 className="text-sm font-bold text-slate-800 hidden sm:block">
              Manajemen Kode Produk Ready-to-Eat
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/60 rounded-full px-3.5 py-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Sertifikasi HACCP Valid</span>
            </div>

            {activeTab !== "create" && (
              <button
                onClick={() => setActiveTab("create")}
                className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                id="btn-quick-add"
              >
                + Tambah Kode RTE
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Main Module Panel Display */}
          <div className="transition-all duration-300">
            {activeTab === "catalog" && (
              <SKUCatalog
                products={products}
                onDeleteProduct={handleDeleteProduct}
                onResetToDefault={handleResetToDefault}
              />
            )}

            {activeTab === "create" && (
              <SKUBuilder onSaveProduct={handleSaveProduct} />
            )}

            {activeTab === "decode" && (
              <SKUDecoder />
            )}
          </div>

          {/* Elegant Standarisation Banner */}
          <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-slate-800/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-950 rounded-lg text-blue-400 text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Abreviasi Dinamis [ABBR]</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Standardisasi inisial 3 huruf menyederhanakan pelacakan. Misalnya, "Puding Mangga" disingkat PMG untuk pencarian inventaris yang bersih dan rapi.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-950 rounded-lg text-blue-400 text-xs font-bold flex items-center justify-center">2</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Metode FIFO Ketat</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Wajib menempatkan kode dengan hari kedaluwarsa terdekat di sisi luar etalase. Label kami memicu kode oranye/merah saat produk mendekati batas konsumsi aman.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-950 rounded-lg text-blue-400 text-xs font-bold flex items-center justify-center">3</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">HACCP & Keamanan Suhu</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Suhu Chilled (CH), Frozen (FR), Ambient (AM), dan Warm (WA) terintegrasi langsung ke dalam segmen kode SKU guna menghindari kesalahan meletakkan wadah makanan.
              </p>
            </div>
          </div>

          {/* Aesthetic footer copyright signature */}
          <footer className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="font-medium flex items-center justify-center gap-1.5">
              <span>Dibuat demi keamanan pangan operasional ritel kuliner</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </p>
            <p className="text-[10px] text-slate-300 font-mono">
              Ready-To-Eat (RTE) Regulatory Compliant Portal &bull; Standard ISO/HACCP 22000
            </p>
          </footer>

        </div>
      </main>

    </div>
  );
}

