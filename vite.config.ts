import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import { setupVitePlugins } from './build/plugins';
import { createViteProxy, getBuildTime } from './build/config';
import { setupPrerender } from './build/plugins/prerender';

function copy404Plugin(): Plugin {
  return {
    name: 'copy-index-to-404',
    closeBundle() {
      const outDir = resolve(process.cwd(), 'dist');
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
    }
  };
}

export default defineConfig(configEnv => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as unknown as Env.ImportMeta;

  const buildTime = getBuildTime();

  const enableProxy = configEnv.command === 'serve' && !configEnv.isPreview;

  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/styles/scss/global.scss" as *;`
        }
      }
    },
    plugins: [
      setupVitePlugins(viteEnv, buildTime),
      setupPrerender({
        // URL格式: /portal/{routename}/{id}，routename 需与数据库中该博客的 routename 字段一致
        routes: ['/portal/blogdetail/3'],
        renderAfterTime: 5000
      }),
      copy404Plugin()
    ],
    define: {
      BUILD_TIME: JSON.stringify(buildTime)
    },
    server: {
      host: '0.0.0.0',
      port: 9527,
      open: true,
      proxy: createViteProxy(viteEnv, enableProxy)
    },
    preview: {
      port: 9725
    },
    build: {
      reportCompressedSize: false,
      sourcemap: viteEnv.VITE_SOURCE_MAP === 'Y',
      commonjsOptions: {
        ignoreTryCatch: false
      }
    }
  };
});
