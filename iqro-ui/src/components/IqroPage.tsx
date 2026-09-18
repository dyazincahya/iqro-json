import React, { useEffect, useState } from "react";
import type { IqroPageData, IqroContentItem } from "../types";
import { Volume2 } from "lucide-react";

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
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => {
      const d = parseInt(digit);
      return isNaN(d) ? digit : arabicDigits[d];
    })
    .join("");
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
  forcedColCount,
}) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

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
  const colCount =
    forcedColCount ||
    Math.max(...pageData.content.map((item) => item.position.col), 1);

  // Granular dynamic sizing based on both vertical row count and horizontal column count
  let rowPaddingClass = "py-3 md:py-5";
  let arabicTextClass = "text-[30px] md:text-[38px] lg:text-[42px]";
  let latinTextClass = "text-[9.5px] md:text-xs";
  let instructionPadding = "pb-1.5 mb-1.5";

  if (rowCount >= 7 || colCount > 5) {
    rowPaddingClass = "py-1 md:py-2";
    arabicTextClass = "text-[20px] md:text-[24px] lg:text-[26px]";
    latinTextClass = "text-[8px] md:text-[9px]";
    instructionPadding = "pb-0.5 mb-0.5";
  } else if (rowCount === 6 || colCount === 5) {
    rowPaddingClass = "py-1.5 md:py-3";
    arabicTextClass = "text-[22px] md:text-[26px] lg:text-[30px]";
    latinTextClass = "text-[8px] md:text-[9.5px]";
    instructionPadding = "pb-0.5 mb-0.5";
  } else if (rowCount === 5 || colCount === 4) {
    rowPaddingClass = "py-2 md:py-4";
    arabicTextClass = "text-[26px] md:text-[30px] lg:text-[34px]";
    latinTextClass = "text-[8.5px] md:text-[10.5px]";
    instructionPadding = "pb-1 mb-1";
  }

  const speakLatin = (text: string, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPlayingId(id);
      const cleanText = text.replace(/=/g, " ").replace(/-/g, " ");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "id-ID";
      utterance.rate = 0.8;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // #region debug-point A-B-C-D:measure-scroll-container
  useEffect(() => {
    const report = () => {
      document
        .querySelectorAll<HTMLElement>("[data-iqro-scroll]")
        .forEach((element, index) => {
          const parents = Array.from({ length: 5 }, (_, depth) => {
            const parent =
              depth === 0
                ? element.parentElement
                : element.parentElement?.parentElement;
            return depth === 0 && parent
              ? {
                  depth,
                  clientHeight: parent.clientHeight,
                  scrollHeight: parent.scrollHeight,
                  overflowY: getComputedStyle(parent).overflowY,
                }
              : null;
          }).filter(Boolean);

          fetch("http://192.168.1.4:7777/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "iqro-inner-scroll",
              runId: "pre-fix",
              hypothesisId: "A-B-C-D",
              location: "IqroPage.tsx:scroll-container",
              msg: "[DEBUG] Iqro scroll measurements",
              data: {
                index,
                clientHeight: element.clientHeight,
                scrollHeight: element.scrollHeight,
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
                overflowX: getComputedStyle(element).overflowX,
                overflowY: getComputedStyle(element).overflowY,
                touchAction: getComputedStyle(element).touchAction,
                parents,
              },
              ts: Date.now(),
            }),
          }).catch(() => {});
        });
    };

    report();
    window.addEventListener("resize", report);
    return () => window.removeEventListener("resize", report);
  }, []);
  // #endregion

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white text-slate-900 p-1.5 sm:p-3 md:p-5 select-none relative box-border overflow-hidden">
      {/* Main Traditional Page Frame with Corner Ornaments */}
      <div className="flex-1 flex flex-col border-[3px] border-slate-950 p-2 sm:p-3 md:p-5 m-0.5 relative bg-white min-h-0 box-border overflow-hidden">
        {/* Four Corner Ornaments */}
        <CornerOrnament className="top-1 left-1" />
        <CornerOrnament className="top-1 right-1 rotate-90" />
        <CornerOrnament className="bottom-1 left-1 -rotate-90" />
        <CornerOrnament className="bottom-1 right-1 rotate-180" />

        {/* Page Number (top center) inside border */}
        <div className="text-center font-bold font-serif text-2xl md:text-3xl text-slate-950 pt-1 pb-1 relative z-10 shrink-0">
          {toArabicNumerals(pageNumber)}
        </div>

        {/* Page Instructions inside Border (only if present) */}
        {(pageData.instruction_id || pageData.instruction_ar) && (
          <div
            className={`border-b border-slate-900 ${instructionPadding} text-center text-xs px-4 md:px-8 z-10 flex flex-col items-center shrink-0 overflow-hidden`}
          >
            {pageData.instruction_ar && (
              <p
                className="font-serif text-xs md:text-sm text-slate-950 mb-0.5 font-bold leading-tight"
                dir="rtl"
              >
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
        <div
          data-iqro-scroll
          className="flex-1 min-h-0 min-w-0 overflow-auto pr-0.5 custom-scrollbar relative z-10 touch-auto overscroll-contain"
        >
          <div className="min-h-full flex flex-col justify-around py-1">
            {sortedRowKeys.map((rowKey, idx) => {
              const items = rowsMap[rowKey];
              const sortedItems = [...items].sort(
                (a, b) => a.position.col - b.position.col,
              );

              return (
                <div
                  key={rowKey}
                  dir={rtl ? "rtl" : "ltr"}
                  className={`flex w-full justify-around items-center ${rowPaddingClass} ${
                    idx < sortedRowKeys.length - 1
                      ? "border-b-2 border-slate-900/80"
                      : ""
                  }`}
                >
                  {sortedItems.map((item) => {
                    const isSelected = selectedItem === item.order_id;
                    const isPlaying = playingId === item.order_id;

                    return (
                      <div
                        key={item.order_id}
                        onClick={() =>
                          setSelectedItem(isSelected ? null : item.order_id)
                        }
                        className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 mx-0.5 sm:mx-1 rounded-xl transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/90 ring-2 ring-emerald-700 shadow-xs scale-[1.04] z-10 animate-pop-in"
                            : "hover:bg-slate-50 hover:scale-[1.02] active:scale-95"
                        }`}
                      >
                        {/* Arabic Text */}
                        <span
                          className={`font-serif ${arabicTextClass} leading-[1.4] select-none font-bold text-center transition-colors duration-200 pt-1.5 w-full ${
                            isSelected ? "text-emerald-950" : "text-slate-950"
                          }`}
                          dir="rtl"
                        >
                          {item.arabic}
                        </span>

                        {/* Latin Transliteration */}
                        {showLatin && (
                          <span
                            className={`tracking-wider mt-1 transition-all duration-200 font-semibold text-center w-full ${latinTextClass} ${
                              isSelected
                                ? "text-emerald-800 font-bold"
                                : "text-slate-400"
                            }`}
                          >
                            {item.latin}
                          </span>
                        )}

                        {/* Audio Icon with Dynamic Wave Feedback */}
                        {isSelected && showLatin && (
                          <button
                            onClick={(e) =>
                              speakLatin(item.latin, item.order_id, e)
                            }
                            className={`absolute right-0.5 bottom-0.5 p-1 rounded-md transition-all duration-200 shadow-xs flex items-center gap-1 cursor-pointer ${
                              isPlaying
                                ? "bg-emerald-700 text-white scale-110 ring-2 ring-emerald-400"
                                : "bg-slate-900 hover:bg-slate-800 text-white hover:scale-105 active:scale-90"
                            }`}
                            title="Dengar cara membaca"
                          >
                            <Volume2
                              className={`w-2.5 h-2.5 ${
                                isPlaying ? "animate-bounce" : ""
                              }`}
                            />
                            {isPlaying && (
                              <span className="flex items-center gap-0.5 px-0.5">
                                <span className="w-0.5 h-2 bg-white animate-pulse" />
                                <span className="w-0.5 h-3 bg-white animate-pulse delay-75" />
                                <span className="w-0.5 h-1.5 bg-white animate-pulse delay-150" />
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Level Title (bottom center) inside border */}
        <div className="text-center font-bold tracking-widest text-slate-950 uppercase text-[9px] md:text-[10px] pt-1 pb-1 z-10 border-t border-slate-900/20 shrink-0">
          {pageData.level_title}
        </div>
      </div>
    </div>
  );
};
