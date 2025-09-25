// utils/addressUtils.ts

/**
 * Shortens an Ethereum address for display purposes
 * @param address - The address to shorten
 * @param chars - Number of characters to show at the beginning and end (default: 4)
 * @returns Shortened address string or empty string if invalid input
 */
export function shortenAddress(address: string | null | undefined, chars = 4): string {
  if (!address || typeof address !== 'string') return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Checks if a string is a valid Ethereum address format
 * @param address - The string to validate
 * @returns True if the string looks like a valid Ethereum address
 */
export function isValidAddressFormat(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Converts an address to a checksummed format (EIP-55)
 * @param address - The address to checksum
 * @returns Checksummed address or original if invalid
 */
export function toChecksumAddress(address: string): string {
  if (!isValidAddressFormat(address)) return address
  
  const addressLower = address.toLowerCase()
  const hash = addressLower.slice(2)
  
  let checksum = '0x'
  for (let i = 0; i < hash.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      checksum += hash[i].toUpperCase()
    } else {
      checksum += hash[i]
    }
  }
  
  return checksum
}
