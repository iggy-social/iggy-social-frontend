import { parseEther } from 'viem'
import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/wagmi'

export async function sendNativeCoin(to: string, amountEth: string) {
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

export async function waitForTxReceipt(hash: `0x${string}`) {
  const receipt = await waitForTransactionReceipt(config, { hash })
  return receipt
}