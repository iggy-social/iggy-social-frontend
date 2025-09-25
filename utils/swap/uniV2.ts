import { parseUnits, zeroAddress } from 'viem'
import { readData, writeData } from '@/utils/contractUtils'
import wrappedNativeTokens from '@/data/wrappedNativeTokens.json'
import { useSiteSettings } from '@/composables/useSiteSettings'

export async function getPriceImpactBps(
  inputToken: { address: string; decimals: number },
  outputToken: { address: string; decimals: number },
  amountIn: string,
  routerAddress: string
) {
  // router interface
  const routerAbi = [
    {
      name: 'getPriceImpact',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'amountIn', type: 'uint256' }
      ],
      outputs: [{ name: 'impact', type: 'uint256' }]
    }
  ]

  const amountInWei = parseUnits(amountIn, inputToken.decimals)

  const impact = await readData({
    address: routerAddress as `0x${string}`,
    abi: routerAbi,
    functionName: 'getPriceImpact',
    args: [inputToken.address, outputToken.address, BigInt(amountInWei)],
  })
  
  if (!impact) {
    console.warn('Price impact read returned null, returning 0')
    return 0
  }

  return Number(impact)
}

export async function getOutputTokenAmount(
  inputToken: { address: string; decimals: number },
  outputToken: { address: string; decimals: number },
  amountIn: string,
  routerAddress: string
) {
  const runtimeConfig = useRuntimeConfig()

  const amountInWei = parseUnits(amountIn, inputToken.decimals)

  let path = [inputToken.address, outputToken.address]

  const wrappedAddress = wrappedNativeTokens[String(runtimeConfig.public.supportedChainId) as keyof typeof wrappedNativeTokens]

  // check if input & output tokens are not native coin or wrapped token
  if (
    inputToken.address !== zeroAddress &&
    inputToken.address !== wrappedAddress &&
    outputToken.address !== zeroAddress &&
    outputToken.address !== wrappedAddress
  ) {
    // if it's not, add wrapped token to the path
    path = [inputToken.address, wrappedAddress, outputToken.address]
  }

  // if input and output tokens are native coin or wrapped token, then return the amountInWei
  if (
    (inputToken.address === zeroAddress || inputToken.address === wrappedAddress) &&
    (outputToken.address === zeroAddress || outputToken.address === wrappedAddress)
  ) {
    return amountInWei
  }

  // router interface
  const routerAbi = [
    {
      name: 'getAmountsOut',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'amountIn', type: 'uint256' },
        { name: 'path', type: 'address[]' }
      ],
      outputs: [{ name: 'amounts', type: 'uint256[]' }]
    }
  ]

  const amounts = await readData({
    address: routerAddress as `0x${string}`,
    abi: routerAbi,
    functionName: 'getAmountsOut',
    args: [amountInWei, path],
  }) as bigint[]
  
  if (!amounts || amounts.length === 0) {
    console.warn('Output amounts read returned null or empty array, returning 0')
    return BigInt(0)
  }

  return amounts[amounts.length - 1] // return amount out (the output token amount)
}

export async function swapTokens(
  receiver: string,
  inputToken: { address: string; decimals: number },
  outputToken: { address: string; decimals: number },
  amountIn: bigint,
  amountOutMin: bigint,
  routerAddress: string,
  referrer: string
) {
  const runtimeConfig = useRuntimeConfig()
  const { swapDeadline } = useSiteSettings()

  // get deadline in minutes from the site settings
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * Number(swapDeadline.value)) // X minutes from the current Unix time

  const wrappedAddress = String(wrappedNativeTokens[String(runtimeConfig.public.supportedChainId) as keyof typeof wrappedNativeTokens]).toLowerCase()
  const inputTokenAddress = String(inputToken.address).toLowerCase()
  const outputTokenAddress = String(outputToken.address).toLowerCase()

  // wrapped native coin interface with deposit and withdraw functions
  const wrappedAbi = [
    {
      name: 'deposit',
      type: 'function',
      stateMutability: 'payable',
      inputs: [],
      outputs: []
    },
    {
      name: 'withdraw',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'wad', type: 'uint256' }],
      outputs: []
    }
  ]

  if (inputTokenAddress === zeroAddress && outputTokenAddress === wrappedAddress) {
    // if swapping native coin for wrapped token, use the wrapped token contract to deposit
    return writeData({
      address: wrappedAddress as `0x${string}`,
      abi: wrappedAbi,
      functionName: 'deposit',
      value: amountIn,
    })
  } else if (inputTokenAddress === wrappedAddress && outputTokenAddress === zeroAddress) {
    // if swapping wrapped token for native coin, use the wrapped token contract to withdraw
    return writeData({
      address: wrappedAddress as `0x${string}`,
      abi: wrappedAbi,
      functionName: 'withdraw',
      args: [amountIn],
    })
  } else {
    // else if at least one of the tokens is ERC-20 token (but not wrapped native token)
    const routerAbi = [
      {
        name: 'swapExactTokensForTokens',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMin', type: 'uint256' },
          { name: 'path', type: 'address[]' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' }
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      },
      {
        name: 'swapExactTokensForTokensWithReferrer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMin', type: 'uint256' },
          { name: 'path', type: 'address[]' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'referrer', type: 'address' }
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      },
      {
        name: 'swapExactETHForTokens',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
          { name: 'amountOutMin', type: 'uint256' },
          { name: 'path', type: 'address[]' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' }
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      },
      {
        name: 'swapExactETHForTokensWithReferrer',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
          { name: 'amountOutMin', type: 'uint256' },
          { name: 'path', type: 'address[]' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'referrer', type: 'address' }
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      },
      {
        name: 'swapExactTokensForETH',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMin', type: 'uint256' },
          { name: 'path', type: 'address[]' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' }
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      },
      {
        name: 'swapExactTokensForETHWithReferrer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMin', type: 'uint256' },
          { name: 'path', type: 'address[]' },
          { name: 'to', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'referrer', type: 'address' }
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }]
      }
    ]

    // set path
    let path = [inputTokenAddress, outputTokenAddress]

    if (
      inputTokenAddress === zeroAddress &&
      outputTokenAddress !== wrappedAddress &&
      outputTokenAddress !== zeroAddress
    ) {
      // swap the native coin for ERC20 token (which is not wrapped native coin)
      if (referrer === zeroAddress) {
        return writeData({
          address: routerAddress as `0x${string}`,
          abi: routerAbi,
          functionName: 'swapExactETHForTokens',
          args: [amountOutMin, path, receiver, deadline],
          value: amountIn,
        })
      } else {
        return writeData({
          address: routerAddress as `0x${string}`,
          abi: routerAbi,
          functionName: 'swapExactETHForTokensWithReferrer',
          args: [amountOutMin, path, receiver, deadline, referrer],
          value: amountIn,
        })
      }
    } else if (
      inputTokenAddress !== zeroAddress &&
      inputTokenAddress !== wrappedAddress &&
      outputTokenAddress === zeroAddress
    ) {
      // swap ERC20 token (which is not wrapped native coin) for native coin
      if (referrer === zeroAddress) {
        return writeData({
          address: routerAddress as `0x${string}`,
          abi: routerAbi,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, amountOutMin, path, receiver, deadline],
        })
      } else {
        return writeData({
          address: routerAddress as `0x${string}`,
          abi: routerAbi,
          functionName: 'swapExactTokensForETHWithReferrer',
          args: [amountIn, amountOutMin, path, receiver, deadline, referrer],
        })
      }
    } else {
      // swap ERC20 token for ERC20 token

      // if none of the tokens is wrapped native coin, add wrapped native coin to the middle of the path
      if (inputTokenAddress !== wrappedAddress && outputTokenAddress !== wrappedAddress) {
        path = [inputTokenAddress, wrappedAddress, outputTokenAddress]
      }

      if (referrer === zeroAddress) {
        return writeData({
          address: routerAddress as `0x${string}`,
          abi: routerAbi,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, amountOutMin, path, receiver, deadline],
        })
      } else {
        return writeData({
          address: routerAddress as `0x${string}`,
          abi: routerAbi,
          functionName: 'swapExactTokensForTokensWithReferrer',
          args: [amountIn, amountOutMin, path, receiver, deadline, referrer],
        })
      }
    }
  }
}
