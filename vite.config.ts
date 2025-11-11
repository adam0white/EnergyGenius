import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react()],
	root: './src/ui',
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		minify: 'esbuild', // Fast minification without additional dependencies
		sourcemap: true,
		target: 'esnext',
		rollupOptions: {
			output: {
				// Asset hashing for cache busting
				entryFileNames: 'assets/index-[hash].js',
				chunkFileNames: 'assets/chunk-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]',
				// Enable tree-shaking
				manualChunks: undefined,
			},
		},
		// Performance optimizations
		chunkSizeWarningLimit: 500,
		reportCompressedSize: true,
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src/ui'),
		},
	},
	server: {
		port: 5173,
	},
});
