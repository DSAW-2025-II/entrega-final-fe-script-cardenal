import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'frontend',
    server: {
        port: 5501,
        open: '/'
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'frontend/index.html')
            }
        },
        assetsInlineLimit: 0  // No inline assets, mantener archivos separados
    },
    base: '/'  // Base path para assets
});