import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    alias: {
      'animal-island-vue': fileURLToPath(
        new URL('./src/test/animalIslandStub.ts', import.meta.url),
      ),
    },
  },
})
