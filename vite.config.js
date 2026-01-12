import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Piecework-dashboard/', // เพิ่มบรรทัดนี้ (ชื่อต้องตรงกับชื่อ Repository)
  server: {
    port: 5173,
    open: true
  }
})
