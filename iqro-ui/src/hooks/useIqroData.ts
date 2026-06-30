import manifestData from '../manifest.json';
import type { IqroManifest, IqroPageData } from '../types';

export function useIqroData() {
  // Statically imported manifest means 0 network overhead for menus/metadata
  const manifest: IqroManifest = manifestData;
  const loadingManifest = false;
  const manifestError = null;

  // CDN/Local configurations
  const getCdnUrls = (levelId: number, pageId: number, ocrName: string): string[] => {
    const urls: string[] = [];
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
      urls.push(`/iqro/${ocrName}/${levelId}/${levelId}-${pageId}.json`);
    }
    
    urls.push(
      `https://cdn.jsdelivr.net/gh/dyazincahya/iqro-json/iqro/${ocrName}/${levelId}/${levelId}-${pageId}.json`,
      `https://cdn.statically.io/gh/dyazincahya/iqro-json/main/iqro/${ocrName}/${levelId}/${levelId}-${pageId}.json`,
      `https://raw.githubusercontent.com/dyazincahya/iqro-json/refs/heads/main/iqro/${ocrName}/${levelId}/${levelId}-${pageId}.json`
    );
    
    return urls;
  };

  // Try fetching page data sequentially from CDN 1, 2, and 3
  const loadPageData = async (levelId: number, pageId: number, ocrName: string): Promise<IqroPageData> => {
    const urls = getCdnUrls(levelId, pageId, ocrName);
    let lastError: Error | null = null;

    for (let i = 0; i < urls.length; i++) {
      try {
        console.log(`[CDN] Trying CDN ${i + 1} for Level ${levelId} Page ${pageId} (${ocrName})...`);
        const response = await fetch(urls[i]);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        throw new Error(`HTTP Status ${response.status}`);
      } catch (err: any) {
        console.warn(`[CDN] CDN ${i + 1} failed:`, err.message || err);
        lastError = err;
      }
    }

    throw new Error(
      `Gagal memuat data Iqro (${ocrName}) dari semua CDN. Error: ${lastError?.message || 'Koneksi terputus atau file tidak ditemukan'}`
    );
  };

  return {
    manifest,
    loadingManifest,
    manifestError,
    loadPageData
  };
}
