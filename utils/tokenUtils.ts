// Types for MetaMask token addition
interface TokenAssetOptions {
  address: string;
  symbol: string;
  decimals: number;
  image: string;
}

interface WatchAssetParams {
  type: 'ERC20';
  options: TokenAssetOptions;
}

interface MetaMaskRequest {
  method: 'wallet_watchAsset';
  params: WatchAssetParams;
}

// Type for the ethereum provider
interface EthereumProvider {
  request: (request: MetaMaskRequest) => Promise<void>;
}

export async function addTokenToMetaMask(
  ethereum: EthereumProvider,
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenImage: string
): Promise<void> {
  await ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: tokenAddress, // The address of the token.
        symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 characters.
        decimals: tokenDecimals, // The number of decimals in the token.
        image: tokenImage, // A string URL of the token logo.
      },
    },
  });
}
