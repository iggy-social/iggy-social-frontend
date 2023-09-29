import { ethers } from 'ethers';
import { getRpcs, getRpcs2 } from "~/utils/rpcUtils";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig() // access env vars like this: config.alchemyPolygonKey

  function getChainName(chainId) {
    if (chainId === 1) {
      return "Ethereum";
    } else if (chainId === 10) {
      return "Optimism";
    } else if (chainId === 14) {
      return "Flare";
    }  else if (chainId === 19) {
      return "Songbird";
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
    } else if (chainId === 250) {
      return "Fantom";
    } else if (chainId === 420) {
      return "Optimism Goerli Testnet";
    } else if (chainId === 4002) {
      return "Fantom Testnet";
    } else if (chainId === 42161) {
      return "Arbitrum";
    } else if (chainId === 421611) {
      return "Arbitrum Testnet";
    } else if (chainId === 421613) {
      return "Arbitrum Goerli Testnet";
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

  function getFallbackProvider(networkId) {
    let mainRpc = config.rpcCustom;

    if (!mainRpc) {
      mainRpc = getRpcs()[networkId];
    }

    let urls = [
      // getRpcs2()[networkId],
      mainRpc
    ];

    if (urls) {
      const providers = urls.map(url => new ethers.providers.JsonRpcProvider(url));
      return new ethers.providers.FallbackProvider(providers, 1); // return fallback provider
    } else {
      return null;
    }
  }

  function switchChain(networkName) {
    let method;
    let networkId;
    let params;

    if (networkName == "Ethereum") {
      method = "wallet_switchEthereumChain"
      params = [{ chainId: "0x1" }] 
    } else if (networkName == "Polygon Testnet") {
      networkId = 80001;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://mumbai.polygonscan.com" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Mumbai Testnet",
        nativeCurrency: { decimals: 18, name: "Matic", symbol: "MATIC" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Arbitrum Testnet") {
      networkId = 421611;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://testnet.arbiscan.io" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Arbitrum Testnet",
        nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
        rpcUrls: [getRpcs2()[networkId]] 
      }] 
    } else if (networkName == "Arbitrum") {
      networkId = 42161;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://arbiscan.io" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Arbitrum One",
        nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Optimism") {
      networkId = 10;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://optimistic.etherscan.io/" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Optimism",
        nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Optimism Goerli Testnet") {
      networkId = 420;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://goerli-optimism.etherscan.io/" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Optimism Goerli Testnet",
        nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Polygon") {
      networkId = 137;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://polygonscan.com" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Polygon PoS Chain",
        nativeCurrency: { decimals: 18, name: "MATIC", symbol: "MATIC" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Gnosis Testnet") {
      networkId = 77;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://blockscout.com/poa/sokol" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Gnosis Testnet",
        nativeCurrency: { decimals: 18, name: "SPOA", symbol: "SPOA" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Gnosis Chain") {
      networkId = 100;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://blockscout.com/xdai/mainnet" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Gnosis Chain",
        nativeCurrency: { decimals: 18, name: "XDAI", symbol: "XDAI" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "BNB Smart Chain") {
      networkId = 56;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://bscscan.com/" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "BNB Smart Chain",
        nativeCurrency: { decimals: 18, name: "BNB", symbol: "BNB" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Fantom") {
      networkId = 250;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://ftmscan.com" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Fantom",
        nativeCurrency: { decimals: 18, name: "FTM", symbol: "FTM" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Fantom Testnet") {
      networkId = 4002;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://testnet.ftmscan.com" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Fantom Testnet",
        nativeCurrency: { decimals: 18, name: "FTM", symbol: "FTM" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Songbird") {
      networkId = 19;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://songbird-explorer.flare.network/" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Songbird",
        nativeCurrency: { decimals: 18, name: "SGB", symbol: "SGB" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    } else if (networkName == "Flare") {
      networkId = 14;
      method = "wallet_addEthereumChain"
      params = [{ 
        blockExplorerUrls: [ "https://flare-explorer.flare.network/" ],
        chainId: ethers.utils.hexValue(networkId),
        chainName: "Flare",
        nativeCurrency: { decimals: 18, name: "FLR", symbol: "FLR" }, 
        rpcUrls: [getRpcs2()[networkId]]
      }] 
    }

    return { 
      method: method, 
      params: params
    }
  }

  return {
    provide: {
      getChainName: (chainId) => getChainName(chainId),
      getFallbackProvider: (chainId) => getFallbackProvider(chainId),
      switchChain: (chainName) => switchChain(chainName)
    }
  }
});

