import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { http, cookieStorage, createConfig, createStorage } from '@wagmi/vue'
import { injected, metaMask, walletConnect } from '@wagmi/vue/connectors'
import type { Chain } from 'viem'

export const customArbitrumSepolia: Chain = {
  id: 421_614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://sepolia-rollup.arbitrum.io/rpc',
        'https://arbitrum-sepolia.drpc.org',
        'https://arbitrum-sepolia.therpc.io',
        'https://arbitrum-sepolia.gateway.tenderly.co',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://sepolia.arbiscan.io',
      apiUrl: 'https://api-sepolia.arbiscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 81930,
    },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [customArbitrumSepolia],
  connectors: [
    injected(),
    farcasterMiniApp(),
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [customArbitrumSepolia.id]: http(),
  },
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
