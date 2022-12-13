import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// https://nuxt.com/docs/api/configuration/nuxt-config 
export default defineNuxtConfig({
  components: false,
  css: [
    'vue-toastification/dist/index.css' 
  ],
  app: {
    head: {
      meta: [
        {
          "name": "viewport",
          "content": "width=device-width, initial-scale=1"
        },
        {
          "charset": "utf-8"
        }
      ],
      link: [
        { // Bootstrap icons
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css"
        },
        { // Bootstrap
          rel: "stylesheet",
          href: "/css/base.css"
        }
      ],
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js"
        }
      ]
    }
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  runtimeConfig: {
    public: {
      orbisContext: "kjzl6cwe1jw14bmb4kgw6gbu6umo8jz9vxjsunueihadbpr9977tj93s2diycb1", // production context
      orbisTest: false, // if true, test context will be used instead of the production one
      projectName: "Iggy Social",
      projectUrl: "https://iggy-social-frontend.vercel.app/",
      supportedChainId: 19,
      tldName: ".sgb",
    }
  },
  vite: {
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'  // fix nuxt3 global
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,  // fix nuxt3 process
            buffer: true
          }),
          NodeModulesPolyfillPlugin()
        ],
        target: "es2020" // fix big integer literals error
      }
    }
  }
})
