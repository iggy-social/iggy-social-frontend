export function useSidebars() {
  const leftSidebar = useState('leftSidebar', () => false)
  const mainContent = useState('mainContent', () => true)
  const rightSidebar = useState('rightSidebar', () => false)

  function setLeftSidebar(status: boolean) {
    leftSidebar.value = status
  }

  function setMainContent(status: boolean) {
    mainContent.value = status
  }

  function setRightSidebar(status: boolean) {
    rightSidebar.value = status
  }

  return {
    // state
    leftSidebar,
    mainContent,
    rightSidebar,

    // "getters"
    showLeftSidebar: leftSidebar,
    showMainContent: mainContent,
    showRightSidebar: rightSidebar,

    // actions
    setLeftSidebar,
    setMainContent,
    setRightSidebar,
  }
}
