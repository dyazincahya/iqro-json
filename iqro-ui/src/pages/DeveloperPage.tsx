import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, Code2, Play, BookOpen, Layers, Globe, Sparkles, FileCode2 } from 'lucide-react';
import { WarningDisclaimer } from '../components/WarningDisclaimer';
import type { IqroManifest } from '../types';

interface DeveloperPageProps {
  manifest: IqroManifest;
}

const GITHUB_BASE_BLOB = 'https://github.com/dyazincahya/iqro-json/blob/main';

export const DeveloperPage: React.FC<DeveloperPageProps> = ({ manifest }) => {
  // Category state: 'iqro' or 'hijaiyah'
  const [activeCategory, setActiveCategory] = useState<'iqro' | 'hijaiyah'>('iqro');

  // Iqro Category state
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [selectedOcrEngine, setSelectedOcrEngine] = useState<string>(
    manifest.ocrEngines && manifest.ocrEngines.length > 0 ? manifest.ocrEngines[0].id : 'easyocr'
  );
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(1);

  // Hijaiyah Category state
  const [selectedHijaiyahFile, setSelectedHijaiyahFile] = useState<string>('hijaiyah-letters.json');

  // Copy state & Preview state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewJson, setPreviewJson] = useState<string>('Memuat data JSON...');
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

  // Current Level info
  const currentLevel = manifest.levels.find((l) => l.id === selectedLevelId) || manifest.levels[0];
  const pagesList = currentLevel ? currentLevel.pages : Array.from({ length: 30 }, (_, i) => i + 1);

  // Determine current relative path & titles
  const relativePath =
    activeCategory === 'iqro'
      ? `iqro/${selectedOcrEngine}/${selectedLevelId}/${selectedLevelId}-${selectedPageNumber}.json`
      : selectedHijaiyahFile;

  const endpointTitle =
    activeCategory === 'iqro'
      ? `${currentLevel?.title || `Iqro ${selectedLevelId}`} - Halaman ${selectedPageNumber}`
      : selectedHijaiyahFile === 'hijaiyah-letters.json'
      ? 'Huruf Hijaiyah Dasar (29 Huruf)'
      : 'Huruf Hijaiyah Berharakat (Vokal Fathah, Kasrah, Dhammah)';

  const endpointDesc =
    activeCategory === 'iqro'
      ? `Data baris teks Arab, transliterasi Latin, dan posisi karakter hasil ekstraksi ${selectedOcrEngine.toUpperCase()} untuk ${currentLevel?.title || `Iqro ${selectedLevelId}`} Halaman ${selectedPageNumber}.`
      : selectedHijaiyahFile === 'hijaiyah-letters.json'
      ? 'Kamus lengkap 29 huruf hijaiyah dari Alif hingga Ya beserta simbol Arab dan lafal Latin.'
      : 'Kamus huruf hijaiyah dengan harakat dasar (Fathah / a, Kasrah / i, Dhammah / u).';

  // URLs
  const githubFileUrl = `${GITHUB_BASE_BLOB}/${relativePath}`;
  const gitcdnGeneratorUrl = `https://gitcdn-generator.vercel.app?q=${encodeURIComponent(githubFileUrl)}`;

  // Fetch JSON Preview
  useEffect(() => {
    let isMounted = true;
    setLoadingPreview(true);
    setPreviewJson('Mengambil data JSON...');

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const localUrl = `/${relativePath}`;
    const remoteUrl = `https://raw.githubusercontent.com/dyazincahya/iqro-json/refs/heads/main/${relativePath}`;

    fetch(isLocal ? localUrl : remoteUrl)
      .then(async (res) => {
        if (!res.ok) {
          const fallbackRes = await fetch(remoteUrl);
          if (!fallbackRes.ok) throw new Error(`HTTP Status ${res.status}`);
          return fallbackRes.json();
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setPreviewJson(JSON.stringify(data, null, 2));
          setLoadingPreview(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setPreviewJson(
            `// Gagal memuat pratinjau langsung:\n// ${err.message}\n// Anda dapat membuka link GitCDN Generator atau GitHub di atas untuk melihat isi berkas.`
          );
          setLoadingPreview(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [relativePath]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3 sm:mb-4">
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Developer Portal & API Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
            Dokumentasi & Katalog API Iqro
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Pilih jilid dan halaman buku Iqro atau kamus huruf hijaiyah untuk melihat berkas sumber dan tautan CDN gratis siap pakai melalui <strong>GitCDN Generator</strong>.
          </p>
        </div>

        {/* Warning Peringatan Non-Komersial */}
        <div className="mb-8 sm:mb-10">
          <WarningDisclaimer />
        </div>

        {/* Main Grid: Hierarchical Selector & Endpoint Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left / Top: Hierarchical Selector (5 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Kategori Data API</span>
                </h2>
                <span className="text-xs font-medium text-slate-500">Pilih Hirarki Data</span>
              </div>

              {/* Main Category Tabs: Iqro vs Hijaiyah */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  onClick={() => setActiveCategory('iqro')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                    activeCategory === 'iqro'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Buku Iqro (1–6)</span>
                </button>

                <button
                  onClick={() => setActiveCategory('hijaiyah')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                    activeCategory === 'hijaiyah'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode2 className="w-4 h-4 text-blue-600" />
                  <span>Huruf Hijaiyah</span>
                </button>
              </div>

              {/* Hierarchy View for BUKU IQRO */}
              {activeCategory === 'iqro' && (
                <div className="space-y-6">
                  {/* Step 1: Pilih Jilid */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      1. Pilih Jilid Iqro:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {manifest.levels.map((level) => {
                        const isSelected = level.id === selectedLevelId;
                        return (
                          <button
                            key={level.id}
                            onClick={() => {
                              setSelectedLevelId(level.id);
                              // Clamp page number if current page exceeds new level count
                              if (selectedPageNumber > level.pagesCount) {
                                setSelectedPageNumber(1);
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-emerald-700 border-emerald-700 text-white shadow-md font-extrabold scale-105 animate-pop-in'
                                : 'bg-slate-50 hover:bg-slate-100 hover:scale-105 active:scale-95 border-slate-200 text-slate-700 font-semibold'
                            }`}
                          >
                            <span className="text-xs uppercase">Jilid</span>
                            <span className="text-lg leading-none font-black">{level.id}</span>
                            <span className={`text-[9px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {level.pagesCount} hal
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Pilih OCR Engine */}
                  {manifest.ocrEngines && manifest.ocrEngines.length > 1 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        2. Pilih Mesin OCR:
                      </label>
                      <div className="flex gap-2">
                        {manifest.ocrEngines.map((engine) => (
                          <button
                            key={engine.id}
                            onClick={() => setSelectedOcrEngine(engine.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                              selectedOcrEngine === engine.id
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {engine.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Pilih Halaman */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {manifest.ocrEngines && manifest.ocrEngines.length > 1 ? '3.' : '2.'} Pilih Halaman:
                      </label>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Hal {selectedPageNumber} terpilih
                      </span>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                      {pagesList.map((pageNum) => {
                        const isSelected = pageNum === selectedPageNumber;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setSelectedPageNumber(pageNum)}
                            className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xs scale-105 z-10 animate-pop-in'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:scale-105 active:scale-90'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Hierarchy View for HURUF HIJAIYAH */}
              {activeCategory === 'hijaiyah' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedHijaiyahFile('hijaiyah-letters.json')}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      selectedHijaiyahFile === 'hijaiyah-letters.json'
                        ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 font-serif text-lg font-bold">
                      ا
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900">Huruf Hijaiyah Dasar</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          29 Huruf
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Daftar 29 huruf hijaiyah dari Alif hingga Ya lengkap dengan teks Arab dan lafal Latin.
                      </p>
                      <code className="mt-2 block text-[11px] font-mono text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded w-fit border border-emerald-200/50">
                        /hijaiyah-letters.json
                      </code>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedHijaiyahFile('hijaiyah-letters-with-vowels.json')}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      selectedHijaiyahFile === 'hijaiyah-letters-with-vowels.json'
                        ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-800 shrink-0 font-serif text-lg font-bold">
                      أَ
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900">Huruf Hijaiyah Berharakat (Vokal)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          a, i, u
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Daftar huruf hijaiyah dengan harakat dasar Fathah (a), Kasrah (i), dan Dhammah (u).
                      </p>
                      <code className="mt-2 block text-[11px] font-mono text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded w-fit border border-emerald-200/50">
                        /hijaiyah-letters-with-vowels.json
                      </code>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Pattern Hint Info */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 text-xs text-emerald-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Pola URL Universal Iqro:</span>
              </div>
              <code className="block bg-white p-2.5 rounded-lg border border-emerald-200 text-xs font-mono text-emerald-900 break-all shadow-2xs">
                iqro/{'{ocr_name}'}/{'{level}'}/{'{level}'}-{'{page}'}.json
              </code>
              <p className="text-slate-600 text-[11px]">
                Seluruh data halaman dapat langsung dipanggil dengan format di atas, misalnya <code>iqro/easyocr/2/2-1.json</code>.
              </p>
            </div>
          </div>

          {/* Right / Bottom: Endpoint Detail, GitCDN Generator & Live Preview (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col gap-4 sm:gap-5">
              {/* Selected Endpoint Header */}
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Endpoint Aktif
                  </span>
                  <span className="text-xs font-mono text-slate-400">application/json</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">{endpointTitle}</h3>
                <p className="text-xs text-slate-600 mt-1">{endpointDesc}</p>
                <div className="mt-2 text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 w-fit break-all">
                  {relativePath}
                </div>
              </div>

              {/* 1. Tautan Sumber di GitHub */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>1. Berkas Sumber di GitHub:</span>
                  <a
                    href={githubFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                  >
                    <span>Lihat di GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={githubFileUrl}
                    className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 truncate select-all focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(githubFileUrl, 'github')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-90 shrink-0"
                    title="Salin Tautan GitHub"
                  >
                    {copiedKey === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-75" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 2. Layanan GitCDN Generator */}
              <div className="space-y-2 p-3.5 sm:p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-1 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>2. Layanan CDN Gratis (GitCDN Generator):</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Layanan <strong>GitCDN Generator</strong> secara otomatis menyediakan beragam tautan CDN gratis siap pakai (seperti jsDelivr, Statically, Githack, dll.) dari repositori GitHub ini.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={gitcdnGeneratorUrl}
                    className="min-w-0 flex-1 bg-white border border-emerald-300/80 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 truncate select-all focus:outline-none shadow-2xs"
                  />
                  <button
                    onClick={() => handleCopy(gitcdnGeneratorUrl, 'gitcdn')}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-700 rounded-lg border border-emerald-300 text-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-90 shadow-2xs shrink-0"
                    title="Salin Tautan GitCDN"
                  >
                    {copiedKey === 'gitcdn' ? <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-75" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Main Prominent Button */}
                <a
                  href={gitcdnGeneratorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
                >
                  <span>Buka di GitCDN Generator</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* 3. Live Preview JSON */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Play className="w-3 h-3 text-emerald-600 fill-current" />
                    <span>Live Preview Respons JSON</span>
                  </span>
                  <button
                    onClick={() => handleCopy(previewJson, 'json-preview')}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'json-preview' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-xl bg-slate-900 border border-slate-800 text-slate-100 p-4 font-mono text-xs max-h-80 overflow-y-auto shadow-inner">
                  {loadingPreview && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-xs text-emerald-400 font-semibold gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat Respons JSON...</span>
                    </div>
                  )}
                  <pre className="whitespace-pre overflow-x-auto leading-relaxed text-[11px]">
                    {previewJson}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
