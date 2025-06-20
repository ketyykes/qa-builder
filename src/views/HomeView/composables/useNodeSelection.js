import { ref, watch } from 'vue'

import { useFlowStore } from '../../../stores/flow'

/** @import {UseNodeSelectionReturn} from '@/types/composables.d' */

/**
 * 節點選擇功能的 composable
 *
 * @type {() => UseNodeSelectionReturn}
 */
export function useNodeSelection() {
  const flowStore = useFlowStore()
  const selectedNode = ref(null)
  const selectedEdge = ref(null)
  const editableNodeText = ref('')
  const editableOptionMainText = ref('')
  const newOptionText = ref('')

  // 監聽節點選擇變化
  watch(selectedNode, (currentNode) => {
    if (currentNode) {
      const storeNode = flowStore.nodes.find((n) => n.id === currentNode.id)
      if (storeNode) {
        editableNodeText.value = storeNode.text
        if (storeNode.type === 'option') {
          editableOptionMainText.value = storeNode.text
          newOptionText.value = ''
        }
      } else {
        editableNodeText.value = currentNode.data?.text || ''
        editableOptionMainText.value = ''
        newOptionText.value = ''
        console.warn(
          'Selected node was not found in Pinia store during watch. Displaying VueFlow data.',
        )
      }
    } else {
      editableNodeText.value = ''
      editableOptionMainText.value = ''
      newOptionText.value = ''
    }
  })

  /**
   * 處理節點點擊事件
   *
   * @type {(event: { node: { id: string; data?: any } }) => void}
   */
  function handleNodeClick(event) {
    const storeNode = flowStore.nodes.find((n) => n.id === event.node.id)
    if (storeNode) {
      selectedNode.value = storeNode
      selectedEdge.value = null
    } else {
      selectedNode.value = null
      console.error(
        `Critical: Clicked node with ID ${event.node.id} not found in Pinia store.`,
      )
    }
  }

  /**
   * 處理邊點擊事件
   *
   * @type {(event: { edge: import('@/types/flow.d').FlowEdge }) => void}
   */
  function handleEdgeClick(event) {
    selectedEdge.value = event.edge
    selectedNode.value = null
  }

  /**
   * 清除選擇狀態
   *
   * @type {() => void}
   */
  function clearSelection() {
    selectedNode.value = null
    selectedEdge.value = null
  }

  return {
    selectedNode,
    selectedEdge,
    editableNodeText,
    editableOptionMainText,
    newOptionText,
    handleNodeClick,
    handleEdgeClick,
    clearSelection,
  }
}
