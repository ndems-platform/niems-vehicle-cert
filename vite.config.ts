import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/niems-vehicle-cert/',
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
    worker: {
        format: 'es',
    },
})
