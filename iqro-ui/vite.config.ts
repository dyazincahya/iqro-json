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
          if (req.url && req.url.startsWith('/iqro/')) {
            // Strip query parameters
            const urlPath = req.url.split('?')[0];
            const filePath = path.join(__dirname, '..', urlPath);
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/json');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
      }
    }
  ],
})
