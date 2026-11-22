import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 前端开发服务器：5173；/api 代理到后端 4400（见 server/index.ts）
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:4400' } },
  build: { outDir: 'dist' },
  test: { include: ['tests/**/*.test.ts'] },
} as any);
