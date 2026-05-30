import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index:    resolve(__dirname, 'src/index.html'),
        catalog:  resolve(__dirname, 'src/catalog.html'),
        form:     resolve(__dirname, 'src/document-your-data.html'),
        tools:    resolve(__dirname, 'src/tools.html'),
        actions:  resolve(__dirname, 'src/actions.html'),
        team:     resolve(__dirname, 'src/team.html'),
        changelog: resolve(__dirname, 'src/changelog.html'),
        charter:  resolve(__dirname, 'src/data-reuse-charter.html'),
        share:    resolve(__dirname, 'src/share.html'),
        zenodo:   resolve(__dirname, 'src/zenodo.html'),
      }
    }
  }
})
