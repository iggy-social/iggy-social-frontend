import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
          href: '	https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
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
  components: false,
  css: ['vue-toastification/dist/index.css'],
  modules: ['@pinia/nuxt', '@vueuse/nuxt'],
  router: {
    options: {
      hashMode: false,
    },
  },
  runtimeConfig: {
    public: {
      activityPointsAddress: '',
      airdropApAddress: '', // chat token claim for APs
      airdropClaimDomainsAddress: '', // chat token claim for domain holders
      arweaveAddress: process.env.ARWEAVE_ADDRESS,
      arweaveGateway: 'https://arweave.net/',
      arweaveMinBalance: 0.02, // minimum AR balance to upload files
      blockExplorerBaseUrl: 'https://holesky.etherscan.io',
      chat: {
        contexts: {
          general: '0x4A82158ff4B0504F3DB4c7555FfB6298452985E2', // general discussion channel
          memesImages: '0x1EB2Adc19eB3Df26D84427Be11F1eB1887c6631c',
          shill: '0xC3623737209Cc141592B20bcEBCA6052AFCcD183',
          nftLaunchpad: '0x498e0e6B245898c5E2dD0299d0456a8928F58ECC', // comments context
        },
        storage: 'arweave', // storage type: 'arweave' or 'ipfs'
      },
      chatTokenAddress: '', // chat token address
      chatTokenImage: '', // chat token image
      chatTokenSymbol: 'DEMO', // chat token symbol or name
      domainRequiredToPost: true,
      expiryCollections: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      expiryMods: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      expiryPfps: 1000 * 60 * 60 * 24 * 10, // must be in milliseconds (0 means no expiration)
      expiryUsernames: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      favicon: '/img/favicon.svg',
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
      profileMintedPostIdsMax: 36, // max number of minted post ids to show in the profile page
      projectMetadataTitle: 'Iggy Social Demo | Web3 Social Template For Your DAO',
      projectName: 'Iggy Demo',
      projectDescription: 'This is a demo website presenting Iggy Social, a web3 social template for your DAO.',
      projectTwitter: 'https://twitter.com/iggysocial',
      projectUrl: 'https://demo.iggy.social', // without trailing slash!
      punkMinterAddress: '', // punk domain minter contract address
      punkNumberOfPrices: 1, // number of different prices (based on domain length), usually 1 (price()) or 5 (price1char() - price5char())
      punkTldAddress: '0x320881Fff17c9a2189226c61ad1157DFF80b18B5', // punk domain TLD address
      randomPostsNumber: 1, // number of random post NFTs to show in the sidebar widget
      showFeatures: {
        // show/hide features in sidebars (if you have too many "true", make the sidebar scrollable --> sidebarLeftSticky: false)
        activityPoints: false,
        airdrop: false,
        governance: false,
        newsletter: false,
        nftLaunchpad: true,
        swap: false,
        stake: false,
        sendTokens: true,
        spotify: false,
      },
      sidebarLeftSticky: false, // make the left sidebar sticky (always visible)
      spotifyPlaylistId: '5y7f2Wxfq49G5KuNQfMPbk', // enter just the ID of the playlist (not the full URL)
      stakingContractAddress: '', // this is also the stake/gov token address
      stakeTokenSymbol: 'IGT', // stake token symbol (governance token symbol)
      supportedChainId: 17000,
      swapPriceImpactMaxBps: 1000, // max price impact in bips (1 bps = 0.01%, 1000bps = 10%) for the swap function
      swapRouterAddress: '', // iggy swap router contract address
      tenorApiKey: process.env.TENOR_KEY || '',
      tldName: '.holesky',
      tokenAddress: null, // leave null if it's a native token of the chain
      tokenDecimals: 18,
      tokenSymbol: 'ETH',
    },
  },
  vite: {
    build: {
      target: ['es2020'], // fix big integer literals error
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis', // fix nuxt3 global
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true, // fix nuxt3 process
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
        target: 'es2020', // fix big integer literals error
      },
    },
  },
})
