import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// SVELTEKIT_ADAPTER=node      → Porter.run (adapter-node)
// SVELTEKIT_ADAPTER=cloudflare → Cloudflare Workers (default)
const adapter =
	process.env.SVELTEKIT_ADAPTER === 'node' ? adapterNode() : adapterCloudflare();

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			adapter
		})
	]
});
