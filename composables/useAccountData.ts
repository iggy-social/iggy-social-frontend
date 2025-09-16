// composables/useAccountData.ts
import { formatEther, formatUnits } from 'viem'
import { computed } from 'vue'
import { getAccount, switchChain, watchAccount } from '@wagmi/core'
import {
  useAccount,
  useBalance,
  useConfig,
  useDisconnect,
  useConnect
} from '@wagmi/vue'
import { useWeb3 } from '@/composables/useWeb3'

export function useAccountData() {

  // VARIABLES
  
  // library variables and functions
  const { address, isConnected, isConnecting, status } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const { connectors, error: connectError, status: connectStatus } = useConnect()
  const { environment } = useWeb3()

  const { disconnect } = useDisconnect({
    mutation: {
      onSuccess() {
        if (environment.value !== 'farcaster') {
          // needed to prevent wagmi's bug which sometimes happens ("ConnectorAlreadyConnectedError")
          window.location.reload()
        }
      },
    }
  })

  const { connect } = useConnect({
    mutation: {
      onSuccess: (data, variables) => {
        console.log('Connection successful!')
      },
      onError: (error) => {
        console.error('Connection failed:', error)
        if (environment.value !== 'farcaster') {
          // needed to prevent wagmi's bug which sometimes happens ("ConnectorAlreadyConnectedError")
          disconnect()
          window.location.reload()
        }
      }
    }
  })

  const config = useConfig()
  
  // state variables
  const activityPoints = useState<number | null>('activityPoints', () => null)
  const chatTokenBalanceWei = useState<bigint | null>('chatTokenBalanceWei', () => null)
  const currentChainId = useState<number | null>('currentChainId', () => null)
  const domainName = useState<string>('domainName', () => '')
  const isCurrentChainSupported = useState<boolean>('isCurrentChainSupported', () => false)

  // GETTERS

  // Function to get formatted balance in ETH
  function getBalanceEth(): number | null {
    const currentBalanceWei = getBalanceWei()
    if (currentBalanceWei) {
      const balanceEth = formatEther(currentBalanceWei)
      return Number.parseFloat(Number(balanceEth).toFixed(8))
    }
    return null
  }

  // Function to get current balance in wei
  function getBalanceWei(): bigint {
    if (!balanceData.value) return BigInt(0)
    return BigInt(balanceData.value.value)
  }

  function getChatTokenBalanceWei(): bigint {
    if (!chatTokenBalanceWei.value) return BigInt(0)
    return chatTokenBalanceWei.value
  }

  function getChatTokenBalance(): number {
    if (!chatTokenBalanceWei.value) return 0
    return Number(formatUnits(chatTokenBalanceWei.value, 18))
  }

  // Function to get current chain ID
  function getCurrentChainId(): number | null {
    return currentChainId.value
  }

  // Function to get domain name
  function getCurrentDomainName(): string {
    return domainName.value
  }

  function getCurrentChainName(): string {
    const chainId = getCurrentChainId()
    return chainId ? getNetworkName(chainId) : 'Unknown network'
  }

  // Function to get activity points
  function getCurentUserActivityPoints(): number | null {
    return activityPoints.value
  }

  // Function to get current user's address
  function getCurrentUserAddress(): string | null {
    return address.value || null
  }

  // Function to get network name from chain ID
  function getNetworkName(networkId: number): string {
    const supportedChains = config.chains.map((chain) => ({
      chainId: chain.id,
      networkName: chain.name,
    }))
    const network = supportedChains.find((chain) => chain.chainId === Number(networkId))
    return network ? network.networkName : 'Unsupported network'
  }

  function getSupportedChainData(): any {
    return config.chains[0]
  }

  // SETTERS
  function addToChatTokenBalanceWei(balance: bigint) {
    if (!chatTokenBalanceWei.value) {
      chatTokenBalanceWei.value = BigInt(0)
    }
    chatTokenBalanceWei.value += balance
  }

  async function fetchCurrentChainId() {
    const account = await getAccount(config)
    currentChainId.value = account.chainId ?? null
    isCurrentChainSupported.value = account.chainId === config.chains[0].id
  }

  function setChatTokenBalanceWei(balance: bigint) {
    chatTokenBalanceWei.value = balance
  }

  function setCurrentUserActivityPoints(points: number): void {
    activityPoints.value = points
  }

  function setDomainName(domain: string): void {
    domainName.value = domain
  }

  // UTILS

  // Function to shorten address
  function shortenAddress(address: string | null | undefined, chars = 4): string {
    if (!address || typeof address !== 'string') return ''
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
  }

  // Function to switch to a different network
  async function switchToNetwork(targetChainId: number): Promise<void> {
    try {
      await switchChain(config, { chainId: targetChainId as any })
    } catch (error) {
      console.error('Failed to switch network:', error)
      throw new Error('Network switching failed')
    }
  }

  // WATCHERS
  const unwatch = watchAccount(config, {
    onChange() {
      fetchCurrentChainId()
    },
  })

  // UNMOUNTED
  onUnmounted(() => {
    unwatch?.()
  })

  return {
    // Core properties
    address: computed(() => getCurrentUserAddress()),
    addressShort: computed(() => shortenAddress(getCurrentUserAddress() || '')),
    balanceEth: computed(() => getBalanceEth()),
    balanceWei: computed(() => getBalanceWei()),
    chainId: computed(() => getCurrentChainId()),
    connectionStatus: computed(() => status.value),
    currentChainName: computed(() => getCurrentChainName()),
    isActivated: computed(() => isConnected.value),
    isConnecting: computed(() => isConnecting.value),
    isCurrentChainSupported: computed(() => isCurrentChainSupported.value),

    // Enhanced computed properties
    networkName: computed(() => getCurrentChainName()),
    
    domainName: computed(() => getCurrentDomainName()),

    // Connect properties
    connectors,
    connectError,
    connectStatus,

    // Methods
    addToChatTokenBalanceWei,
    connect,
    disconnect,
    switchToNetwork,
    getChatTokenBalanceWei,
    getChatTokenBalance,
    getCurrentChainId,
    getCurentUserActivityPoints,
    getCurrentUserAddress,
    getSupportedChainData,
    shortenAddress,
    getNetworkName,
    getBalanceEth,
    setChatTokenBalanceWei,
    getCurrentDomainName,
    setCurrentUserActivityPoints,
    setDomainName,
  }
} 