// composables/useWeb3.ts
import { computed } from 'vue'
import {
  readContract,
  writeContract,
  sendTransaction,
  signMessage,
  signTypedData,
  getBalance,
  waitForTransactionReceipt,
} from '@wagmi/core'
import { config } from '../wagmi'
import { parseEther, formatEther } from 'viem'

export function useWeb3() {
  // Environment state using Nuxt's useState
  const environment = useState<'standard' | 'farcaster'>('web3Environment', () => 'standard')

  async function getNativeCoinBalanceWei(address: string): Promise<bigint> {
    try {
      const balance = await getBalance(config, { address: address as `0x${string}` })
      return balance.value
    } catch (error) {
      console.error('Get native coin balance error:', error)
      throw error
    }
  }

  async function getNativeCoinBalanceEth(address: string): Promise<string> {
    try {
      const balanceWei = await getNativeCoinBalanceWei(address)
      return formatEther(balanceWei)
    } catch (error) {
      console.error('Get native coin balance in ETH error:', error)
      throw error
    }
  }

  async function readData(contractConfig: any) {
    try {
      const result = await readContract(config, contractConfig)
      return result
    } catch (error: any) {
      // Check if this is the expected "owner index out of bounds" error
      // This happens when calling tokenOfOwnerByIndex on an address that doesn't own any NFTs
      if (error?.message?.includes('owner index out of bounds') || 
          error?.message?.includes('ERC721Enumerable: owner index out of bounds')) {
        // This is an expected error, don't log it
        return null
      }
      
      // For other errors, log them as usual
      console.error('Contract read error:', error)
      
      // Log more details about the contract call that failed
      console.error('Failed contract call details:', {
        address: contractConfig.address,
        functionName: contractConfig.functionName,
        args: contractConfig.args,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorName: error?.name
      })
      
      // Check for specific common errors and provide helpful messages
      if (error?.message?.includes('execution reverted')) {
        console.error('Contract execution reverted - this usually means the function call failed on-chain')
      } else if (error?.message?.includes('network')) {
        console.error('Network error - check your RPC connection')
      } else if (error?.message?.includes('timeout')) {
        console.error('Request timeout - the blockchain might be slow')
      }
      
      return null
    }
  }

  async function sendNativeCoin(to: string, amountEth: string) {
    try {
      // Send the transaction and get hash immediately
      const hash = await sendTransaction(config, {
        to: to as `0x${string}`,
        value: parseEther(amountEth),
      })
      
      return hash
    } catch (error) {
      console.error('Send native coin and wait error:', error)
      throw error
    }
  }

  function setEnvironment(env: 'standard' | 'farcaster') {
    environment.value = env
  }

  async function signMessageAsync(message: string) {
    try {
      const signature = await signMessage(config, { message })
      return signature
    } catch (error) {
      console.error('Message signing failed:', error)
      throw new Error('Message signing failed')
    }
  }

  async function signTypedDataAsync(payload: {
    domain: any
    types: any
    primaryType: string
    message: any
  }) {
    try {
      const signature = await signTypedData(config, {
        domain: payload.domain,
        types: payload.types,
        primaryType: payload.primaryType,
        message: payload.message
      })
      return signature
    } catch (error) {
      console.error('Typed data signing failed:', error)
      throw new Error('Typed data signing failed')
    }
  }

  async function waitForTxReceipt(hash: `0x${string}`) {
    const receipt = await waitForTransactionReceipt(config, { hash })
    return receipt
  }

  async function writeData(contractConfig: any) {
    try {
      // Write the transaction and get hash immediately
      const hash = await writeContract(config, contractConfig)
      
      return hash
    } catch (error) {
      console.error('Contract write and wait error:', error)
      throw error
    }
  }

  return {
    // Environment
    environment: computed(() => environment.value),
    setEnvironment,
    
    // Web3-specific methods
    readData,
    getNativeCoinBalanceWei,
    getNativeCoinBalanceEth,
    sendNativeCoin,
    signMessageAsync,
    signTypedDataAsync,
    waitForTxReceipt,
    writeData,
  }
}
