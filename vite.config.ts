import path from 'node:path'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function commitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash()),
  },
  resolve: {
    alias: {
      // `import.meta.dirname`, not `__dirname`: Vite's native config loader is
      // becoming the default and doesn't provide the CommonJS globals.
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
