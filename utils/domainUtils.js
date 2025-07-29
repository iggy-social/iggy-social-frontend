import { ethers } from 'ethers'

export async function getDomainName(userAddress, signer) {
  const config = useRuntimeConfig()

  let provider = signer

  const tldInterface = new ethers.utils.Interface(['function defaultNames(address) view returns (string)'])

  const contract = new ethers.Contract(config.public.punkTldAddress, tldInterface, provider)

  // get user's default domain
  const userDomain = await contract.defaultNames(userAddress)

  return userDomain
}

export async function getDomainHolder(domainName, signer) {
  const config = useRuntimeConfig()

  let provider = signer

  if (domainName.includes(config.public.tldName)) {
    domainName = domainName.replace(config.public.tldName, '')
  }

  const tldInterface = new ethers.utils.Interface([
    'function getDomainHolder(string memory) public view returns(address)',
  ])

  const contract = new ethers.Contract(config.public.punkTldAddress, tldInterface, provider)

  // get user's default domain
  const userAddress = await contract.getDomainHolder(domainName)

  return userAddress
}
