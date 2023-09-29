import { ethers } from "ethers";
import wrappedNativeTokens from "~/assets/data/wrappedNativeTokens.json";
import { useSiteStore } from '~/store/site';

export async function getPriceImpactBps(signer, inputToken, outputToken, amountIn, routerAddress) {
  const config = useRuntimeConfig();

  let provider = signer;

  if (!provider) {
    provider = this.$getFallbackProvider(config.supportedChainId);
  }

  // router interface
  const routerAbi = [
    "function getPriceImpact(address tokenIn, address tokenOut, uint amountIn) external view returns (uint)",
  ];

  const routerContract = new ethers.Contract(routerAddress, routerAbi, provider);

  const amountInWei = ethers.utils.parseUnits(amountIn, inputToken.decimals);

  const impact = await routerContract.getPriceImpact(inputToken.address, outputToken.address, amountInWei);

  return Number(impact);
}

export async function getOutputTokenAmount(signer, inputToken, outputToken, amountIn, routerAddress) {
  const config = useRuntimeConfig();

  let provider = signer;

  if (!provider) {
    provider = this.$getFallbackProvider(config.supportedChainId);
  }

  const amountInWei = ethers.utils.parseUnits(amountIn, inputToken.decimals);

  let path = [inputToken.address, outputToken.address];

  const wrappedAddress = wrappedNativeTokens[String(config.supportedChainId)];

  // check if input & output tokens are not native coin or wrapped token
  if (
    inputToken.address !== ethers.constants.AddressZero && 
    inputToken.address !== wrappedAddress && 
    outputToken.address !== ethers.constants.AddressZero &&
    outputToken.address !== wrappedAddress
  ) {
    // if it's not, add wrapped token to the path
    path = [inputToken.address, wrappedAddress, outputToken.address];
  }

  // if input and output tokens are native coin or wrapped token, then return the amountInWei
  if (
    (inputToken.address === ethers.constants.AddressZero || inputToken.address === wrappedAddress) &&
    (outputToken.address === ethers.constants.AddressZero || outputToken.address === wrappedAddress)
  ) {
    return amountInWei;
  }

  // router interface
  const routerAbi = [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  ];

  const routerContract = new ethers.Contract(routerAddress, routerAbi, provider);

  const amounts = await routerContract.getAmountsOut(amountInWei, path);

  return amounts[amounts.length - 1]; // return amount out (the output token amount)
}

export function swapTokens(signer, receiver, inputToken, outputToken, amountIn, amountOutMin, routerAddress, referrer) {
  const config = useRuntimeConfig();
  const siteStore = useSiteStore();
  let provider = signer;

  // get deadline in minutes from the site store
  const deadline = Math.floor(Date.now() / 1000) + 60 * Number(siteStore.getSwapDeadline); // X minutes from the current Unix time

  const wrappedAddress = String(wrappedNativeTokens[String(config.supportedChainId)]).toLowerCase();
  const inputTokenAddress = String(inputToken.address).toLowerCase();
  const outputTokenAddress = String(outputToken.address).toLowerCase();

  // wrapped native coin interface with deposit and withdraw functions
  const wrappedInterface = new ethers.utils.Interface([
    "function deposit() payable",
    "function withdraw(uint wad)"
  ]);

  const wrappedContract = new ethers.Contract(wrappedAddress, wrappedInterface, provider);

  if (inputTokenAddress === ethers.constants.AddressZero && outputTokenAddress === wrappedAddress) {
    // if swapping native coin for wrapped token, use the wrapped token contract to deposit
    return wrappedContract.deposit({ value: amountIn });
  } else if (inputTokenAddress === wrappedAddress && outputTokenAddress === ethers.constants.AddressZero) {
    // if swapping wrapped token for native coin, use the wrapped token contract to withdraw
    return wrappedContract.withdraw(amountIn);
  } else {
    // else if at least one of the tokens is ERC-20 token (but not wrapped native token)
    const routerAbi = [
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function swapExactTokensForTokensWithReferrer(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
      "function swapExactETHForTokensWithReferrer(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
      "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function swapExactTokensForETHWithReferrer(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    ];

    const routerContract = new ethers.Contract(routerAddress, routerAbi, provider);

    // set path
    let path = [inputTokenAddress, outputTokenAddress];

    if (
      inputTokenAddress === ethers.constants.AddressZero &&
      outputTokenAddress !== wrappedAddress &&
      outputTokenAddress !== ethers.constants.AddressZero
    ) {
      // swap the native coin for ERC20 token (which is not wrapped native coin)
      if (referrer === ethers.constants.AddressZero) {
        return routerContract.swapExactETHForTokens(amountOutMin, path, receiver, deadline, { value: amountIn });
      } else {
        return routerContract.swapExactETHForTokensWithReferrer(amountOutMin, path, receiver, deadline, referrer, { value: amountIn });
      }
      
    } else if (
      inputTokenAddress !== ethers.constants.AddressZero && 
      inputTokenAddress !== wrappedAddress &&
      outputTokenAddress === ethers.constants.AddressZero
    ) {
      // swap ERC20 token (which is not wrapped native coin) for native coin
      if (referrer === ethers.constants.AddressZero) {
        return routerContract.swapExactTokensForETH(amountIn, amountOutMin, path, receiver, deadline);
      } else {  
        return routerContract.swapExactTokensForETHWithReferrer(amountIn, amountOutMin, path, receiver, deadline, referrer);
      }
    } else {
      // swap ERC20 token for ERC20 token

      // if none of the tokens is wrapped native coin, add wrapped native coin to the middle of the path
      if (
        inputTokenAddress !== wrappedAddress &&
        outputTokenAddress !== wrappedAddress
      ) {
        path = [inputTokenAddress, wrappedAddress, outputTokenAddress];
      }

      if (referrer === ethers.constants.AddressZero) {
        return routerContract.swapExactTokensForTokens(amountIn, amountOutMin, path, receiver, deadline);
      } else {
        return routerContract.swapExactTokensForTokensWithReferrer(amountIn, amountOutMin, path, receiver, deadline, referrer);
      }
    }
  }
}