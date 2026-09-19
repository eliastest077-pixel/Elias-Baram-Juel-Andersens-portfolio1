import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function serveLandingPages(): Plugin {
  return {
    name: 'serve-landing-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/landing-pages/')) {
          const filePath = path.join(__dirname, 'public', req.url.split('?')[0]);
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return fs.createReadStream(filePath).pipe(res);
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {base: '/Elias-Baram-Juel-Andersens-portfolio1/',
    plugins: [react(), tailwindcss(), serveLandingPages()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
