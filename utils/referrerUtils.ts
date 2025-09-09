import { isAddress, zeroAddress } from 'viem'
import { getDomainHolder } from './domainUtils'
import { storeReferrer } from './browserStorageUtils'
import { useRuntimeConfig } from 'nuxt/app'

export async function parseReferrer(
  referrer: string,
  userAddress?: string,
  window?: Window | null
): Promise<string | null> {
  const config = useRuntimeConfig()
  let referrerAddr = referrer

  // Check if referrer is a domain name
  if (!referrer.startsWith('0x')) {
    let domainName = referrer

    if (referrer.includes(config.public.tldName)) {
      // Get the domain name without extension
      domainName = referrer.split('.')[0]
    }

    // Fetch the domain holder address
    try {
      const domainHolder = await getDomainHolder(domainName)
      if (domainHolder) {
        referrerAddr = domainHolder as string
      } else {
        return null // Invalid domain or no holder found
      }
    } catch (error) {
      console.error('Error getting domain holder:', error)
      return null
    }
  }

  // Check if user is trying to refer themselves
  if (userAddress) {
    if (String(userAddress).toLowerCase() === String(referrerAddr).toLowerCase()) {
      return null // Cannot refer yourself
    }
  }

  // Check if referrer is a valid address and not a zero address
  if (isAddress(referrerAddr) && referrerAddr !== zeroAddress) {
    // Store into local storage as referrer
    if (window) {
      storeReferrer(window, referrerAddr)
    }
    return referrerAddr
  }

  return null
}
