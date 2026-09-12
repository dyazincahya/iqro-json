import React from 'react';
import { BookOpen, Bookmark } from 'lucide-react';
import type { LevelInfo } from '../types';

interface BookCoverProps {
  levels: LevelInfo[];
  onSelectLevel: (levelId: number) => void;
  bookmarks: Record<number, number>; // levelId -> pageNumber
}

// Map traditional Iqro cover colors
const COVER_STYLES: Record<number, { bg: string; text: string; border: string; accent: string; label: string }> = {
  1: { bg: 'from-blue-700 to-blue-900', text: 'text-blue-100', border: 'border-blue-400', accent: 'bg-blue-500/20', label: 'Jilid 1' },
  2: { bg: 'from-emerald-700 to-emerald-900', text: 'text-emerald-100', border: 'border-emerald-400', accent: 'bg-emerald-500/20', label: 'Jilid 2' },
  3: { bg: 'from-red-700 to-red-900', text: 'text-red-100', border: 'border-red-400', accent: 'bg-red-500/20', label: 'Jilid 3' },
  4: { bg: 'from-purple-700 to-purple-900', text: 'text-purple-100', border: 'border-purple-400', accent: 'bg-purple-500/20', label: 'Jilid 4' },
  5: { bg: 'from-amber-600 to-amber-800', text: 'text-amber-100', border: 'border-amber-400', accent: 'bg-amber-500/20', label: 'Jilid 5' },
  6: { bg: 'from-teal-700 to-teal-900', text: 'text-teal-100', border: 'border-teal-400', accent: 'bg-teal-500/20', label: 'Jilid 6' },
};

const DEFAULT_STYLE = { bg: 'from-slate-700 to-slate-900', text: 'text-slate-100', border: 'border-slate-400', accent: 'bg-slate-500/20', label: 'Jilid' };

export const BookCover: React.FC<BookCoverProps> = ({ levels, onSelectLevel, bookmarks }) => {
  const BASE_URL = import.meta.env.BASE_URL;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <img 
          src={`${BASE_URL}icon.png`} 
          alt="Logo Iqro Digital" 
          className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-5 object-contain rounded-2xl shadow-md border border-slate-200 bg-white p-1"
        />
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-wide mb-3">
          IQRO' DIGITAL
        </h1>
        <p className="text-slate-600 text-lg md:text-xl font-light">
          Metode Cepat Belajar Membaca Al-Qur'an secara Mandiri & Interaktif
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {levels.map((level) => {
          const style = COVER_STYLES[level.id] || DEFAULT_STYLE;
          const lastReadPage = bookmarks[level.id];

          return (
            <div
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
              className={`relative cursor-pointer group rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2.5 hover:rotate-[-0.5deg] hover:shadow-[0_25px_50px_rgba(0,0,0,0.45)] active:scale-[0.99] border ${style.border}/40 bg-gradient-to-br ${style.bg}`}
            >
              {/* Dynamic light reflection sheen on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out pointer-events-none z-20" />

              {/* Spine edge effect */}
              <div className="absolute left-0 top-0 bottom-0 w-5 bg-black/35 border-r border-white/10 z-10 shadow-[2px_0_6px_rgba(0,0,0,0.4)]"></div>
              <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-white/20 z-10"></div>

              {/* Cover Contents */}
              <div className="p-8 pl-12 flex flex-col justify-between h-[360px] relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-transform group-hover:scale-105 ${style.accent} ${style.text}`}>
                    {style.label}
                  </span>
                  {lastReadPage && (
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs bg-amber-900/50 px-2.5 py-1 rounded-full border border-amber-400/30 shadow-xs animate-pulse">
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold">Hal {lastReadPage}</span>
                    </div>
                  )}
                </div>

                {/* Main Titles */}
                <div className="my-auto text-center pr-4">
                  <div className="font-serif text-5xl md:text-6xl font-bold text-amber-300 mb-2 drop-shadow-md select-none group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300 transform inline-block">
                    اقرأ
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-widest text-white uppercase drop-shadow-sm">
                    {level.title}
                  </h2>
                  <div className="h-[2px] w-20 bg-amber-400 mx-auto my-3 group-hover:w-28 transition-all duration-300"></div>
                  <p className="text-slate-200 text-xs uppercase tracking-wider font-semibold">
                    KH. As'ad Humam
                  </p>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between text-slate-300 text-sm mt-4 border-t border-white/10 pt-4">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
                    <span>{level.pagesCount} Halaman</span>
                  </span>
                  <span className="text-xs group-hover:text-amber-300 transition-colors flex items-center gap-1 font-medium">
                    <span>Buka Buku</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </span>
                </div>
              </div>

              {/* Realistic gold border decoration inside cover */}
              <div className="absolute inset-2 border border-dashed border-white/15 pointer-events-none rounded-xl"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
