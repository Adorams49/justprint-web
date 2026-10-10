/* Compila los componentes de React (src/islands) en UN archivo JS y UN CSS dentro de
   assets/islands/. El HTML sigue siendo estático: React solo se monta en los espacios
   marcados con data-island="…". Comando: npm run build (o doble clic en build.bat). */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // GSAP ya se carga en la página (assets/vendor/gsap): se reutiliza en vez de incluirlo dos veces
    alias: { gsap: fileURLToPath(new URL('./src/islands/gsap-shim.js', import.meta.url)) }
  },
  build: {
    outDir: 'assets/islands',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: fileURLToPath(new URL('./src/islands/main.jsx', import.meta.url)),
      output: {
        format: 'es',
        entryFileNames: 'islands.js',
        chunkFileNames: 'islands-[name].js',
        assetFileNames: 'islands[extname]',
        inlineDynamicImports: true
      }
    }
  }
});
