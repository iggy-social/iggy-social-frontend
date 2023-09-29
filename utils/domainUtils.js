import { ethers } from "ethers";

export async function getDomainName(userAddress, signer) {
  const config = useRuntimeConfig();
  
  let provider = signer;

  if (!provider) {
    provider = this.$getFallbackProvider(config.supportedChainId);
  }

  const tldInterface = new ethers.utils.Interface([
    "function defaultNames(address) view returns (string)"
  ]);

  const contract = new ethers.Contract(config.punkTldAddress, tldInterface, provider);

  // get user's default domain
  const userDomain = await contract.defaultNames(userAddress);

  return userDomain;
}
