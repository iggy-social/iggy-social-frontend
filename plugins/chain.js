import { ethers } from 'ethers';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  function getChainName(chainId) {
    if (chainId === 137) {
      return "Polygon";
    } else if (chainId === 1) {
      return "Ethereum";
    } else if (chainId === 10) {
      return "Optimism";
    } else if (chainId === 56) {
      return "BNB Smart Chain";
    } else if (chainId === 69) {
      return "Optimism Testnet";
    } else if (chainId === 77) {
      return "Gnosis Testnet";
    } else if (chainId === 100) {
      return "Gnosis Chain";
    } else if (chainId === 137) {
      return "Polygon";
    } else if (chainId === 42161) {
      return "Arbitrum";
    } else if (chainId === 421611) {
      return "Arbitrum Testnet";
    } else if (chainId === 80001) {
      return "Polygon Testnet";
    } else if (chainId === 3) {
      return "Ropsten";
    } else if (chainId === 4) {
      return "Rinkeby";
    } else if (chainId === 1313161555) {
      return "Aurora Testnet";
    } else {
      return "Unsupported Network";
    }
  }

  function getFallbackProvider(chainId) {
    let urls;

      if (chainId === 1) {
        // Ethereum
        urls = [
          "https://eth-mainnet.g.alchemy.com/v2/" + config.alchemyEthereumKey
        ];
      } else if (chainId === 137) {
        // Polygon PoS Chain
        urls = [
          "https://polygon-rpc.com/", 
          "https://polygon-mainnet.g.alchemy.com/v2/" + config.alchemyPolygonKey
        ];
      } else if (chainId === 80001) {
        // Mumbai testnet (Polygon testnet)
        urls = [
          "https://matic-mumbai.chainstacklabs.com",
          "https://polygon-mumbai.g.alchemy.com/v2/" + config.alchemyMumbaiKey
        ]
      } else if (chainId === 10) {
        // Optimism
        urls = [
          "https://mainnet.optimism.io",
          "https://opt-mainnet.g.alchemy.com/v2/" + config.alchemyOptimismKey
        ]; 
      } else if (chainId === 56) {
        // BSC mainnet
        urls = [
          "https://bscrpc.com"
        ];
      } else if (chainId === 77) {
        // Gnosis Chain testnet (Sokol)
        urls = [
          "https://sokol.poa.network"
        ];
      } else if (chainId === 100) {
        // Gnosis Chain
        urls = [
          "https://rpc.xdaichain.com",
          "https://rpc.gnosischain.com"
        ];
      } else if (chainId === 42161) {
        // Arbitrum
        urls = [
          "https://arb1.arbitrum.io/rpc",
          "https://arb-mainnet.g.alchemy.com/v2/" + config.alchemyArbitrumKey
        ];
      } else if (chainId === 421611) {
        // Arbitrum testnet
        urls = [
          "https://rinkeby.arbitrum.io/rpc"
        ];
      } else if (chainId === 1313161555) {
        // Aurora testnet
        urls = [
          "https://testnet.aurora.dev"
        ];
      }

      if (urls) {
        const providers = urls.map(url => new ethers.providers.JsonRpcProvider(url));
        return new ethers.providers.FallbackProvider(providers, 1); // return fallback provider
      } else {
        return null;
      }
  }

  return {
    provide: {
      getChainName: (chainId) => getChainName(chainId),
      getFallbackProvider: (chainId) => getFallbackProvider(chainId)
    }
  }
});

