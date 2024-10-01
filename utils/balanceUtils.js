import Arweave from 'arweave'
import { ethers } from 'ethers'
import Erc20Abi from '~/assets/abi/Erc20Abi.json'

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

export async function getActivityPoints(userAddress, signer) {
  const config = useRuntimeConfig()

  let provider = signer

  const activityPointsInterface = new ethers.utils.Interface([
    'function getPoints(address user_) external view returns (uint256)',
  ])

  const activityPointsContract = new ethers.Contract(config.activityPointsAddress, activityPointsInterface, provider)

  const pointsWei = await activityPointsContract.getPoints(userAddress)

  let activityPoints = Number(ethers.utils.formatEther(pointsWei))

  if (activityPoints < 1) {
    activityPoints = activityPoints.toFixed(2)
  } else {
    activityPoints = Number.parseFloat(activityPoints)
  }

  return activityPoints
}

export async function getArweaveBalance(arweaveAddress) {
  const balance = await arweave.wallets.getBalance(arweaveAddress)
  return arweave.ar.winstonToAr(balance)
}

export async function getTokenAllowance(token, userAddress, beneficiary, signer) {
  let provider = signer

  const contract = new ethers.Contract(token.address, Erc20Abi, provider)
  const allowanceWei = await contract.allowance(userAddress, beneficiary)

  return ethers.utils.formatUnits(allowanceWei, token.decimals)
}

export async function getTokenBalance(token, userAddress, signer) {
  let provider = signer

  let balanceWei

  if (token.address === ethers.constants.AddressZero) {
    if (!signer) {
      balanceWei = await provider.getBalance(userAddress)
    } else {
      balanceWei = await signer.getBalance()
    }
  } else {
    const contract = new ethers.Contract(token.address, Erc20Abi, provider)
    balanceWei = await contract.balanceOf(userAddress)
  }

  return ethers.utils.formatUnits(balanceWei, token.decimals)
}
