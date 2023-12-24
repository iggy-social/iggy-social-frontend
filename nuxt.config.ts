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
          href: "	https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        },
        { // Bootstrap icons
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
        },
        { // Custom
          rel: "stylesheet",
          href: "/css/custom.css"
        }
      ],
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
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
      activityPointsAddress: "0xc78412f838A40e6B0df0A24c058A5608019dEc02",
      airdropApAddress: "", // chat token claim for APs
      airdropClaimDomainsAddress: "0x3ebDBc1D47d4bFe7D08A58123Ab3c85fC7358831", // chat token claim for domain holders
      blockExplorerBaseUrl: "https://mumbai.polygonscan.com",
      chatTokenAddress: "0x83C0E6655Ea65363F8B85954afa29F05e257231b", // chat token address
      chatTokenImage: "https://bafkreigih3jk3d4fffzml27e7kqyn636t7v646ohxvhv3nzhkzfcmh4prq.ipfs.w3s.link", // chat token image
      chatTokenSymbol: "CHAT", // chat token symbol or name
      domainRequiredToPost: true,
      expiryCollections: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      expiryUsernames: 1000 * 60 * 60 * 24 * 7, // must be in milliseconds (0 means no expiration)
      favicon: "/img/favicon.svg",
      fileUploadEnabled: true, // enable/disable file uploads (enable only if external file storage is used, e.g. IPFS via Spheron)
      fileUploadSizeLimit: 1 * 1024 * 1024, // max file upload size in bytes (1 * 1024 * 1024 = 1 MB)
      fileUploadTokenService: process.env.FILE_UPLOAD_SERVICE || "netlify", // "netlify" or "vercel" (or leave empty for no file uploads)
      getPostsLimit: 30, // number of posts to fetch from Orbis in the getPosts() function
      governanceUrl: "https://snapshot.org/#/sgbchat.eth", // governance url (snapshot, Tally, etc.)
      iggyPostAddress: "0xb5A9c6096a2A5d761337ae29C018218BCfeeEf73",
      iggyPostMinterAddress: "0xece8B88ee42E7d68160BbC192E125b5F63B32430",
      iggyPostStatsAddress: "0xe336676aC859785CECe2659317176304DB2DF808",
      ipfsGateway: "https://cloudflare-ipfs.com/ipfs/",
      keysAddress: "0x018402Df92a74d1FCE36AbF604D31e7C8D0ABb14", // FriendKeys contract address 
      keysContext: "kjzl6cwe1jw14akr2rh1j3fhup1ewfr2uyyd6l85qllbe2d5fxywt7d8rqnau6j",
      keysFeatured: ["tempe", "tekr"],
      linkPreviews: process.env.LINK_PREVIEW_SERVICE || "netlify", // "netlify", "vercel", or "microlink" (or leave empty for no link previews)
      lpTokenAddress: "0xF874f79eBfB8FEe898a289C4cAa5dc4383873431", // liquidity pool token (token to stake in the staking contract)
      lpTokenSymbol: "LP tokens", // LP token symbol
      marketplacePostNftUrl: "https://testnets.opensea.io/assets/mumbai/0x63FE8216a66737CFE474DF3949F9081EbD4Bd800",
      marketplacePostNftItemUrl: "https://testnets.opensea.io/assets/mumbai/0x63FE8216a66737CFE474DF3949F9081EbD4Bd800/", // url (append nft id to it)
      marketplaceNftCollectionBaseUrl: "https://testnets.opensea.io/assets/mumbai/", // url (append nft address to it)
      newsletterLink: "https://paragraph.xyz/@iggy?modal=subscribe",
      nftDefaultRatio: 1, // default ratio for the NFT price bonding curve
      nftLaunchpadBondingAddress: "0x8f603a26a6C286CB55ed9cC07F42fCc02bdE4821", // NFT launchpad with bonding curve contract address
      nftLaunchpadLatestItems: 4, // number of latest NFTs to show in the NFT launchpad
      nftOrbisContext: "kjzl6cwe1jw1490l9agydb0vh2x0mddzxbsmga7s3yhl86utbhwne6zkhpikytw", // Orbis context for NFT collection pages
      orbisCategories: [ // use only alphanumeric ASCII characters for slugs! (no spaces, only dash is allowed)
        { "slug": "all", "title": "All posts", "hidden": false }, // not a real tag, just denotes the absence of a tag (always keep it here)
        { "slug": "general", "title": "General discussion", "hidden": false },
        { "slug": "shill", "title": "Shill & discuss projects", "hidden": true },
        { "slug": "nfts", "title": "Memes & NFTs", "hidden": false }, // keep this category for the purpose of the NFT launchpad
        { "slug": "governance", "title": "Governance", "hidden": true },
        { "slug": "food", "title": "Food & recipes", "hidden": true },
        { "slug": "movie", "title": "Movies & Music", "hidden": false },
        { "slug": "music", "title": "Music", "hidden": true },
        { "slug": "random", "title": "Random", "hidden": false },
      ],
      orbisContext: "kjzl6cwe1jw14b86b0dwz8x7ribwcn9tsull1bphner0nyfdwxsqnohbtrrvgtl", // production context
      orbisTest: false, // if true, test context will be used instead of the production one
      orbisTestContext: "kjzl6cwe1jw145tfqv2eqv8tiz6puo27meyz4smz40atppuc13tulqca87k35z2", // test context
      previewImage: "/img/covers/cover.svg",
      previewImageAirdrop: "/img/covers/cover-airdrop.svg",
      previewImageNftCollection: "/img/covers/cover-nft-collection.svg",
      previewImageNftCreate: "/img/covers/cover-nft-create.svg",
      previewImageNftLaunchpad: "/img/covers/cover-nft-launchpad.svg",
      previewImagePost: "/img/covers/cover-post.svg",
      previewImagePostNft: "/img/covers/cover-post-nft.svg",
      previewImageProfile: "/img/covers/cover-profile.svg",
      previewImageStake: "/img/covers/cover-stake.svg",
      profileMintedPostIdsMax: 36, // max number of minted post ids to show in the profile page
      projectMetadataTitle: "Iggy Social Demo | Web3 Social Template For Your DAO",
      projectName: "Iggy Demo",
      projectDescription: "This is a demo website presenting Iggy Social, a web3 social template for your DAO.",
      projectTwitter: "https://twitter.com/iggysocial",
      projectUrl: "https://demo.iggy.social", // without trailing slash!
      punkMinterAddress: "", // punk domain minter contract address
      punkNumberOfPrices: 1, // number of different prices (based on domain length), usually 1 (price()) or 5 (price1char() - price5char())
      punkTldAddress: "0x2582EC420195Fefb091B098da6FAdEE49f490740", // punk domain TLD address
      randomPostsNumber: 1, // number of random post NFTs to show in the sidebar widget
      rpcCustom: process.env.RPC_CUSTOM || "", // Custom RPC URL
      showFeatures: { // show/hide features in sidebars (if you have too many "true", make the sidebar scrollable --> sidebarLeftSticky: false)
        "activityPoints": true, 
        "airdrop": true, 
        "friendKeys": true, 
        "governance": false,
        "newsletter": false, 
        "nftLaunchpad": true, 
        "randomMintedPosts": true, 
        "swap": true, 
        "stake": false, 
        "sendTokens": false, 
        "spotify": false
      }, 
      showRepliesOnHomepage: true, // show replies on the homepage  
      sidebarLeftSticky: false, // make the left sidebar sticky (always visible)
      spotifyPlaylistId: "5y7f2Wxfq49G5KuNQfMPbk", // enter just the ID of the playlist (not the full URL)  
      stakingContractAddress: "0x96Dc7548fD018d1E51d2d5e98B265411C3D0F22A", // this is also the stake/gov token address
      stakeTokenSymbol: "IGT", // stake token symbol (governance token symbol)
      supportedChainId: 80001,
      swapPriceImpactMaxBps: 1000, // max price impact in bips (1 bps = 0.01%, 1000bps = 10%) for the swap function
      swapRouterAddress: "0xeE554E54659B76A81E2B71142b63Bded98100eD8", // iggy swap router contract address
      tenorApiKey: process.env.TENOR_KEY || "",
      tldName: ".testnet",
      tokenAddress: null, // leave null if it's a native token of the chain
      tokenDecimals: 18,
      tokenSymbol: "MATIC"
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
