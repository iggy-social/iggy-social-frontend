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
      activityPointsAddress: '0xC3623737209Cc141592B20bcEBCA6052AFCcD183',
      airdropApAddress: '0x519Cc13253d5bd6bC0b635B9f337230B34B3b1e7', // chat token claim for APs
      airdropClaimDomainsAddress: '0x8c54EAEA2DDAA8491a32F3A0D9B308d810aEA4fc', // chat token claim for domain holders
      blockExplorerBaseUrl: 'https://sepolia.etherscan.io',
      chatChannels: {
        // go to Orbis Dashboard (https://useorbis.com/dashboard), create a new Project and then create a new Context for each of the channels below
        general: 'kjzl6cwe1jw146oflxjkdze94vniq4r79g01rmy8ylezya6p8xqu3zw63t4jesp', // general discussion channel
        memesImages: 'kjzl6cwe1jw148bbt70ddci5n3oj8b2b469g5qps43y8lejrwong9ztedzetoz0',
        shill: 'kjzl6cwe1jw1499wavrb36wapyxix3yqkkq1enaxhsqhhtkaws2ss8vm3b5cixm',
        nftLaunchpad: 'kjzl6cwe1jw1490l9agydb0vh2x0mddzxbsmga7s3yhl86utbhwne6zkhpikytw',
        friendKeys: 'kjzl6cwe1jw14akr2rh1j3fhup1ewfr2uyyd6l85qllbe2d5fxywt7d8rqnau6j',
      },
      chatTokenAddress: '0x305912c0d03C22e6eB7D37E06A47ab899e48B9Af', // chat token address
      chatTokenImage: 'https://bafkreigih3jk3d4fffzml27e7kqyn636t7v646ohxvhv3nzhkzfcmh4prq.ipfs.w3s.link', // chat token image
      chatTokenSymbol: 'DEMO', // chat token symbol or name
      domainRequiredToPost: true,
      expiryCollections: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      expiryUsernames: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      favicon: '/img/favicon.svg',
      fileUploadEnabled: true, // enable/disable file uploads (enable only if external file storage is used, e.g. IPFS via ThirdWeb)
      fileUploadSizeLimit: 1 * 1024 * 1024, // max file upload size in bytes (1 * 1024 * 1024 = 1 MB)
      fileUploadTokenService: process.env.FILE_UPLOAD_SERVICE || 'netlify', // "netlify" or "vercel" (or leave empty for no file uploads)
      getPostsLimit: 30, // number of posts to fetch from Orbis in the getPosts() function
      governanceUrl: 'https://snapshot.org/#/sgbchat.eth', // governance url (snapshot, Tally, etc.)
      iggyPostAddress: '0x0BF6333Fc85159663A30Ac89FD02c5031B97c5ee',
      iggyPostMinterAddress: '0xc486B08Ed47fFe5c1b4b1A2ff5c671EA0083D9bA',
      iggyPostStatsAddress: '0x3Fa0EaC3058828Cc4BA97F51A33597C695bF6F9e',
      imagekitEndpoint: process.env.IMAGEKIT_ENDPOINT,
      imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/',
      ipfsGateway2: 'https://ipfs.io/ipfs/',
      ipfsGateway3: 'https://nftdegeniggy.myfilebase.com/ipfs/',
      keysAddress: '0x0c6A6030121FB3071cB2347DEAC127037785436C', // FriendKeys contract address
      keysFeatured: ['tempe', 'tekr'],
      linkPreviews: process.env.LINK_PREVIEW_SERVICE || 'netlify', // "netlify", "vercel", or "microlink" (or leave empty for no link previews)
      lpTokenAddress: '', // liquidity pool token (token to stake in the staking contract)
      lpTokenSymbol: 'LP tokens', // LP token symbol
      marketplacePostNftUrl: 'https://testnets.opensea.io/assets/sepolia/0x0BF6333Fc85159663A30Ac89FD02c5031B97c5ee',
      marketplacePostNftItemUrl:
        'https://testnets.opensea.io/assets/sepolia/0x0BF6333Fc85159663A30Ac89FD02c5031B97c5ee/', // url (append nft id to it)
      marketplaceNftCollectionBaseUrl: 'https://testnets.opensea.io/assets/sepolia/', // url (append nft address to it)
      newsletterLink: 'https://paragraph.xyz/@iggy?modal=subscribe',
      nftDefaultRatio: 1, // default ratio for the NFT price bonding curve
      nftLaunchpadBondingAddress: '0x50045895e1983F39FDC149C9a5AC29C39BEA18fe', // NFT launchpad with bonding curve contract address
      nftLaunchpadLatestItems: 4, // number of latest NFTs to show in the NFT launchpad
      orbisTest: false, // if true, test context will be used instead of the production one
      orbisTestContext: 'kjzl6cwe1jw145tfqv2eqv8tiz6puo27meyz4smz40atppuc13tulqca87k35z2', // test context
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
      punkTldAddress: '0x1DD820F4f48eBC2B8e7F666F34fbC5820808074e', // punk domain TLD address
      randomPostsNumber: 1, // number of random post NFTs to show in the sidebar widget
      rpcCustom: process.env.RPC_CUSTOM || 'https://rpc.sepolia.org', // Custom RPC URL
      showFeatures: {
        // show/hide features in sidebars (if you have too many "true", make the sidebar scrollable --> sidebarLeftSticky: false)
        activityPoints: true,
        airdrop: true,
        friendKeys: true,
        governance: false,
        newsletter: false,
        nftLaunchpad: true,
        randomMintedPosts: true,
        searchPosts: true,
        swap: true,
        stake: false,
        sendTokens: true,
        spotify: false,
      },
      showRepliesOnHomepage: true, // show replies on the homepage
      sidebarLeftSticky: false, // make the left sidebar sticky (always visible)
      spotifyPlaylistId: '5y7f2Wxfq49G5KuNQfMPbk', // enter just the ID of the playlist (not the full URL)
      stakingContractAddress: '', // this is also the stake/gov token address
      stakeTokenSymbol: 'IGT', // stake token symbol (governance token symbol)
      supportedChainId: 11155111,
      swapPriceImpactMaxBps: 1000, // max price impact in bips (1 bps = 0.01%, 1000bps = 10%) for the swap function
      swapRouterAddress: '', // iggy swap router contract address
      tenorApiKey: process.env.TENOR_KEY || '',
      thirdwebClientId: process.env.THIRDWEB_CLIENT_ID || '',
      tldName: '.sepolia',
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
