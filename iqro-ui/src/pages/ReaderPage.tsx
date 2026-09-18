import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookLayout } from "../components/BookLayout";
import { IqroPage } from "../components/IqroPage";
import type { IqroManifest, IqroPageData } from "../types";
import { CheckCircle2 } from "lucide-react";

interface ReaderPageProps {
  manifest: IqroManifest;
  loadPageData: (
    levelId: number,
    pageId: number,
    ocrName: string,
  ) => Promise<IqroPageData>;
  ocrEngine: string;
  onOcrEngineChange: (engine: string) => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  manifest,
  loadPageData,
  ocrEngine,
  onOcrEngineChange,
}) => {
  const params = useParams<{ levelId?: string; slug?: string }>();
  const navigate = useNavigate();

  // Extract level number from route params (supports "iqro-1", "1", etc.)
  const rawParam = params.levelId || params.slug || "";
  const parsedLevelId = parseInt(rawParam.replace(/^iqro-/, ""), 10);
  const currentLevel = manifest.levels.find((l) => l.id === parsedLevelId);

  // App States
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [bookmarks, setBookmarks] = useState<Record<number, number>>({});
  const [rtlReading, setRtlReading] = useState<boolean>(true);
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 768);

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load preferences & bookmarks on mount or when level changes
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("iqro_bookmarks");
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setBookmarks(parsed);
        if (parsed[parsedLevelId]) {
          const bookmarkedPage = parsed[parsedLevelId];
          const startPage =
            isDesktop && bookmarkedPage % 2 === 0
              ? Math.max(1, bookmarkedPage - 1)
              : bookmarkedPage;
          setCurrentPageNumber(startPage);
        }
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }

    const savedRtl = localStorage.getItem("iqro_rtl");
    if (savedRtl !== null) {
      setRtlReading(savedRtl === "true");
    }

    const savedLatin = localStorage.getItem("iqro_latin");
    if (savedLatin !== null) {
      setShowLatin(savedLatin === "true");
    }
  }, [parsedLevelId, isDesktop]);

  // Fetch page data when level, page or OCR engine changes
  useEffect(() => {
    if (!currentLevel) return;

    const fetchPages = async () => {
      setLoadingPages(true);
      setPagesError(null);

      try {
        const rightData = await loadPageData(
          currentLevel.id,
          currentPageNumber,
          ocrEngine,
        );
        setRightPageData(rightData);

        const nextPageNumber = currentPageNumber + 1;
        if (isDesktop && nextPageNumber <= currentLevel.pagesCount) {
          try {
            const leftData = await loadPageData(
              currentLevel.id,
              nextPageNumber,
              ocrEngine,
            );
            setLeftPageData(leftData);
          } catch (e) {
            console.warn("Failed to load second page of spread:", e);
            setLeftPageData(null);
          }
        } else {
          setLeftPageData(null);
        }
      } catch (err: any) {
        console.error("Error fetching page data:", err);
        setPagesError(err.message || "Gagal memuat halaman Iqro.");
      } finally {
        setLoadingPages(false);
      }
    };

    fetchPages();
  }, [currentLevel, currentPageNumber, isDesktop, ocrEngine, loadPageData]);

  // Invalid level redirect or error
  if (!currentLevel || isNaN(parsedLevelId)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Jilid Iqro Tidak Ditemukan
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Pilihan jilid tidak valid atau belum tersedia.
        </p>
        <button
          onClick={() => navigate("/baca")}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Kembali ke Pilihan Jilid
        </button>
      </div>
    );
  }

  // Navigations
  const totalPages = currentLevel.pagesCount || 1;
  const step = isDesktop ? 2 : 1;

  const handleNext = () => {
    if (currentPageNumber + step <= totalPages) {
      setCurrentPageNumber((prev) => prev + step);
    }
  };

  const handlePrev = () => {
    if (currentPageNumber - step >= 1) {
      setCurrentPageNumber((prev) => prev - step);
    }
  };

  const handleToggleBookmark = () => {
    const newBookmarks = { ...bookmarks };
    if (newBookmarks[currentLevel.id] === currentPageNumber) {
      delete newBookmarks[currentLevel.id];
    } else {
      newBookmarks[currentLevel.id] = currentPageNumber;
    }
    setBookmarks(newBookmarks);
    localStorage.setItem("iqro_bookmarks", JSON.stringify(newBookmarks));
  };

  const handleToggleRtlReading = () => {
    const newRtl = !rtlReading;
    setRtlReading(newRtl);
    localStorage.setItem("iqro_rtl", String(newRtl));
  };

  const handleToggleShowLatin = () => {
    const nextVal = !showLatin;
    setShowLatin(nextVal);
    localStorage.setItem("iqro_latin", String(nextVal));
  };

  const isBookmarked = bookmarks[currentLevel.id] === currentPageNumber;

  // Helper count rows & cols
  const getRowCount = (pageData: IqroPageData | null) => {
    if (!pageData) return 0;
    return new Set(pageData.content.map((item) => item.position.row)).size;
  };

  const getColCount = (pageData: IqroPageData | null) => {
    if (!pageData) return 0;
    return Math.max(...pageData.content.map((item) => item.position.col), 1);
  };

  const rightRows = getRowCount(rightPageData);
  const leftRows = getRowCount(leftPageData);
  const maxRows =
    isDesktop && leftPageData ? Math.max(rightRows, leftRows) : rightRows;

  const rightCols = getColCount(rightPageData);
  const leftCols = getColCount(leftPageData);
  const maxCols =
    isDesktop && leftPageData ? Math.max(rightCols, leftCols) : rightCols;

  return (
    <div className="h-svh w-full overflow-hidden bg-slate-50 flex flex-col p-2.5 sm:p-4 md:p-6">
      <main className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <BookLayout
          levelTitle={currentLevel.title}
          currentPage={currentPageNumber}
          totalPages={totalPages}
          onNext={handleNext}
          onPrev={handlePrev}
          onBackToMenu={() => navigate("/baca")}
          isBookmarked={isBookmarked}
          onToggleBookmark={handleToggleBookmark}
          rtlReading={rtlReading}
          onToggleRtlReading={handleToggleRtlReading}
          showLatin={showLatin}
          onToggleShowLatin={handleToggleShowLatin}
          ocrEngine={ocrEngine}
          onChangeOcrEngine={onOcrEngineChange}
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
              <span className="text-slate-700 font-bold">
                Gagal memuat lembaran halaman ini.
              </span>
              <button
                onClick={() => setCurrentPageNumber((prev) => prev)}
                className="mt-4 text-xs font-semibold text-amber-800 underline hover:text-amber-950 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div
              key={currentPageNumber}
              className="flex-1 flex flex-col md:flex-row h-full min-h-0 animate-page-turn"
            >
              {isDesktop ? (
                rtlReading ? (
                  <>
                    <div className="flex-1 flex flex-col min-h-0 min-w-0 border-r border-amber-900/5">
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
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#FCFAF6] p-8 text-center min-h-0">
                          <CheckCircle2 className="w-16 h-16 text-emerald-600/80 mb-3 animate-bounce" />
                          <h4 className="font-serif text-2xl font-bold text-amber-950">
                            Selesai!
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">
                            Anda telah mencapai halaman terakhir di{" "}
                            {currentLevel.title}. Alhamdulillah!
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col min-h-0 min-w-0">
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
                  <>
                    <div className="flex-1 flex flex-col min-h-0 min-w-0 border-r border-amber-900/5">
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
                    <div className="flex-1 flex flex-col min-h-0 min-w-0">
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
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#FCFAF6] p-8 text-center min-h-0">
                          <CheckCircle2 className="w-16 h-16 text-emerald-600/80 mb-3 animate-bounce" />
                          <h4 className="font-serif text-2xl font-bold text-amber-950">
                            Selesai!
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">
                            Anda telah mencapai halaman terakhir di{" "}
                            {currentLevel.title}. Alhamdulillah!
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )
              ) : (
                <div className="flex-1 flex flex-col min-h-0 min-w-0">
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
};
