import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    server: 'src/server-action.ts',
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
    // サーバーアクションファイルには use server を、その他には use client を設定
    if (options.entryPoints && Object.keys(options.entryPoints).some(key => key.includes('server'))) {
      options.banner = {
        js: '"use server"',
      };
    } else {
      options.banner = {
        js: '"use client"',
      };
    }
  },
  onSuccess: async () => {
    // サーバーアクション用のファイルには 'use server' を追加
    const fs = (await import('fs')).promises;
    const serverFiles = ['dist/server.js', 'dist/server.mjs'];

    for (const file of serverFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (!content.startsWith('"use server"')) {
          await fs.writeFile(
            file,
            '"use server";\n' + content.replace('"use client";\n', ''),
          );
        }
      } catch (error) {
        // ファイルが存在しない場合は無視
      }
    }
  },
});
