import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import Unocss from 'unocss/vite'
import { presetUno } from 'unocss'
import Components from 'unplugin-vue-components/vite'
// import Icons from 'unplugin-icons/vite'
// import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Eslint from 'vite-plugin-eslint'
import VueJsx from '@vitejs/plugin-vue2-jsx'
// import {
//   ElementUiResolver,
// } from 'unplugin-vue-components/resolvers'

const config = defineConfig({
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },

  build: {
    minify: false,
    commonjsOptions: {
      defaultIsModuleExports: false,
      esmExternals: true,
    },
  },

  plugins: [
    vue(),
    VueJsx(),
    Unocss({
      preset: [presetUno()],
    }),
    Components({
      resolvers: [
        // TODO: 引入element
        // ElementUiResolver({
        //   importStyle: false,
        // }),
      ],
      deep: false,
      dts: 'src/components.d.ts',
    }),
    // Icons(),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    Eslint(),
  ],

  server: {
    port: 3333,
    proxy: {
      '/api': {
        target: 'http://192.168.9.67:9092',
        // target: 'http://192.168.9.65:8089',
        // target: 'http://xky.gaodanyi.com:8092/api',
        changeOrigin: true,
        rewrite: path => path.replace('/api', ''),
      },
    },
  },
})

export default config
