import { ethers } from 'ethers';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig() // access env vars like this: config.alchemyPolygonKey

  function getChainName(chainId) {
    let chain = chains.find(chain => chain.chainId == chainId);

    if (chain) {
      return chain.name;
    }
    
    return "Unsupported Network";
  }

  function getFallbackProvider(networkId) {
    let mainRpc = config.rpcCustom;
    let chain = chains.find(chain => chain.chainId == networkId);

    if (!mainRpc) {
      mainRpc = chain.rpc1;
    }

    let urls = [mainRpc];

    if (urls) {
      const providers = urls.map(url => new ethers.providers.JsonRpcProvider(url));
      return new ethers.providers.FallbackProvider(providers, 1); // return fallback provider
    } else {
      return null;
    }
  }

  function getRpcByChainId(chainId) {
    let chain = chains.find(chain => chain.chainId == chainId);
    return chain.rpc1;
  }

  async function switchOrAddChain(ethereum, networkName) {
    // get network id from chains
    let chain = chains.find(chain => chain.name == networkName);
    let chainId = chain.chainId;

    try {
      await ethereum.request({
        "method": "wallet_switchEthereumChain",
        "params": [
          {
            "chainId": ethers.utils.hexValue(chainId)
          }
        ]
      });
    } catch (error) {
      if (error.code === 4902) {
        await ethereum.request({
          "method": "wallet_addEthereumChain",
          "params": [
            {
              "chainId": ethers.utils.hexValue(chainId),
              "chainName": networkName,
              "nativeCurrency": {
                "name": chain.currency,
                "symbol": chain.currency,
                "decimals": 18
              },
              "rpcUrls": [chain.rpc2],
              "blockExplorerUrls": [chain.blockExplorer]
            }
          ]
        });
      }
    }
  }

  return {
    provide: {
      getChainName: (chainId) => getChainName(chainId),
      getFallbackProvider: (chainId) => getFallbackProvider(chainId),
      getRpcByChainId: (chainId) => getRpcByChainId(chainId),
      switchOrAddChain: (ethereum, networkName) => switchOrAddChain(ethereum, networkName)
    }
  }
});

const chains = [
  { chainId: 10, name: "Optimism", currency: "ETH", rpc1: "https://optimism-mainnet.public.blastapi.io", rpc2: "https://rpc.ankr.com/optimism", blockExplorer: "https://optimistic.etherscan.io" },
  { chainId: 14, name: "Flare", currency: "FLR", rpc1: "https://flare-api.flare.network/ext/C/rpc", rpc2: "https://flare-api.flare.network/ext/C/rpc", blockExplorer: "https://flare-explorer.flare.network" },
  { chainId: 19, name: "Songbird", currency: "SGB", rpc1: "https://songbird-api.flare.network/ext/C/rpc", rpc2: "https://sgb.ftso.com.au/ext/bc/C/rpc", blockExplorer: "https://songbird-explorer.flare.network" },
  { chainId: 56, name: "BNB Smart Chain", currency: "BNB", rpc1: "https://rpc.ankr.com/bsc", rpc2: "https://bsc-dataseed.binance.org", blockExplorer: "https://bscscan.com" },
  { chainId: 100, name: "Gnosis Chain", currency: "XDAI", rpc1: "https://rpc.ankr.com/gnosis", rpc2: "https://rpc.ankr.com/gnosis", blockExplorer: "https://gnosisscan.io" },
  { chainId: 137, name: "Polygon", currency: "MATIC", rpc1: "https://rpc.ankr.com/polygon", rpc2: "https://rpc.ankr.com/polygon", blockExplorer: "https://polygonscan.com" },
  { chainId: 250, name: "Fantom", currency: "FTM", rpc1: "https://rpc.ankr.com/fantom", rpc2: "https://rpc.ankr.com/fantom", blockExplorer: "https://ftmscan.com" },
  { chainId: 8453, name: "Base", currency: "ETH", rpc1: "https://mainnet.base.org", rpc2: "https://mainnet.base.org", blockExplorer: "https://basescan.org" },
  { chainId: 34443, name: "Mode", currency: "ETH", rpc1: "https://mainnet.mode.network", rpc2: "https://1rpc.io/mode", blockExplorer: "https://explorer.mode.network"},
  { chainId: 42161, name: "Arbitrum", currency: "ETH", rpc1: "https://rpc.ankr.com/arbitrum", rpc2: "https://rpc.ankr.com/arbitrum", blockExplorer: "https://arbiscan.io"},
  { chainId: 43114, name: "Avalanche", currency: "AVAX", rpc1: "https://rpc.ankr.com/avalanche", rpc2: "https://rpc.ankr.com/avalanche", blockExplorer: "https://snowtrace.io"},
  { chainId: 80001, name: "Polygon Testnet Mumbai", currency: "MATIC", rpc1: "https://polygon-mumbai-pokt.nodies.app", rpc2: "https://polygon-mumbai-pokt.nodies.app", blockExplorer: "https://mumbai.polygonscan.com"},
  { chainId: 81457, name: "Blast", currency: "ETH", rpc1: "https://rpc.blast.io", rpc2: "https://rpc.ankr.com/blast", blockExplorer: "https://blastscan.io"},
  { chainId: 534352, name: "Scroll", currency: "ETH", rpc1: "https://rpc.scroll.io", rpc2: "https://1rpc.io/scroll", blockExplorer: "https://scrollscan.com"},
  { chainId: 11155111, name: "Sepolia", currency: "ETH", rpc1: "https://eth-sepolia.public.blastapi.io", rpc2: "https://1rpc.io/sepolia", blockExplorer: "https://sepolia.etherscan.io"},
];
