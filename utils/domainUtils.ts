import { useRuntimeConfig } from 'nuxt/app'
import { fetchUsername, storeUsername } from './browserStorageUtils'
import { readData } from './contractUtils'

// TLD contract ABI for the functions we need
const tldAbi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'defaultNames',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'domainName', type: 'string' }],
    name: 'getDomainHolder',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export interface DomainValidationResult {
  invalid: boolean
  message: string | null
}

export function validateDomainName(domainName: string | null): DomainValidationResult {
  if (domainName === '' || domainName === null) {
    return { invalid: true, message: null }
  }
  
  if (domainName.includes('.')) {
    return { invalid: true, message: 'Dots not allowed' }
  }
  
  if (domainName.includes(' ')) {
    return { invalid: true, message: 'Spaces not allowed' }
  }
  
  if (domainName.includes('%')) {
    return { invalid: true, message: '% not allowed' }
  }
  
  if (domainName.includes('&')) {
    return { invalid: true, message: '& not allowed' }
  }
  
  if (domainName.includes('?')) {
    return { invalid: true, message: '? not allowed' }
  }
  
  if (domainName.includes('#')) {
    return { invalid: true, message: '# not allowed' }
  }
  
  if (domainName.includes('/')) {
    return { invalid: true, message: '/ not allowed' }
  }
  
  if (domainName.includes(',')) {
    return { invalid: true, message: 'Comma not allowed' }
  }
  
  // Check for various invisible/control characters
  const invalidCharacters = [
    '\\', '­', '	', '͏', '؜', '܏', 'ᅟ', 'ᅠ', ' ', '឴', '឵', '᠎',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '​',
    '‌', '‍', '‎', '‏', ' ', ' ', '⁠', '⁡', '⁢', '⁣', '⁤', '⁪',
    '⁫', '⁬', '⁭', '⁮', '⁯', '　', '⠀', 'ㅤ', 'ﾠ', '𑂱', '𛲠',
    '𛲡', '𛲢', '𛲣', '𝅙', '𝅳', '𝅴', '𝅵', '𝅶', '𝅷', '𝅸',
    '𝅹', '𝅺', '', '', ''
  ]
  
  for (const char of invalidCharacters) {
    if (domainName.includes(char)) {
      return { invalid: true, message: 'This character is not allowed' }
    }
  }

  return { invalid: false, message: 'Domain name is valid' }
}

export async function getDomainName(userAddress: string, window: Window | null = null) {
  const runtimeConfig = useRuntimeConfig()

  try {
    // First, try to get the domain name from browser storage
    if (window) {
      const storedUsername = fetchUsername(window, userAddress)
      if (storedUsername) {
        return storedUsername
      }
    }

    // If not in storage, fetch from blockchain
    const result = await readData({
      address: runtimeConfig.public.punkTldAddress as `0x${string}`,
      abi: tldAbi,
      functionName: 'defaultNames',
      args: [userAddress as `0x${string}`]
    })

    if (!result) {
      return null
    }

    const fullName = result + runtimeConfig.public.tldName

    // If we got a result, store it in browser storage
    if (result && typeof result === 'string' && window) {
      storeUsername(window, userAddress, fullName)
    }

    return fullName
  } catch (error) {
    console.error('Error getting domain name:', error)
    return null
  }
}

export async function getDomainHolder(domainName: string) {
  const runtimeConfig = useRuntimeConfig()

  try {
    // Remove TLD suffix if present
    if (domainName.includes(runtimeConfig.public.tldName)) {
      domainName = domainName.replace(runtimeConfig.public.tldName, '')
    }

    const result = await readData({
      address: runtimeConfig.public.punkTldAddress as `0x${string}`,
      abi: tldAbi,
      functionName: 'getDomainHolder',
      args: [domainName]
    })

    if (!result) {
      console.warn('Domain holder read returned null')
      return null
    }

    return result
  } catch (error) {
    console.error('Error getting domain holder:', error)
    return null
  }
}
