import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🚨 CONFIGURAÇÃO DE PROXY 🚨
  server: {
    proxy: {
      // Proxy todas as requisições que começam com '/api'
      '/api': {
        target: 'http://localhost:8000', // URL do seu servidor Django
        changeOrigin: true, // Necessário para virtual hosts
        // Opcional, para remover o /api do caminho se for necessário
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})