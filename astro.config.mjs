// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless'; // Importante

export default defineConfig({
  // Habilita o modo Servidor (obrigatório para API POST)
  output: 'server', 
  
  adapter: vercel(),
});