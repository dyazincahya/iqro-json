import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useIqroData } from './hooks/useIqroData';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ReaderPage } from './pages/ReaderPage';
import { DeveloperPage } from './pages/DeveloperPage';

export default function App() {
  const { manifest, loadingManifest, manifestError, loadPageData } = useIqroData();

  const [ocrEngine, setOcrEngine] = useState<string>(() => {
    const saved = localStorage.getItem('iqro_ocr_engine');
    if (saved) return saved;
    return manifest.ocrEngines && manifest.ocrEngines.length > 0
      ? manifest.ocrEngines[0].id
      : 'easyocr';
  });

  const handleOcrEngineChange = (engine: string) => {
    setOcrEngine(engine);
    localStorage.setItem('iqro_ocr_engine', engine);
  };

  // Render Loader
  if (loadingManifest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6">
        <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold tracking-wide">Memuat Data Iqro...</h2>
        <p className="text-slate-500 text-sm mt-1">Sabar ya, sistem sedang menyiapkan lembar materi.</p>
      </div>
    );
  }

  // Render Error
  if (manifestError || !manifest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 text-3xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-600">Gagal Menghubungkan Data</h2>
        <p className="text-slate-600 text-sm mt-2 mb-6">
          {manifestError || 'Manifest data Iqro tidak ditemukan. Pastikan folder iqro memiliki data JSON yang valid.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
        >
          Muat Ulang Halaman
        </button>
      </div>
    );
  }

  const BASE_URL = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={BASE_URL}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Routes>
          {/* Home Page with Navbar */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <HomePage levels={manifest.levels} />
              </>
            }
          />

          {/* Catalog Page (/baca) with Navbar */}
          <Route
            path="/baca"
            element={
              <>
                <Navbar />
                <CatalogPage
                  manifest={manifest}
                  ocrEngine={ocrEngine}
                  onOcrEngineChange={handleOcrEngineChange}
                />
              </>
            }
          />

          {/* Reader Page (/baca/iqro-:levelId) */}
          <Route
            path="/baca/iqro-:levelId"
            element={
              <ReaderPage
                manifest={manifest}
                loadPageData={loadPageData}
                ocrEngine={ocrEngine}
                onOcrEngineChange={handleOcrEngineChange}
              />
            }
          />

          {/* Fallback alias /baca/:slug */}
          <Route
            path="/baca/:slug"
            element={
              <ReaderPage
                manifest={manifest}
                loadPageData={loadPageData}
                ocrEngine={ocrEngine}
                onOcrEngineChange={handleOcrEngineChange}
              />
            }
          />

          {/* Developer Documentation Page (/developer) with Navbar */}
          <Route
            path="/developer"
            element={
              <>
                <Navbar />
                <DeveloperPage manifest={manifest} />
              </>
            }
          />

          {/* Redirect any unknown route to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
