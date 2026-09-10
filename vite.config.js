import { defineConfig } from 'vite';
export default defineConfig({
  server: { port: 4300, host: true, open: false },
  build: { assetsInlineLimit: 0 },
});
