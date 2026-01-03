import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  // GitHub Pages 用：Actions から渡された BASE を優先
  // ローカル開発（npm run dev）は '/' でOK
  const base = process.env.BASE ?? '/'

  return {
    base,
  }
})

