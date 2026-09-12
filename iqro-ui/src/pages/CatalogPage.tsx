import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCover } from '../components/BookCover';
import type { IqroManifest } from '../types';

interface CatalogPageProps {
  manifest: IqroManifest;
  ocrEngine: string;
  onOcrEngineChange: (engine: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  manifest,
  ocrEngine,
  onOcrEngineChange
}) => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Record<number, number>>({});

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('iqro_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
  }, []);

  const handleSelectLevel = (levelId: number) => {
    navigate(`/baca/iqro-${levelId}`);
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col justify-between p-4 md:p-6">
      <div className="w-full max-w-[1440px] mx-auto flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Resource OCR:</span>
          <select
            value={ocrEngine}
            onChange={(e) => onOcrEngineChange(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 p-1 rounded text-xs font-semibold focus:outline-none cursor-pointer"
          >
            {manifest.ocrEngines && manifest.ocrEngines.length > 0 ? (
              manifest.ocrEngines.map((engine) => (
                <option key={engine.id} value={engine.id}>
                  {engine.name}
                </option>
              ))
            ) : (
              <option value="easyocr">EasyOCR</option>
            )}
          </select>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-6">
        <BookCover
          levels={manifest.levels}
          onSelectLevel={handleSelectLevel}
          bookmarks={bookmarks}
        />
      </div>

      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        Iqro Digital JSON UI &copy; {new Date().getFullYear()} — Dibuat dengan React & Tailwind CSS
      </footer>
    </div>
  );
};
