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
    target: 'es2017',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        extend: true,
      }
    }
  }
})
