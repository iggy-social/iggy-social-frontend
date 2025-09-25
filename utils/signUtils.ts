import { signMessage, signTypedData } from '@wagmi/core'
import { config } from '@/wagmi'

export async function signMessageAsync(message: string) {
  try {
    const signature = await signMessage(config, { message })
    return signature
  } catch (error) {
    console.error('Message signing failed:', error)
    throw new Error('Message signing failed')
  }
}

export async function signTypedDataAsync(payload: {
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