import { onMounted, onUnmounted } from 'vue'

export function useKeyboardEvents(deleteNodeCallback, deleteEdgeCallback) {
  function handleKeyDown(event) {
    if (event.key === 'Delete') {
      deleteNodeCallback()
      deleteEdgeCallback()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown,
  }
}
