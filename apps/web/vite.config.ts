import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
    dedupe: ['@json-render/react', '@json-render/core'],
  },
  ssr: {
    noExternal: [
      '@json-render/react',
      '@json-render/core',
      '@json-render/devtools',
      '@json-render/devtools-react',
      '@beforesign/json-render-view',
      '@beforesign/json-render-catalog',
      '@beforesign/orchestrator',
      '@beforesign/ai-pipeline',
      '@beforesign/agent',
      '@beforesign/clients',
    ],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
    nitro(),
  ],
})
