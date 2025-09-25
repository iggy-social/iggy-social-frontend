import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/wagmi'

export async function readData(contractConfig: any) {
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

export async function writeData(contractConfig: any) {
  try {
    // Write the transaction and get hash immediately
    const hash = await writeContract(config, contractConfig)
    
    return hash
  } catch (error) {
    console.error('Contract write and wait error:', error)
    throw error
  }
}