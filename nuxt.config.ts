import { defineNuxtConfig } from 'nuxt'
const webpack = require('webpack')

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  builder: 'webpack',
  css: [
    'vue-toastification/dist/index.css'
  ],
  hooks: {
    'webpack:config'(configs) {
      configs[0].resolve.fallback = {
        assert: require.resolve('assert/'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url/'),
      }
      configs[0].plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      )
      configs[0].plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      )
    },
  },
  meta: {
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
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  publicRuntimeConfig: {
    alchemyEthereumKey: process.env.NUXT_ALCHEMY_ETHEREUM_KEY,
    alchemyPolygonKey: process.env.NUXT_ALCHEMY_POLYGON_KEY,
    alchemyOptimismKey: process.env.NUXT_ALCHEMY_OPTIMISM_KEY,
    alchemyArbitrumKey: process.env.NUXT_ALCHEMY_ARBITRUM_KEY,
    alchemyMumbaiKey: process.env.NUXT_ALCHEMY_MUMBAI_KEY,
    orbisContext: "kjzl6cwe1jw14bmb4kgw6gbu6umo8jz9vxjsunueihadbpr9977tj93s2diycb1", // production context
    orbisTest: true, // if true, test context will be used instead of the production one
    projectName: "Iggy Social",
    projectUrl: "https://iggy-social-frontend.vercel.app/",
    supportedChainId: 19,
    tldName: ".sgb",
  },
  target: "static"
})
