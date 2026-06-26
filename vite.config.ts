import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs/promises'

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        sidebar: resolve(__dirname, 'sidebar.html'),
        background: resolve(__dirname, 'src/background.ts'),
        'content-script': resolve(__dirname, 'src/content/content-script.ts')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  plugins: [
    {
      name: 'copy-manifest',
      writeBundle: async () => {
        await fs.copyFile(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist', 'manifest.json'))
      }
    }
  ]
})
