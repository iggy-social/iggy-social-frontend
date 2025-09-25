import { formatUnits } from 'viem'
import { computed } from 'vue'

export function useAccountData() {
  const activityPoints = useState<number | null>('activityPoints', () => null)
  const chatTokenBalanceWei = useState<bigint | null>('chatTokenBalanceWei', () => null)
  const domainName = useState<string>('domainName', () => '')

  // GETTERS

  function getChatTokenBalanceWei(): bigint {
    if (!chatTokenBalanceWei.value) return BigInt(0)
    return chatTokenBalanceWei.value
  }

  function getChatTokenBalance(): number {
    if (!chatTokenBalanceWei.value) return 0
    return Number(formatUnits(chatTokenBalanceWei.value, 18))
  }

  // Function to get domain name
  function getCurrentDomainName(): string {
    return domainName.value
  }

  // Function to get activity points
  function getCurentUserActivityPoints(): number | null {
    return activityPoints.value
  }

  // SETTERS
  function addToChatTokenBalanceWei(balance: bigint) {
    if (!chatTokenBalanceWei.value) {
      chatTokenBalanceWei.value = BigInt(0)
    }
    chatTokenBalanceWei.value += balance
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

  return {
    // Core properties
    domainName: computed(() => getCurrentDomainName()),

    // getters
    getChatTokenBalanceWei,
    getChatTokenBalance,
    getCurrentDomainName,
    getCurentUserActivityPoints,

    // setters
    addToChatTokenBalanceWei,
    setChatTokenBalanceWei,
    setCurrentUserActivityPoints,
    setDomainName,
  }
} 