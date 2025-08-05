import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'sidepanel.html'),
        background: resolve(__dirname, 'scripts_chrome/background.ts'),
        content: resolve(__dirname, 'scripts_chrome/content.ts')
      },
      output: {
        // This will output content.js and main.js
        // You can use a more complex function if needed,
        // for example, to handle different entry points differently.
        entryFileNames: '[name].js',
      }
    }
  }
})
