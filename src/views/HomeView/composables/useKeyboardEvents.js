// @ts-check
import { onMounted, onUnmounted } from 'vue'

/** @import {KeyboardEventCallback} from '@/types/composables.d' */

/**
 * 處理鍵盤事件的 composable
 *
 * @type {(
 *   onDeleteNode: KeyboardEventCallback,
 *   onDeleteEdge: KeyboardEventCallback,
 * ) => void}
 */
export function useKeyboardEvents(onDeleteNode, onDeleteEdge) {
  /** @type {(event: KeyboardEvent) => void} */
  function handleKeydown(event) {
    // 如果焦點在輸入框中，忽略鍵盤快捷鍵
    const target = event.target
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    ) {
      return
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      if (event.shiftKey) {
        // Shift + Delete: 刪除邊
        onDeleteEdge()
      } else {
        // Delete: 刪除節點
        onDeleteNode()
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}
