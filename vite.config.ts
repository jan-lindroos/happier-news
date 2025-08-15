import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
    viteStaticCopy({
      targets: [
        {
          src: resolve(__dirname, 'node_modules/onnxruntime-web/dist/*'),
          dest: 'ort'
        },
        {
          src: resolve(__dirname, 'src/manifest.json'),
          dest: ''
        },
        {
          src: resolve(__dirname, 'src/icons/*'),
          dest: 'icons'
        },
        {
          src: resolve(__dirname, 'ml/models/tokeniser/*'),
          dest: 'models/minilm-l12-news'
        },
        {
          src: resolve(__dirname, 'ml/models/ort/config.json'),
          dest: 'models/minilm-l12-news'
        },
        {
          src: resolve(__dirname, 'ml/models/ort/model.onnx'),
          dest: 'models/minilm-l12-news/onnx'
        }
      ]
    })
  ],
  root: resolve(__dirname, 'src'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        inference: resolve(__dirname, 'src/offscreen/offscreen.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
        'style/headline-blur': resolve(__dirname, 'src/content/style/headline-blur.css')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  publicDir: false,
  resolve: {
    alias: {
      $lib: resolve("src/popup/lib"),
    },
  },
});
