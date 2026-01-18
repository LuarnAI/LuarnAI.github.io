import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', '**/*.mp3', '**/*.png'], // 確保音效與圖片被快取
      manifest: {
        name: '智慧教室儀表板',
        short_name: 'SchoolTool',
        description: '班級經營與監考輔助工具',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // 讓它看起來像原生 App (隱藏網址列)
        orientation: 'landscape', // 建議橫向使用
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // 讓圖示在 Android 上可以自動裁切成圓形或圓角矩形
          }
        ]
      }
    })
  ],
  base: '/schooltool/', // 根據您的 repository 名稱調整
})
