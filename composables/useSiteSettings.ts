import { useLocalStorage } from '@vueuse/core'

export function useSiteSettings() {
  const arweaveBalance = useState('arweaveBalance', () => 0)
  const colorMode = useLocalStorage('colorMode', 'dark')
  const fileUploadEnabled = useState('fileUploadEnabled', () => true)
  const slippage = useLocalStorage('swapSlippage', '0.5')
  const swapDeadline = useLocalStorage('swapDeadline', '20')

  function setArweaveBalance(balance: number) {
    arweaveBalance.value = balance
  }

  function setColorMode(cm: string) {
    colorMode.value = cm
  }

  function setFileUploadEnabled(enabled: boolean) {
    fileUploadEnabled.value = enabled
  }

  function setSlippage(value: string) {
    slippage.value = value
  }

  function setSwapDeadline(value: string) {
    swapDeadline.value = value
  }

  // Get slippage as integer in basis points (e.g., 0.5% = 50 bps)
  function getSlippageBps(): number {
    const slippageValue = Number(slippage.value) || 0
    return Math.floor(slippageValue * 100)
  }

  return {
    arweaveBalance,
    colorMode,
    fileUploadEnabled,
    slippage,
    swapDeadline,

    setArweaveBalance,
    setColorMode,
    setFileUploadEnabled,
    setSlippage,
    setSwapDeadline,
    getSlippageBps,
  }
}
