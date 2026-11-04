import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';
import process from 'node:process';

export default defineConfig({
	plugins: [
		sveltekit({
			// Set BASE_PATH (e.g. /qpps.github.io) when not served from the domain root.
			paths: { base: /** @type {'' | `/${string}`} */ (process.env.BASE_PATH ?? '') },
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: undefined
			})
		})
	]
});
