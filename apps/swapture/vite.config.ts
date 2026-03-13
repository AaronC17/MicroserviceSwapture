import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'password-checker': resolve(__dirname, 'password-checker/index.html'),
        'pace-calculator': resolve(__dirname, 'pace-calculator/index.html'),
        'percentage-calculator': resolve(__dirname, 'percentage-calculator/index.html'),
        'ip-analyzer': resolve(__dirname, 'ip-analyzer/index.html'),
        'salary-cr-calculator': resolve(__dirname, 'salary-cr-calculator/index.html'),
        'word-counter': resolve(__dirname, 'word-counter/index.html'),
        'bmi-calculator': resolve(__dirname, 'bmi-calculator/index.html'),
        'subnet-calculator': resolve(__dirname, 'subnet-calculator/index.html'),
        'startup-name-generator': resolve(__dirname, 'startup-name-generator/index.html'),
        'unit-converter': resolve(__dirname, 'unit-converter/index.html'),
        'qr-generator': resolve(__dirname, 'qr-generator/index.html'),
        'temp-mail': resolve(__dirname, 'temp-mail/index.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
});
