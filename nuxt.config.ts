import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// https://nuxt.com/docs/api/configuration/nuxt-config 
export default defineNuxtConfig({
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
        { // Bootstrap
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
        },
        { // Bootstrap icons
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css"
        },
        { // Custom
          rel: "stylesheet",
          href: "/css/custom.css"
        }
      ],
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"
        }
      ]
    }
  },
  components: false,
  css: [
    'vue-toastification/dist/index.css' 
  ],
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  router: {
    options: {
      hashMode: false
    }
  },
  runtimeConfig: {
    public: {
      airdropClaimDomainsAddress: "0x3ebDBc1D47d4bFe7D08A58123Ab3c85fC7358831", // chat token claim for domain holders contract address
      airdropPostMintersAddress: "0x11608f93Ec226E173754262c04F98Df3Bfaad7Db", // chat token claim for post minters contract address
      blockExplorerBaseUrl: "https://mumbai.polygonscan.com",
      chatTokenAddress: "0x83C0E6655Ea65363F8B85954afa29F05e257231b", // chat token address
      chatTokenSymbol: "CHAT", // chat token symbol or name
      favicon: "/img/favicon.png",
      iggyPostAddress: "0x9f48c192561f3A6f0efeeE5Fce00Fd9788675eF8",
      iggyPostMinterAddress: "0xe80A5619DCf6a3C2AC129841a1eDeb9e8d402942",
      orbisContext: "kjzl6cwe1jw14bmb4kgw6gbu6umo8jz9vxjsunueihadbpr9977tj93s2diycb1", // production context
      orbisTest: true, // if true, test context will be used instead of the production one
      orbisTestContext: "kjzl6cwe1jw145tfqv2eqv8tiz6puo27meyz4smz40atppuc13tulqca87k35z2", // test context
      previewImage: "/img/preview.png",
      previewImageStake: "",
      projectMetadataTitle: "Iggy Social Demo",
      projectName: "Iggy Social Demo",
      projectDescription: "Chat for .testnet domain holdes.",
      projectUrl: "https://iggy-social-frontend.vercel.app/",
      punkMinterAddress: "", // punk domain minter contract address
      punkNumberOfPrices: 1, // number of different prices (based on domain length), usually 1 (price()) or 5 (price1char() - price5char())
      punkTldAddress: "0x2582EC420195Fefb091B098da6FAdEE49f490740", // punk domain TLD address
      lpTokenAddress: "0xF874f79eBfB8FEe898a289C4cAa5dc4383873431", // a token to stake address
      lpTokenSymbol: "LP tokens", // a token to stake symbol or name
      stakingContractAddress: "0x96Dc7548fD018d1E51d2d5e98B265411C3D0F22A",
      supportedChainId: 80001,
      swapRouterAddress: "0x618c0622ab0821704F165427f324C28FA831dC39", // iggy swap router contract address
      tldName: ".testnet",
      tokenAddress: null, // leave null if it's a native token of the chain
      tokenDecimals: 18,
      tokenSymbol: "MATIC",
    }
  },
  vite: {
    build: {
      target: ['es2020'] // fix big integer literals error
    },
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
