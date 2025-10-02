import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: false, // disables Nuxt Webtools
  ssr: false, // full static site generation
  modules: ['@wagmi/vue/nuxt'],
  css: ['vue-toastification/dist/index.css'],
  components: false,
  app: {
    head: {
      meta: [
        {
          charset: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'fc:miniapp',
          content: '{"version":"next", "imageUrl":"https://demo.iggy.social/img/farcaster/fc-image.png", "button":{"title":"A starter template for building Web3 applications with Wagmi and Nuxt", "action":{ "type":"launch_miniapp", "name":"Iggy Social", "url":"https://demo.iggy.social", "splashImageUrl":"https://demo.iggy.social/img/farcaster/fc-icon.png", "splashBackgroundColor":"#002b36"}}}',
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
      activityPointsAddress: '0x7058413D002B36486465FF8628bBcCE080e6Af87',
      airdropApAddress: '', // chat token claim for APs
      airdropClaimDomainsAddress: '', // chat token claim for domain holders
      arweaveAddress: process.env.ARWEAVE_ADDRESS,
      arweaveGateway: 'https://arweave.net/',
      arweaveMinBalance: 0.02, // minimum AR balance to upload files
      blockExplorerBaseUrl: 'https://sepolia.basescan.org',
      chat: {
        contexts: {
          general: '0x2843e0b801436409E3e26789217d71a486c6D7dD', // general discussion channel
          memesImages: '0xde16C1c780f32cF8dB6F6F41a58B2D4e91B86fd3',
          shill: '0x38E89E57e88fF8bB3Dc995f28a54bE8D99b582C2',
          nftLaunchpad: '0x6Dd7580ae0B5b764D08a1d40dE348198F54Bd6BF', // comments context
        },
        storage: 'arweave', // storage type: 'arweave' or 'ipfs'
      },
      chatTokenAddress: '0x249f1172Ebd8686386a5C0Ee704378B85acD0627', // chat token address
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
      nftLaunchpadBondingAddress: '0xBdaba8106cdC29420c9A7Bb31066ED79c9b6Be74', // NFT launchpad with bonding curve contract address
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
      punkTldAddress: '0xD9FF69E89D9B6a7f18a46e9151c48BfBF687B7da', // punk domain TLD address
      showFeatures: {
        // show/hide features in sidebars (if you have too many "true", make the sidebar scrollable --> sidebarLeftSticky: false)
        activityPoints: true,
        airdrop: false,
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
      supportedChainId: 84532,
      swapPriceImpactMaxBps: 1000, // max price impact in bips (1 bps = 0.01%, 1000bps = 10%) for the swap function
      swapRouterAddress: '', // iggy swap router contract address
      tenorApiKey: process.env.TENOR_KEY || '',
      tldName: '.demo',
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
})