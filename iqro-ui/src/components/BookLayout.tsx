import React from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Home, HelpCircle, Languages } from 'lucide-react';
import type { OcrEngineInfo } from '../types';

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
  children
}) => {
  const progressPercent = Math.min(100, Math.max(0, (currentPage / totalPages) * 100));

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col h-full justify-between">
      {/* Top Navbar */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-3 mb-6 shadow-sm">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs md:text-sm px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg transition-colors font-medium cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Pilih Level</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm md:text-lg font-bold text-slate-900 uppercase tracking-wider">
            {levelTitle}
          </h2>
          <div className="text-[10px] md:text-xs text-slate-500">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* OCR Engine Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 px-2 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500 font-semibold hidden lg:inline">OCR:</span>
            <select
              value={ocrEngine}
              onChange={(e) => onChangeOcrEngine(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
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
            className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
              showLatin 
                ? 'bg-slate-900 border-slate-900 text-white font-bold' 
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
            title={showLatin ? 'Sembunyikan teks Latin' : 'Tampilkan teks Latin'}
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Latin</span>
          </button>

          {/* RTL / LTR Toggle */}
          <button
            onClick={onToggleRtlReading}
            className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
              rtlReading 
                ? 'bg-slate-900 border-slate-900 text-white font-bold' 
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
            title={rtlReading ? 'Membaca Kanan-ke-Kiri (RTL) aktif' : 'Membaca Kiri-ke-Kanan (LTR) aktif'}
          >
            <span className="font-semibold">{rtlReading ? 'RTL' : 'LTR'}</span>
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isBookmarked 
                ? 'bg-slate-900 border-slate-900 text-white' 
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
            title={isBookmarked ? 'Hapus Penanda Halaman' : 'Tandai Halaman Ini'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4 overflow-hidden border border-slate-300">
        <div 
          className="bg-slate-950 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main Book Container */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-6 md:px-10">
        
        {/* Book shadow & Realistic hardback cover backdrop */}
        <div className="w-full h-full max-h-[calc(100vh-140px)] bg-slate-200/40 rounded-2xl p-2 md:p-3 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-slate-300 flex items-stretch overflow-hidden">
          
          {/* Inner realistic open book layout */}
          <div className="w-full h-full bg-white rounded-xl overflow-hidden relative flex flex-col md:flex-row border border-slate-400/80">
            
            {/* The Book Pages Container */}
            <div className="flex-1 flex">
              {children}
            </div>

            {/* Central spine/binding divider for realistic book feel */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[20px] -ml-[10px] pointer-events-none book-spine-gradient hidden md:block z-20"></div>
            
            {/* Soft shadow overlay for pages */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(139,92,26,0.06)] z-10"></div>
          </div>
        </div>

        {/* Traditional RTL Navigation Control Arrows */}
        {/* Previous page on the RIGHT (Kanan) and Next page on the LEFT (Kiri) */}
        {rtlReading ? (
          <>
            {/* RIGHT BUTTON: Previous Page */}
            <button
              onClick={onPrev}
              disabled={currentPage <= 1}
              className={`absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full shadow-lg border transition-all z-30 cursor-pointer ${
                currentPage <= 1
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-950 text-white hover:scale-105'
              }`}
              title="Halaman Sebelumnya (Kanan)"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* LEFT BUTTON: Next Page */}
            <button
              onClick={onNext}
              disabled={currentPage >= totalPages}
              className={`absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full shadow-lg border transition-all z-30 cursor-pointer ${
                currentPage >= totalPages
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-950 text-white hover:scale-105'
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
              className={`absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full shadow-lg border transition-all z-30 cursor-pointer ${
                currentPage <= 1
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-950 text-white hover:scale-105'
              }`}
              title="Halaman Sebelumnya (Kiri)"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* RIGHT BUTTON: Next Page */}
            <button
              onClick={onNext}
              disabled={currentPage >= totalPages}
              className={`absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full shadow-lg border transition-all z-30 cursor-pointer ${
                currentPage >= totalPages
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-950 text-white hover:scale-105'
              }`}
              title="Halaman Berikutnya (Kanan)"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}
      </div>

      {/* Info Legend / Tips */}
      <div className="mt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Klik kata/karakter untuk memperbesar & mendengar suara.</span>
        </span>
        <span className="hidden sm:inline text-slate-600">|</span>
        <span>
          {rtlReading 
            ? 'Arah membaca: Kanan ke Kiri (klik tombol LTR untuk mengubah)' 
            : 'Arah membaca: Kiri ke Kanan (klik tombol RTL untuk mengubah)'}
        </span>
      </div>
    </div>
  );
};
