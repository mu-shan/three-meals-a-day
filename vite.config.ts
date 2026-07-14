import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: repositoryName ? `/${repositoryName}/` : '/',
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'node',
    alias: {
      'animal-island-vue': fileURLToPath(
        new URL('./src/test/animalIslandStub.ts', import.meta.url),
      ),
    },
  },
})
