import { getBalance } from '@wagmi/core'
import Arweave from 'arweave'
import { formatEther, formatUnits, getAddress, zeroAddress } from 'viem'
import Erc20Abi from '@/data/abi/Erc20Abi.json'
import { config } from '@/wagmi'
import { readData } from '@/utils/contractUtils'

// Types
interface Token {
  address: string
  decimals: number
}

interface ActivityPointsContractConfig {
  address: `0x${string}`
  abi: any
  functionName: string
  args: [string]
}

interface Erc20ContractConfig<T extends readonly unknown[] = readonly [string]> {
  address: `0x${string}`
  abi: any
  functionName: string
  args: T
}

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

export async function getActivityPoints(userAddress: string): Promise<number> {
  const runtimeConfig = useRuntimeConfig()

  const activityPointsContractConfig: ActivityPointsContractConfig = {
    address: runtimeConfig.public.activityPointsAddress as `0x${string}`,
    abi: [
      {
        constant: true,
        inputs: [{ name: 'user_', type: 'address' }],
        name: 'getPoints',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'getPoints',
    args: [userAddress]
  }

  let activityPoints = 0;

  try {
    const pointsWei = await readData(activityPointsContractConfig)
    
    // Handle case where user has no activity points (returns 0 or null)
    if (pointsWei === null || pointsWei === undefined) {
      activityPoints = 0
    } else {
      activityPoints = Number(formatUnits(pointsWei as bigint, 18))

      if (activityPoints < 1) {
        activityPoints = Number(activityPoints.toFixed(2))
      } else {
        activityPoints = Number.parseFloat(activityPoints.toString())
      }
    }
  } catch (error) {
    console.error('Error fetching activity points:', error)
    // Set to 0 if there's an error, but don't throw
    activityPoints = 0
  }

  return activityPoints
}

export async function getArweaveBalance(arweaveAddress: string): Promise<string> {
  const balance = await arweave.wallets.getBalance(arweaveAddress)
  return arweave.ar.winstonToAr(balance)
}

export async function getNativeTokenBalanceWei(address: string): Promise<bigint> {
  const balance = await getBalance(config, { address: address as `0x${string}` })
  return balance.value
}

export async function getNativeCoinBalanceEth(address: string): Promise<string> {
  const balance = await getNativeTokenBalanceWei(address)
  return formatEther(balance)
}

export async function getTokenAllowance(
  token: Token, 
  userAddress: string, 
  beneficiary: string
): Promise<string> {

  const contractConfig: Erc20ContractConfig<readonly [string, string]> = {
    address: getAddress(token.address) as `0x${string}`,
    abi: Erc20Abi,
    functionName: 'allowance',
    args: [userAddress, beneficiary]
  }

  const allowanceWei = await readData(contractConfig)
  
  if (!allowanceWei) {
    console.warn(`Token allowance read returned ${allowanceWei}. This is why we are returning 0.`)
    return '0'
  }

  return formatUnits(allowanceWei as bigint, token.decimals)
}

export async function getTokenBalance(
  token: Token, 
  userAddress: string
): Promise<string> {
  // For native token, use a direct approach
  if (getAddress(token.address) === zeroAddress) {
    return await getNativeCoinBalanceEth(userAddress)
  }
  
  // For ERC-20 tokens, use the existing logic
  const balanceWei = await getTokenBalanceWei(token, userAddress)
  return formatUnits(balanceWei, token.decimals)
}

export async function getTokenBalanceWei(
  token: Token, 
  userAddress: string
): Promise<bigint> {
  if (getAddress(token.address) === zeroAddress) {
    // For native token (ETH), use the dedicated function
    return await getNativeTokenBalanceWei(userAddress)
  } else {
    // First, try to check if the contract exists and has the required function
    const contractConfig: Erc20ContractConfig<readonly [string]> = {
      address: getAddress(token.address) as `0x${string}`,
      abi: Erc20Abi,
      functionName: 'balanceOf',
      args: [userAddress]
    }

    try {
      const result = await readData(contractConfig)
      if (!result) {
        //console.warn('Token balance read returned null, returning 0')
        return BigInt(0)
      }
      const balanceWei = result as bigint
      return balanceWei
    } catch (error) {
      console.error('Error fetching token balance:', error)
      // Log more details about the error for debugging
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error details:', error.message)
      }
      // Also log the contract address and user address for debugging
      console.error('Contract address:', contractConfig.address)
      console.error('User address:', userAddress)
      
      // Check if this is a contract revert error (which usually means the contract exists but the call failed)
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && error.message.includes('ContractFunctionExecutionError')) {
        console.warn('Contract function reverted - this usually means the user has 0 balance or the contract has restrictions')
      }
      
      return BigInt(0)
    }
  }
}
