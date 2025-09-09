import { defineNuxtConfig } from 'nuxt/config'
import { readFileSync } from 'fs'
import { join } from 'path'

const manifestFile = JSON.parse(readFileSync(join(__dirname, 'public/manifest.webmanifest'), 'utf-8'))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: false, // disables Nuxt Webtools
  ssr: false, // full static site generation
  modules: ['@wagmi/vue/nuxt', '@vite-pwa/nuxt'],
  css: ['vue-toastification/dist/index.css'],
  components: false,
  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          charset: 'utf-8',
        },
      ],
      link: [
        {
          // Bootstrap
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        },
        {
          // Bootstrap icons
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
        },
        {
          // Custom
          rel: 'stylesheet',
          href: '/css/custom.css',
        },
        {
          // PWA Manifest
          rel: 'manifest',
          href: '/manifest.webmanifest',
        },
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      activityPointsAddress: '0xe69FD53b8C0F2F764cFe5929CAb5e213c0328b42',
      airdropApAddress: '0x6Dd7580ae0B5b764D08a1d40dE348198F54Bd6BF', // chat token claim for APs
      airdropClaimDomainsAddress: '0xf8bEe277615A92e56AD9664e3020bCc2526F2c0F', // chat token claim for domain holders
      arweaveAddress: process.env.ARWEAVE_ADDRESS,
      arweaveGateway: 'https://arweave.net/',
      arweaveMinBalance: 0.02, // minimum AR balance to upload files
      blockExplorerBaseUrl: 'https://holesky.etherscan.io',
      chat: {
        contexts: {
          general: '0xdeBc51Cc932Aa24fb9bB5D062d73E5B2E933626D', // general discussion channel
          memesImages: '0x0c6A6030121FB3071cB2347DEAC127037785436C',
          shill: '0x9f48c192561f3A6f0efeeE5Fce00Fd9788675eF8',
          nftLaunchpad: '0x305912c0d03C22e6eB7D37E06A47ab899e48B9Af', // comments context
        },
        storage: 'arweave', // storage type: 'arweave' or 'ipfs'
      },
      chatTokenAddress: '0x2843e0b801436409E3e26789217d71a486c6D7dD', // chat token address
      chatTokenDecimals: 18,
      chatTokenImage: 'https://www.pngall.com/wp-content/uploads/8/Gold-Dollar-Coin-PNG-180x180.png', // chat token image
      chatTokenSymbol: 'DEMO', // chat token symbol or name
      domainRequiredToPost: true,
      expiryCollections: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      expiryMods: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      expiryPfps: 1000 * 60 * 60 * 24 * 10, // must be in milliseconds (0 means no expiration)
      expiryUsernames: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      farcasterShareText: 'Check out Iggy Social - A starter template for building Web3 applications with Wagmi and Nuxt!',
      favicon: '/img/favicon.ico',
      fileUploadEnabled: true, // enable/disable file uploads (enable only if external file storage is used, e.g. Arweave)
      fileUploadSizeLimit: 1 * 1024 * 1024, // max file upload size in bytes (1 * 1024 * 1024 = 1 MB)
      fileUploadStorageType: "arweave", // "arweave" or "imagekit"
      fileUploadTokenService: process.env.FILE_UPLOAD_SERVICE || 'netlify', // "netlify" or "vercel" (or leave empty for no file uploads)
      getPostsLimit: 10, // number of posts to fetch
      governanceUrl: 'https://snapshot.org/#/sgbchat.eth', // governance url (snapshot, Tally, etc.)
      imagekitEndpoint: process.env.IMAGEKIT_ENDPOINT,
      imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      ipfsGateway: 'https://ipfs.io/ipfs/',
      ipfsGateway2: 'https://cloudflare-ipfs.com/ipfs/',
      ipfsGateway3: 'https://ipfs.filebase.io/ipfs/',
      linkPreviews: process.env.LINK_PREVIEW_SERVICE || 'netlify', // "netlify", "vercel", or "microlink" (or leave empty for no link previews)
      lpTokenAddress: '', // liquidity pool token (token to stake in the staking contract)
      lpTokenSymbol: 'LP tokens', // LP token symbol
      lpTokenDecimals: 18,
      marketplaceNftCollectionBaseUrl: 'https://testnets.opensea.io/assets/holesky/', // url (append nft address to it)
      newsletterLink: 'https://paragraph.xyz/@iggy?modal=subscribe',
      nftDefaultRatio: 1, // default ratio for the NFT price bonding curve
      nftLaunchpadBondingAddress: '0x2D4144B4E00cf1dC1c4DeDa37cb1CaCEda030998', // NFT launchpad with bonding curve contract address
      nftLaunchpadLatestItems: 4, // number of latest NFTs to show in the NFT launchpad
      previewImage: '/img/covers/cover.png',
      previewImageAirdrop: '/img/covers/cover-airdrop.png',
      previewImageNftCollection: '/img/covers/cover-nft-collection.png',
      previewImageNftCreate: '/img/covers/cover-nft-create.png',
      previewImageNftLaunchpad: '/img/covers/cover-nft-launchpad.png',
      previewImagePost: '/img/covers/cover-post.png',
      previewImagePostNft: '/img/covers/cover-post-nft.png',
      previewImageProfile: '/img/covers/cover-profile.png',
      previewImageStake: '/img/covers/cover-stake.png',
      projectMetadataTitle: 'Iggy Social',
      projectName: 'Iggy Demo',
      projectDescription: 'A starter template for Wagmi Nuxt projects',
      projectTwitter: '@example',
      projectUrl: 'https://demo.iggy.social',
      punkMinterAddress: '', // punk domain minter contract address
      punkNumberOfPrices: 1, // number of different prices (based on domain length), usually 1 (price()) or 5 (price1char() - price5char())
      punkTldAddress: '0x320881Fff17c9a2189226c61ad1157DFF80b18B5', // punk domain TLD address
      showFeatures: {
        // show/hide features in sidebars (if you have too many "true", make the sidebar scrollable --> sidebarLeftSticky: false)
        activityPoints: true,
        airdrop: true,
        governance: false,
        newsletter: false,
        nftLaunchpad: true,
        swap: false,
        stake: false,
        sendTokens: true,
      },
      sidebarLeftSticky: false, // make the left sidebar sticky (always visible)
      stakingContractAddress: '', // this is also the stake/gov token address
      stakeTokenDecimals: 18,
      stakeTokenSymbol: 'IGT', // stake token symbol (governance token symbol)
      supportedChainId: 17000,
      swapPriceImpactMaxBps: 1000, // max price impact in bips (1 bps = 0.01%, 1000bps = 10%) for the swap function
      swapRouterAddress: '', // iggy swap router contract address
      tenorApiKey: process.env.TENOR_KEY || '',
      tldName: '.holesky',
      tokenAddress: undefined, // leave undefined if it's a native token of the chain
      tokenDecimals: 18,
      tokenSymbol: 'ETH',
    }
  },
  compatibilityDate: '2025-06-21',
  vite: {
    server: {
      allowedHosts: true
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
    includeAssets: ['img/favicon.ico', 'img/apple-touch-icon.png', 'img/masked-icon.svg'],
    manifest: manifestFile,
  },
})