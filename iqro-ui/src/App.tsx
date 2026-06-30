import { useState, useEffect } from 'react';
import { useIqroData } from './hooks/useIqroData';
import { BookCover } from './components/BookCover';
import { BookLayout } from './components/BookLayout';
import { IqroPage } from './components/IqroPage';
import type { IqroPageData } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const { manifest, loadingManifest, manifestError, loadPageData } = useIqroData();

  // App States
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [bookmarks, setBookmarks] = useState<Record<number, number>>({});
  const [rtlReading, setRtlReading] = useState<boolean>(true);
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 768);
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

  // Loaded page data
  const [rightPageData, setRightPageData] = useState<IqroPageData | null>(null);
  const [leftPageData, setLeftPageData] = useState<IqroPageData | null>(null);
  const [loadingPages, setLoadingPages] = useState<boolean>(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  // Detect screen size for double page spread
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load bookmarks & preferences on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('iqro_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }

    const savedRtl = localStorage.getItem('iqro_rtl');
    if (savedRtl !== null) {
      setRtlReading(savedRtl === 'true');
    }

    const savedLatin = localStorage.getItem('iqro_latin');
    if (savedLatin !== null) {
      setShowLatin(savedLatin === 'true');
    }
  }, []);

  // Fetch page data when level, page or OCR engine changes
  useEffect(() => {
    if (selectedLevelId === null) {
      setRightPageData(null);
      setLeftPageData(null);
      return;
    }

    const fetchPages = async () => {
      setLoadingPages(true);
      setPagesError(null);

      try {
        // Always load current page (which represents the Right Page in RTL layout)
        const rightData = await loadPageData(selectedLevelId, currentPageNumber, ocrEngine);
        setRightPageData(rightData);

        // In desktop mode, we also try to load the next page (Left Page)
        const currentLevel = manifest?.levels.find(l => l.id === selectedLevelId);
        const nextPageNumber = currentPageNumber + 1;

        if (isDesktop && currentLevel && nextPageNumber <= currentLevel.pagesCount) {
          try {
            const leftData = await loadPageData(selectedLevelId, nextPageNumber, ocrEngine);
            setLeftPageData(leftData);
          } catch (e) {
            console.warn('Failed to load second page of spread:', e);
            setLeftPageData(null); // Treat as empty/blank page
          }
        } else {
          setLeftPageData(null);
        }
      } catch (err: any) {
        console.error('Error fetching page data:', err);
        setPagesError(err.message || 'Gagal memuat halaman Iqro.');
      } finally {
        setLoadingPages(false);
      }
    };

    fetchPages();
  }, [selectedLevelId, currentPageNumber, isDesktop, manifest, ocrEngine]);

  // Handle Level Selection
  const handleSelectLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
    // Resume from bookmark or start at page 1
    const bookmarkedPage = bookmarks[levelId] || 1;
    // Align to odd page for desktop spread if needed
    const startPage = isDesktop && bookmarkedPage % 2 === 0 ? Math.max(1, bookmarkedPage - 1) : bookmarkedPage;
    setCurrentPageNumber(startPage);
  };

  const handleBackToMenu = () => {
    setSelectedLevelId(null);
  };

  // Navigations
  const currentLevel = manifest?.levels.find(l => l.id === selectedLevelId);
  const totalPages = currentLevel?.pagesCount || 1;
  const step = isDesktop ? 2 : 1;

  const handleNext = () => {
    if (currentPageNumber + step <= totalPages) {
      setCurrentPageNumber(prev => prev + step);
    }
  };

  const handlePrev = () => {
    if (currentPageNumber - step >= 1) {
      setCurrentPageNumber(prev => prev - step);
    }
  };

  // Bookmark toggler
  const handleToggleBookmark = () => {
    if (selectedLevelId === null) return;

    const newBookmarks = { ...bookmarks };
    if (newBookmarks[selectedLevelId] === currentPageNumber) {
      // Remove bookmark
      delete newBookmarks[selectedLevelId];
    } else {
      // Add/Update bookmark
      newBookmarks[selectedLevelId] = currentPageNumber;
    }

    setBookmarks(newBookmarks);
    localStorage.setItem('iqro_bookmarks', JSON.stringify(newBookmarks));
  };

  // RTL Toggle
  const handleToggleRtlReading = () => {
    const newRtl = !rtlReading;
    setRtlReading(newRtl);
    localStorage.setItem('iqro_rtl', String(newRtl));
  };

  // Latin Toggle
  const handleToggleShowLatin = () => {
    const nextVal = !showLatin;
    setShowLatin(nextVal);
    localStorage.setItem('iqro_latin', String(nextVal));
  };

  // Render Loader
  if (loadingManifest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6">
        <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold tracking-wide">Memuat Data Iqro...</h2>
        <p className="text-slate-500 text-sm mt-1">Sabar ya, sistem sedang menyiapkan lembar materi.</p>
      </div>
    );
  }

  // Render Error
  if (manifestError || !manifest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 text-3xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-600">Gagal Menghubungkan Data</h2>
        <p className="text-slate-600 text-sm mt-2 mb-6">
          {manifestError || 'Manifest data Iqro tidak ditemukan. Pastikan folder iqro memiliki data JSON yang valid.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
        >
          Muat Ulang Halaman
        </button>
      </div>
    );
  }

  // Show cover level selector
  if (selectedLevelId === null || !currentLevel) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col justify-between p-4 md:p-6">
        <div className="w-full max-w-[1440px] mx-auto flex justify-end mb-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Resource OCR:</span>
            <select
              value={ocrEngine}
              onChange={(e) => handleOcrEngineChange(e.target.value)}
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
          Iqro Digital JSON UI &copy; {new Date().getFullYear()} - Dibuat dengan React & Tailwind CSS
        </footer>
      </div>
    );
  }

  // Render book page viewer
  const isBookmarked = bookmarks[selectedLevelId] === currentPageNumber;

  // Helper to count rows in a page
  const getRowCount = (pageData: IqroPageData | null) => {
    if (!pageData) return 0;
    return new Set(pageData.content.map(item => item.position.row)).size;
  };

  // Helper to count max columns in a page
  const getColCount = (pageData: IqroPageData | null) => {
    if (!pageData) return 0;
    return Math.max(...pageData.content.map(item => item.position.col), 1);
  };

  const rightRows = getRowCount(rightPageData);
  const leftRows = getRowCount(leftPageData);
  const maxRows = isDesktop && leftPageData ? Math.max(rightRows, leftRows) : rightRows;

  const rightCols = getColCount(rightPageData);
  const leftCols = getColCount(leftPageData);
  const maxCols = isDesktop && leftPageData ? Math.max(rightCols, leftCols) : rightCols;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col p-4 md:p-6">
      <main className="flex-1 flex items-center justify-center min-h-0">
        <BookLayout
          levelTitle={currentLevel.title}
          currentPage={currentPageNumber}
          totalPages={totalPages}
          onNext={handleNext}
          onPrev={handlePrev}
          onBackToMenu={handleBackToMenu}
          isBookmarked={isBookmarked}
          onToggleBookmark={handleToggleBookmark}
          rtlReading={rtlReading}
          onToggleRtlReading={handleToggleRtlReading}
          showLatin={showLatin}
          onToggleShowLatin={handleToggleShowLatin}
          ocrEngine={ocrEngine}
          onChangeOcrEngine={handleOcrEngineChange}
          ocrEngines={manifest.ocrEngines}
        >
          {loadingPages ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FCFAF6] text-slate-500">
              <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="text-sm font-medium">Membuka lembaran...</span>
            </div>
          ) : pagesError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FCFAF6] text-center">
              <span className="text-3xl mb-3">⚠️</span>
              <span className="text-slate-700 font-bold">Gagal memuat lembaran halaman ini.</span>
              <button 
                onClick={() => handleSelectLevel(selectedLevelId)}
                className="mt-4 text-xs font-semibold text-amber-800 underline hover:text-amber-950"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col md:flex-row h-full">
              {/* Desktop Double-Page spread */}
              {isDesktop ? (
                rtlReading ? (
                  // RTL Desktop Reading: Page p+1 is on Left, Page p is on Right
                  <>
                    {/* Left page (Page p + 1) */}
                    <div className="flex-1 border-r border-amber-900/5">
                      {leftPageData ? (
                        <IqroPage 
                          pageData={leftPageData} 
                          pageNumber={currentPageNumber + 1} 
                          rtl={rtlReading}
                          showLatin={showLatin}
                          forcedRowCount={maxRows}
                          forcedColCount={maxCols}
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#FCFAF6] p-8 text-center">
                          <CheckCircle2 className="w-16 h-16 text-emerald-600/80 mb-3 animate-bounce" />
                          <h4 className="font-serif text-2xl font-bold text-amber-950">Selesai!</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">
                            Anda telah mencapai halaman terakhir di {currentLevel.title}. Alhamdulillah!
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Right page (Page p) */}
                    <div className="flex-1">
                      {rightPageData && (
                        <IqroPage 
                          pageData={rightPageData} 
                          pageNumber={currentPageNumber} 
                          rtl={rtlReading}
                          showLatin={showLatin}
                          forcedRowCount={maxRows}
                          forcedColCount={maxCols}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  // LTR Desktop Reading: Page p is on Left, Page p+1 is on Right (Western layout)
                  <>
                    {/* Left page (Page p) */}
                    <div className="flex-1 border-r border-amber-900/5">
                      {rightPageData && (
                        <IqroPage 
                          pageData={rightPageData} 
                          pageNumber={currentPageNumber} 
                          rtl={rtlReading}
                          showLatin={showLatin}
                          forcedRowCount={maxRows}
                          forcedColCount={maxCols}
                        />
                      )}
                    </div>
                    {/* Right page (Page p + 1) */}
                    <div className="flex-1">
                      {leftPageData ? (
                        <IqroPage 
                          pageData={leftPageData} 
                          pageNumber={currentPageNumber + 1} 
                          rtl={rtlReading}
                          showLatin={showLatin}
                          forcedRowCount={maxRows}
                          forcedColCount={maxCols}
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#FCFAF6] p-8 text-center">
                          <CheckCircle2 className="w-16 h-16 text-emerald-600/80 mb-3 animate-bounce" />
                          <h4 className="font-serif text-2xl font-bold text-amber-950">Selesai!</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">
                            Anda telah mencapai halaman terakhir di {currentLevel.title}. Alhamdulillah!
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )
              ) : (
                // Mobile single page view
                <div className="flex-1">
                  {rightPageData && (
                    <IqroPage 
                      pageData={rightPageData} 
                      pageNumber={currentPageNumber} 
                      rtl={rtlReading}
                      showLatin={showLatin}
                      forcedRowCount={maxRows}
                      forcedColCount={maxCols}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </BookLayout>
      </main>
    </div>
  );
}
