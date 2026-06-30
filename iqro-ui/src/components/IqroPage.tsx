import React, { useState } from 'react';
import type { IqroPageData, IqroContentItem } from '../types';
import { Volume2 } from 'lucide-react';

interface IqroPageProps {
  pageData: IqroPageData;
  pageNumber: number;
  rtl?: boolean;
  showLatin: boolean;
  forcedRowCount?: number;
  forcedColCount?: number;
}

// Convert numbers to Arabic Numerals (e.g. 1 -> ١, 2 -> ٢)
const toArabicNumerals = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => {
    const d = parseInt(digit);
    return isNaN(d) ? digit : arabicDigits[d];
  }).join('');
};

// SVG Corner Ornament for the book look
const CornerOrnament: React.FC<{ className: string }> = ({ className }) => (
  <svg 
    className={`absolute w-6 h-6 md:w-8 md:h-8 text-slate-900 pointer-events-none ${className}`} 
    viewBox="0 0 32 32" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M2 30V2h28" />
    <path d="M6 26V6h20" />
    <path d="M10 22V10h12" />
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
  </svg>
);

export const IqroPage: React.FC<IqroPageProps> = ({ 
  pageData, 
  pageNumber, 
  rtl = true, 
  showLatin, 
  forcedRowCount,
  forcedColCount 
}) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Group content by row
  const rowsMap: Record<number, IqroContentItem[]> = {};
  pageData.content.forEach((item) => {
    if (!rowsMap[item.position.row]) {
      rowsMap[item.position.row] = [];
    }
    rowsMap[item.position.row].push(item);
  });

  const sortedRowKeys = Object.keys(rowsMap)
    .map(Number)
    .sort((a, b) => a - b);

  // Determine row and column counts (local vs forced)
  const rowCount = forcedRowCount || sortedRowKeys.length;
  const colCount = forcedColCount || Math.max(...pageData.content.map(item => item.position.col), 1);

  // Granular dynamic sizing based on both vertical row count and horizontal column count
  let rowPaddingClass = "py-2.5 md:py-3.5";
  let arabicTextClass = "text-[30px] md:text-[38px] lg:text-[42px]";
  let latinTextClass = "text-[9.5px] md:text-xs";
  let instructionPadding = "pb-1.5 mb-1.5";

  if (rowCount >= 7 || colCount > 5) {
    rowPaddingClass = "py-0.5 md:py-1";
    arabicTextClass = "text-[20px] md:text-[24px] lg:text-[26px]";
    latinTextClass = "text-[8px] md:text-[9px]";
    instructionPadding = "pb-0.5 mb-0.5";
  } else if (rowCount === 6 || colCount === 5) {
    rowPaddingClass = "py-1 md:py-1.5";
    arabicTextClass = "text-[22px] md:text-[26px] lg:text-[30px]";
    latinTextClass = "text-[8px] md:text-[9.5px]";
    instructionPadding = "pb-0.5 mb-0.5";
  } else if (rowCount === 5 || colCount === 4) {
    rowPaddingClass = "py-1.5 md:py-2.5";
    arabicTextClass = "text-[26px] md:text-[30px] lg:text-[34px]";
    latinTextClass = "text-[8.5px] md:text-[10.5px]";
    instructionPadding = "pb-1 mb-1";
  }

  const speakLatin = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/=/g, ' ').replace(/-/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-white text-slate-900 p-3 md:p-5 select-none relative overflow-hidden">
      
      {/* Main Traditional Page Frame with Corner Ornaments */}
      <div className="flex-1 flex flex-col justify-between border-[3px] border-slate-950 p-3 md:p-5 relative bg-white overflow-visible min-h-0">
        {/* Four Corner Ornaments */}
        <CornerOrnament className="top-1 left-1" />
        <CornerOrnament className="top-1 right-1 rotate-90" />
        <CornerOrnament className="bottom-1 left-1 -rotate-90" />
        <CornerOrnament className="bottom-1 right-1 rotate-180" />

        {/* Page Number (top center) inside border */}
        <div className="text-center font-bold font-serif text-2xl md:text-3xl text-slate-950 pt-1 pb-1 relative z-10">
          {toArabicNumerals(pageNumber)}
        </div>

        {/* Page Instructions inside Border (only if present) */}
        {(pageData.instruction_id || pageData.instruction_ar) && (
          <div className={`border-b border-slate-900 ${instructionPadding} text-center text-xs px-4 md:px-8 z-10 flex flex-col items-center min-h-0 overflow-hidden`}>
            {pageData.instruction_ar && (
              <p className="font-serif text-xs md:text-sm text-slate-950 mb-0.5 font-bold leading-tight" dir="rtl">
                {pageData.instruction_ar}
              </p>
            )}
            {pageData.instruction_id && (
              <p className="text-slate-700 font-bold uppercase tracking-tight text-[9px] md:text-[10px] leading-tight">
                {pageData.instruction_id}
              </p>
            )}
          </div>
        )}

        {/* Iqro Grid Rows separated by solid lines */}
        <div className="flex-1 flex flex-col justify-around py-1 min-h-0 overflow-visible">
          {sortedRowKeys.map((rowKey, idx) => {
            const items = rowsMap[rowKey];
            const sortedItems = [...items].sort((a, b) => a.position.col - b.position.col);

            return (
              <div
                key={rowKey}
                dir={rtl ? "rtl" : "ltr"}
                className={`flex w-full justify-around items-center ${rowPaddingClass} ${
                  idx < sortedRowKeys.length - 1 ? 'border-b-2 border-slate-900/80' : ''
                }`}
              >
                {sortedItems.map((item) => {
                  const isSelected = selectedItem === item.order_id;
                  return (
                    <div
                      key={item.order_id}
                      onClick={() => setSelectedItem(isSelected ? null : item.order_id)}
                      className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 mx-1 rounded-lg transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-100 ring-1.5 ring-slate-900 shadow-sm'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Arabic Text */}
                      <span 
                        className={`font-serif ${arabicTextClass} text-slate-950 leading-none select-none font-bold whitespace-nowrap`}
                        dir="rtl"
                      >
                        {item.arabic}
                      </span>

                      {/* Latin Transliteration */}
                      {showLatin && (
                        <span className={`tracking-wider mt-1 transition-colors font-semibold whitespace-nowrap ${latinTextClass} ${
                          isSelected ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                          {item.latin}
                        </span>
                      )}

                      {/* Audio Icon */}
                      {isSelected && showLatin && (
                        <button
                          onClick={(e) => speakLatin(item.latin, e)}
                          className="absolute right-0.5 bottom-0.5 p-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors shadow-sm"
                          title="Dengar cara membaca"
                        >
                          <Volume2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Level Title (bottom center) inside border */}
        <div className="text-center font-bold tracking-widest text-slate-950 uppercase text-[9px] md:text-[10px] pt-1 pb-1 z-10 border-t border-slate-900/20">
          {pageData.level_title}
        </div>
      </div>
    </div>
  );
};
