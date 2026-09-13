import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/iqro-json/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-iqro-folder',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.startsWith('/iqro/') || req.url.endsWith('.json'))) {
            // Strip query parameters
            const urlPath = req.url.split('?')[0];
            const filePath = path.join(__dirname, '..', urlPath);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              res.setHeader('Content-Type', 'application/json');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
      }
    },
    {
      name: 'copy-404-html',
      closeBundle() {
        const distPath = path.resolve(__dirname, 'dist');
        const indexPath = path.join(distPath, 'index.html');
        const notFoundPath = path.join(distPath, '404.html');
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath);
          console.log('✓ Successfully created dist/404.html for GitHub Pages SPA routing');
        }
      }
    }
  ],
})
