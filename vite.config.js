import { defineConfig } from 'vite';

export default defineConfig({
  root: './',  // Specify the root directory
  server: {
    open: true,  // Automatically open the browser
    port: 3000   // You can set your preferred port
  }
});
