import { ethers } from "ethers";
import Erc20Abi from "~/assets/abi/Erc20Abi.json";

export async function getTokenAllowance(token, userAddress, beneficiary, signer) {
  const config = useRuntimeConfig();
  
  let provider = signer;

  if (!provider) {
    provider = this.$getFallbackProvider(config.supportedChainId);
  }

  const contract = new ethers.Contract(token.address, Erc20Abi, provider);
  const allowanceWei = await contract.allowance(userAddress, beneficiary);

  return ethers.utils.formatUnits(allowanceWei, token.decimals);
}

export async function getTokenBalance(token, userAddress, signer) {
  const config = useRuntimeConfig();
  
  let provider = signer;

  if (!provider) {
    provider = this.$getFallbackProvider(config.supportedChainId);
  }

  let balanceWei;

  if (token.address === ethers.constants.AddressZero) {
    if (!signer) {
      balanceWei = await provider.getBalance(userAddress);
    } else {
      balanceWei = await signer.getBalance();
    }
  } else {
    const contract = new ethers.Contract(token.address, Erc20Abi, provider);
    balanceWei = await contract.balanceOf(userAddress);
  }

  return ethers.utils.formatUnits(balanceWei, token.decimals);
}