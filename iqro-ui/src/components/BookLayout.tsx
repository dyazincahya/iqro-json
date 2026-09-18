import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Home,
  HelpCircle,
  Languages,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { OcrEngineInfo } from "../types";

const FOCUS_MODE_STORAGE_KEY = "iqro_focus_mode";

interface BookLayoutProps {
  levelTitle: string;
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  onBackToMenu: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  rtlReading: boolean;
  onToggleRtlReading: () => void;
  showLatin: boolean;
  onToggleShowLatin: () => void;
  ocrEngine: string;
  onChangeOcrEngine: (ocr: string) => void;
  ocrEngines?: OcrEngineInfo[];
  children: React.ReactNode;
}

export const BookLayout: React.FC<BookLayoutProps> = ({
  levelTitle,
  currentPage,
  totalPages,
  onNext,
  onPrev,
  onBackToMenu,
  isBookmarked,
  onToggleBookmark,
  rtlReading,
  onToggleRtlReading,
  showLatin,
  onToggleShowLatin,
  ocrEngine,
  onChangeOcrEngine,
  ocrEngines = [],
  children,
}) => {
  const [isFocusMode, setIsFocusMode] = useState(
    () => localStorage.getItem(FOCUS_MODE_STORAGE_KEY) === "true",
  );
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentPage / totalPages) * 100),
  );

  const setFocusMode = (enabled: boolean) => {
    setIsFocusMode(enabled);
    localStorage.setItem(FOCUS_MODE_STORAGE_KEY, String(enabled));
  };

  useEffect(() => {
    if (!isFocusMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  return (
    <div
      className={`flex flex-col h-full min-h-0 ${
        isFocusMode
          ? "fixed inset-0 z-50 w-full max-w-none bg-slate-50 p-1.5 sm:p-3 md:p-4"
          : "w-full max-w-[1440px] mx-auto"
      }`}
    >
      {/* Top Navbar */}
      {!isFocusMode && (
        <div className="flex-none flex justify-between items-center bg-white border border-slate-200 rounded-lg p-1 sm:p-2 mb-1 sm:mb-2 shadow-sm gap-1 sm:gap-2">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1 text-xs px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-md transition-all hover:scale-105 active:scale-95 font-medium cursor-pointer shrink-0"
            title="Kembali ke Daftar Level"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pilih Level</span>
          </button>

          <div className="text-center px-1 min-w-0">
            <h2 className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-900 uppercase tracking-wider truncate max-w-[60px] xs:max-w-[100px] sm:max-w-none">
              {levelTitle}
            </h2>
            <div className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 whitespace-nowrap">
              Hal {currentPage} / {totalPages}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* OCR Engine Selector */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 border border-slate-300 px-1 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs hover:border-slate-400 transition-colors">
              <span className="text-slate-500 font-semibold hidden lg:inline">
                OCR:
              </span>
              <select
                value={ocrEngine}
                onChange={(e) => onChangeOcrEngine(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none cursor-pointer text-[9px] sm:text-[11px]"
                title="Pilih Engine OCR"
              >
                {ocrEngines.length > 0 ? (
                  ocrEngines.map((engine) => (
                    <option key={engine.id} value={engine.id}>
                      {engine.name}
                    </option>
                  ))
                ) : (
                  <option value="easyocr">EasyOCR</option>
                )}
              </select>
            </div>

            {/* Latin Translation Toggle */}
            <button
              onClick={onToggleShowLatin}
              className={`p-1 sm:p-1.5 rounded-md border transition-all text-[10px] sm:text-xs flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
                showLatin
                  ? "bg-slate-900 border-slate-900 text-white font-bold shadow-xs"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
              title={
                showLatin ? "Sembunyikan teks Latin" : "Tampilkan teks Latin"
              }
            >
              <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline font-semibold">Latin</span>
            </button>

            {/* RTL / LTR Toggle */}
            <button
              onClick={onToggleRtlReading}
              className={`p-1 sm:p-1.5 rounded-md border transition-all text-[9px] sm:text-[11px] flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
                rtlReading
                  ? "bg-slate-900 border-slate-900 text-white font-bold shadow-xs"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
              title={
                rtlReading
                  ? "Membaca Kanan-ke-Kiri (RTL) aktif"
                  : "Membaca Kiri-ke-Kanan (LTR) aktif"
              }
            >
              <span className="font-semibold">
                {rtlReading ? "RTL" : "LTR"}
              </span>
            </button>

            {/* Bookmark Toggle */}
            <button
              onClick={onToggleBookmark}
              className={`p-1 sm:p-1.5 rounded-md border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isBookmarked
                  ? "bg-amber-500 border-amber-600 text-white shadow-xs animate-pop-in"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
              title={
                isBookmarked ? "Hapus Penanda Halaman" : "Tandai Halaman Ini"
              }
            >
              <Bookmark
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isBookmarked ? "fill-current animate-pulse" : ""}`}
              />
            </button>

            <button
              onClick={() => setFocusMode(true)}
              className="p-1 sm:p-1.5 rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Aktifkan mode fokus"
              aria-label="Aktifkan mode fokus"
            >
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar with Gradient */}
      {!isFocusMode && (
        <div className="flex-none w-full bg-slate-200 rounded-full h-1 mb-1 sm:mb-2 overflow-hidden border border-slate-300">
          <div
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 h-1 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      )}

      {/* Main Book Container */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 min-w-0 px-0 sm:px-4 md:px-8">
        {isFocusMode && (
          <>
            <div className="absolute top-1.5 left-1.5 z-40 rounded-md bg-white/95 border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-900 uppercase tracking-wider shadow-sm pointer-events-none sm:hidden">
              {levelTitle}
            </div>
            <div className="hidden sm:block absolute top-1.5 left-1/2 -translate-x-1/2 z-40 rounded-md bg-white/95 border border-slate-200 px-2.5 py-1 text-center shadow-sm pointer-events-none">
              <div className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider">
                {levelTitle}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-500">
                Hal {currentPage} / {totalPages}
              </div>
            </div>
            <div className="absolute top-1.5 right-1.5 z-40 flex items-center gap-1">
              <button
                onClick={onBackToMenu}
                className="p-2 rounded-md bg-white/95 border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                title="Kembali ke daftar level"
                aria-label="Kembali ke daftar level"
              >
                <Home className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFocusMode(false)}
                className="p-2 rounded-md bg-white/95 border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                title="Keluar dari mode fokus (Esc)"
                aria-label="Keluar dari mode fokus"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
        {/* Book shadow & Realistic hardback cover backdrop */}
        <div className="w-full h-full min-h-0 min-w-0 bg-slate-200/40 rounded-lg sm:rounded-xl p-1 sm:p-1.5 md:p-2 shadow-[0_15px_30px_rgba(0,0,0,0.08)] border border-slate-300 flex items-stretch overflow-hidden">
          {/* Inner realistic open book layout */}
          <div className="w-full h-full bg-white rounded-lg sm:rounded-xl overflow-hidden relative flex flex-col md:flex-row border border-slate-400/80">
            {/* The Book Pages Container */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden px-0.5 sm:px-0">
              {children}
            </div>

            {/* Central spine/binding divider for realistic book feel */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[20px] -ml-[10px] pointer-events-none book-spine-gradient hidden md:block z-20"></div>

            {/* Soft shadow overlay for pages */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(139,92,26,0.06)] z-10"></div>
          </div>
        </div>

        {/* Traditional Desktop Floating Navigation Control Arrows (hidden on mobile to avoid covering page text) */}
        {rtlReading ? (
          <>
            {/* RIGHT BUTTON: Previous Page */}
            <button
              onClick={onPrev}
              disabled={currentPage <= 1}
              className={`hidden md:flex items-center justify-center absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full shadow-lg border transition-all duration-200 z-30 cursor-pointer ${
                currentPage <= 1
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-950 text-white hover:scale-110 active:scale-90 hover:shadow-xl"
              }`}
              title="Halaman Sebelumnya (Kanan)"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* LEFT BUTTON: Next Page */}
            <button
              onClick={onNext}
              disabled={currentPage >= totalPages}
              className={`hidden md:flex items-center justify-center absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full shadow-lg border transition-all duration-200 z-30 cursor-pointer ${
                currentPage >= totalPages
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-950 text-white hover:scale-110 active:scale-90 hover:shadow-xl"
              }`}
              title="Halaman Berikutnya (Kiri)"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        ) : (
          <>
            {/* Standard Western Navigation Controls */}
            {/* LEFT BUTTON: Previous Page */}
            <button
              onClick={onPrev}
              disabled={currentPage <= 1}
              className={`hidden md:flex items-center justify-center absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full shadow-lg border transition-all duration-200 z-30 cursor-pointer ${
                currentPage <= 1
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-950 text-white hover:scale-110 active:scale-90 hover:shadow-xl"
              }`}
              title="Halaman Sebelumnya (Kiri)"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* RIGHT BUTTON: Next Page */}
            <button
              onClick={onNext}
              disabled={currentPage >= totalPages}
              className={`hidden md:flex items-center justify-center absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full shadow-lg border transition-all duration-200 z-30 cursor-pointer ${
                currentPage >= totalPages
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-950 text-white hover:scale-110 active:scale-90 hover:shadow-xl"
              }`}
              title="Halaman Berikutnya (Kanan)"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation Controls */}
      <div className="flex-none flex md:hidden items-center justify-between gap-2 mt-2.5 w-full">
        <button
          onClick={rtlReading ? onNext : onPrev}
          disabled={rtlReading ? currentPage >= totalPages : currentPage <= 1}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl text-xs font-bold border shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
            (rtlReading ? currentPage >= totalPages : currentPage <= 1)
              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-slate-900 hover:bg-slate-800 border-slate-950 text-white"
          }`}
          title={rtlReading ? "Halaman Berikutnya" : "Halaman Sebelumnya"}
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">
            {rtlReading ? "Berikutnya" : "Sebelumnya"}
          </span>
        </button>

        <div className="text-center px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs whitespace-nowrap shrink-0">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={rtlReading ? onPrev : onNext}
          disabled={rtlReading ? currentPage <= 1 : currentPage >= totalPages}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl text-xs font-bold border shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
            (rtlReading ? currentPage <= 1 : currentPage >= totalPages)
              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-slate-900 hover:bg-slate-800 border-slate-950 text-white"
          }`}
          title={rtlReading ? "Halaman Sebelumnya" : "Halaman Berikutnya"}
        >
          <span className="whitespace-nowrap">
            {rtlReading ? "Sebelumnya" : "Berikutnya"}
          </span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>

      {/* Info Legend / Tips */}
      {!isFocusMode && (
        <div className="flex-none mt-3 sm:mt-6 text-center text-[11px] sm:text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>Klik kata/karakter untuk dengar suara.</span>
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span>
            {rtlReading
              ? "Arah membaca: Kanan ke Kiri (RTL)"
              : "Arah membaca: Kiri ke Kanan (LTR)"}
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <a
            href={`https://github.com/dyazincahya/iqro-json/issues/new?title=Koreksi+Data+${encodeURIComponent(levelTitle)}+Hal+${currentPage}&body=Mohon+jelaskan+bagian+yang+belum+sesuai+buku+fisik+(Jilid:+${encodeURIComponent(levelTitle)},+Halaman:+${currentPage},+Posisi+Baris/Kolom):`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer"
            title="Laporkan jika menemukan data yang belum sesuai buku fisik"
          >
            Ada data belum sesuai buku fisik? Koreksi di sini
          </a>
        </div>
      )}
    </div>
  );
};
