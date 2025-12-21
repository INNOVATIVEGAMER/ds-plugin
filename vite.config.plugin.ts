import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/code.ts',
      formats: ['iife'],
      name: 'code',
      fileName: () => 'code.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        extend: true,
      }
    }
  }
})
