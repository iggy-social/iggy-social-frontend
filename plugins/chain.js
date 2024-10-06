import { ethers } from 'ethers'

export default defineNuxtPlugin(() => {
  //const config = useRuntimeConfig() // access env vars like this: config.alchemyPolygonKey

  function getChainName(chainId) {
    let chain = chains.find(chain => chain.chainId == chainId)

    if (chain) {
      return chain.name
    }

    return 'Unsupported Network'
  }

  function getFallbackProvider(networkId) {
    let chain = chains.find(chain => chain.chainId == networkId)

    // choose random rpc from chain.rpcs array
    const randomRpc = chain.rpcs[Math.floor(Math.random() * chain.rpcs.length)]

    let urls = [ randomRpc ]

    if (urls) {
      const providers = urls.map(url => new ethers.providers.JsonRpcProvider(url))
      return new ethers.providers.FallbackProvider(providers, 1) // return fallback provider
    } else {
      return null
    }
  }

  function getRpcByChainId(chainId) {
    let chain = chains.find(chain => chain.chainId == chainId)
    const randomRpc = chain.rpcs[Math.floor(Math.random() * chain.rpcs.length)]
    return randomRpc
  }

  async function switchOrAddChain(ethereum, networkName) {
    // get network id from chains
    let chain = chains.find(chain => chain.name == networkName)
    const randomRpc = chain.rpcs[Math.floor(Math.random() * chain.rpcs.length)]
    let chainId = chain.chainId

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: ethers.utils.hexValue(chainId),
          },
        ],
      })
    } catch (error) {
      if (error.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ethers.utils.hexValue(chainId),
              chainName: networkName,
              nativeCurrency: {
                name: chain.currency,
                symbol: chain.currency,
                decimals: 18,
              },
              rpcUrls: [randomRpc],
              blockExplorerUrls: [chain.blockExplorer],
            },
          ],
        })
      }
    }
  }

  return {
    provide: {
      getChainName: chainId => getChainName(chainId),
      getFallbackProvider: chainId => getFallbackProvider(chainId),
      getRpcByChainId: chainId => getRpcByChainId(chainId),
      switchOrAddChain: (ethereum, networkName) => switchOrAddChain(ethereum, networkName),
    },
  }
})

const chains = [
  {
    chainId: 10,
    name: 'Optimism',
    currency: 'ETH',
    rpcs: ['https://optimism-mainnet.public.blastapi.io', 'https://rpc.ankr.com/optimism'],
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  {
    chainId: 14,
    name: 'Flare',
    currency: 'FLR',
    rpcs: ['https://flare-api.flare.network/ext/C/rpc'],
    blockExplorer: 'https://flare-explorer.flare.network',
  },
  {
    chainId: 19,
    name: 'Songbird',
    currency: 'SGB',
    rpcs: ['https://songbird-api.flare.network/ext/C/rpc'],
    blockExplorer: 'https://songbird-explorer.flare.network',
  },
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    currency: 'BNB',
    rpcs: ['https://rpc.ankr.com/bsc', 'https://bsc-dataseed.binance.org'],
    blockExplorer: 'https://bscscan.com',
  },
  {
    chainId: 100,
    name: 'Gnosis Chain',
    currency: 'XDAI',
    rpcs: ['https://rpc.ankr.com/gnosis'],
    blockExplorer: 'https://gnosisscan.io',
  },
  {
    chainId: 137,
    name: 'Polygon',
    currency: 'POL',
    rpcs: ['https://rpc.ankr.com/polygon'],
    blockExplorer: 'https://polygonscan.com',
  },
  {
    chainId: 250,
    name: 'Fantom',
    currency: 'FTM',
    rpcs: ['https://rpc.ankr.com/fantom'],
    blockExplorer: 'https://ftmscan.com',
  },
  {
    chainId: 8453,
    name: 'Base',
    currency: 'ETH',
    rpcs: ['https://mainnet.base.org'],
    blockExplorer: 'https://basescan.org',
  },
  {
    chainId: 17000,
    name: 'Holesky',
    currency: 'ETH',
    rpcs: ['https://holesky.drpc.org', 'https://1rpc.io/holesky', 'https://ethereum-holesky-rpc.publicnode.com'],
    blockExplorer: 'https://holesky.etherscan.io',
  },
  {
    chainId: 34443,
    name: 'Mode',
    currency: 'ETH',
    rpcs: ['https://mainnet.mode.network', 'https://1rpc.io/mode'],
    blockExplorer: 'https://explorer.mode.network',
  },
  {
    chainId: 42161,
    name: 'Arbitrum',
    currency: 'ETH',
    rpcs: ['https://rpc.ankr.com/arbitrum'],
    blockExplorer: 'https://arbiscan.io',
  },
  {
    chainId: 43114,
    name: 'Avalanche',
    currency: 'AVAX',
    rpcs: ['https://rpc.ankr.com/avalanche'],
    blockExplorer: 'https://snowtrace.io',
  },
  {
    chainId: 81457,
    name: 'Blast',
    currency: 'ETH',
    rpcs: ['https://rpc.blast.io', 'https://rpc.ankr.com/blast'],
    blockExplorer: 'https://blastscan.io',
  },
  {
    chainId: 534352,
    name: 'Scroll',
    currency: 'ETH',
    rpcs: ['https://rpc.scroll.io', 'https://1rpc.io/scroll'],
    blockExplorer: 'https://scrollscan.com',
  },
  {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'ETH',
    rpcs: [
      'https://rpc.sepolia.org',
      'https://eth-sepolia.public.blastapi.io', 
      //'https://1rpc.io/sepolia', 
      'https://ethereum-sepolia-rpc.publicnode.com', 
      //'https://sepolia.gateway.tenderly.co',
      'https://rpc.sepolia.ethpandaops.io',
      'https://sepolia.drpc.org',
    ],
    blockExplorer: 'https://sepolia.etherscan.io',
  },
]
