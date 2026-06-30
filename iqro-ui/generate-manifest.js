import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../iqro');
const targetFile = path.resolve(__dirname, './src/manifest.json');

function formatEngineName(id) {
  if (id.toLowerCase() === 'easyocr') return 'EasyOCR';
  return id
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateManifest() {
  console.log('Generating Iqro Manifest...');
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const manifest = {
    ocrEngines: [],
    levels: []
  };

  // Scan for OCR engine folders in iqro directory
  const items = fs.readdirSync(sourceDir);
  const ocrDirs = items.filter((item) => {
    const fullPath = path.join(sourceDir, item);
    return fs.lstatSync(fullPath).isDirectory() && !item.startsWith('.') && isNaN(Number(item));
  });

  manifest.ocrEngines = ocrDirs.map((dir) => ({
    id: dir,
    name: formatEngineName(dir)
  }));

  console.log(`Detected OCR Engines: ${manifest.ocrEngines.map(e => e.id).join(', ') || 'None'}`);

  // Use the first OCR engine folder to find levels, or fall back to sourceDir if none
  const levelSourceDir = ocrDirs.length > 0 ? path.join(sourceDir, ocrDirs[0]) : sourceDir;

  // Read all folders in levelSourceDir (levels)
  const levelItems = fs.readdirSync(levelSourceDir);
  const levels = levelItems
    .filter((item) => fs.lstatSync(path.join(levelSourceDir, item)).isDirectory())
    .map(Number)
    .filter((num) => !isNaN(num))
    .sort((a, b) => a - b);

  for (const levelId of levels) {
    const levelDir = path.join(levelSourceDir, levelId.toString());

    // Read all JSON files in the level directory
    const files = fs.readdirSync(levelDir);
    const pageFiles = files.filter((file) => file.endsWith('.json') && file.includes('-'));
    
    // Sort pages numerically based on the page number in the filename (e.g. 1-12.json -> 12)
    const pages = pageFiles
      .map((file) => {
        const parts = file.replace('.json', '').split('-');
        return parts.length > 1 ? Number(parts[1]) : null;
      })
      .filter((page) => page !== null && !isNaN(page))
      .sort((a, b) => a - b);

    // Extract level title from the first page JSON file
    let levelTitle = `Level ${levelId}`;
    if (pages.length > 0) {
      const firstPageFile = path.join(levelDir, `${levelId}-${pages[0]}.json`);
      try {
        const content = JSON.parse(fs.readFileSync(firstPageFile, 'utf8'));
        if (content.level_title) {
          levelTitle = content.level_title;
        }
      } catch (e) {
        console.warn(`Could not read title from ${firstPageFile}:`, e.message);
      }
    }

    manifest.levels.push({
      id: levelId,
      title: levelTitle,
      pagesCount: pages.length,
      pages: pages
    });
  }

  // Write manifest file to src folder
  fs.writeFileSync(targetFile, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Manifest successfully written to ${targetFile}`);
  console.log(`Total levels processed: ${manifest.levels.length}`);
}

generateManifest();
