import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'api-route-template': 'src/api-route-template.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  external: ['react', 'next'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
});
