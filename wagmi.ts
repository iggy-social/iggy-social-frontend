import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { http, cookieStorage, createConfig, createStorage } from '@wagmi/vue'
import { injected, metaMask, walletConnect } from '@wagmi/vue/connectors'
import { baseSepolia } from '@wagmi/vue/chains'
import type { Chain } from 'viem'

export const customBaseSepolia: Chain = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://sepolia.base.org',
        'https://base-sepolia.drpc.org',
        'https://base-sepolia.therpc.io',
        'https://base-sepolia.gateway.tenderly.co',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
      apiUrl: 'https://api-sepolia.basescan.org/api',
    },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [baseSepolia],
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
    [baseSepolia.id]: http(),
  },
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
