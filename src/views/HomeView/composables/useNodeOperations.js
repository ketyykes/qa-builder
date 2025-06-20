// @ts-check
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useFlowStore } from '../../../stores/flow'

/** @import {UseNodeOperationsReturn} from '@/types/composables.d' */

/**
 * 節點操作功能的 composable
 *
 * @type {() => UseNodeOperationsReturn}
 */
export function useNodeOperations() {
  const flowStore = useFlowStore()
  const confirm = useConfirm()
  const toast = useToast()

  /**
   * 新增問句節點
   *
   * @type {() => void}
   */
  function addNewQuestionNode() {
    flowStore.addNode({
      type: 'question',
      text: '新問題節點',
      position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 },
    })
  }

  /**
   * 新增選項節點
   *
   * @type {() => void}
   */
  function addNewOptionNode() {
    flowStore.addNode({
      type: 'option',
      text: '新選項節點',
      position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 },
    })
  }

  /**
   * 處理刪除節點
   *
   * @type {(
   *   selectedNode: import('vue').Ref<
   *     import('@/types/flow.d').FlowNode | null
   *   >,
   *   clearSelectionCallback: () => void,
   * ) => void}
   */
  function handleDeleteNode(selectedNode, clearSelectionCallback) {
    if (selectedNode.value) {
      const nodeId = selectedNode.value.id
      const nodeText = selectedNode.value.text

      confirm.require({
        message: `確定要刪除節點「${nodeText}」嗎？此操作無法復原。`,
        header: '刪除節點確認',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: '確定刪除',
        rejectLabel: '取消',
        accept: () => {
          flowStore.deleteNode({ nodeId })
          clearSelectionCallback()
        },
        reject: () => {
          // 使用者取消，不執行任何動作
        },
      })
    }
  }

  /**
   * 處理刪除邊
   *
   * @type {(
   *   selectedEdge: import('vue').Ref<
   *     import('@/types/flow.d').FlowEdge | null
   *   >,
   *   clearSelectionCallback: () => void,
   * ) => void}
   */
  function handleDeleteEdge(selectedEdge, clearSelectionCallback) {
    if (selectedEdge.value) {
      const edgeId = selectedEdge.value.id
      confirm.require({
        message: '確定要刪除此連線嗎？此操作無法復原。',
        header: '刪除連線確認',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: '確定刪除',
        rejectLabel: '取消',
        accept: () => {
          flowStore.removeEdge({ edgeId })
          clearSelectionCallback()
        },
        reject: () => {
          // 使用者取消，不執行任何動作
        },
      })
    }
  }

  /**
   * 儲存節點變更
   *
   * @type {(
   *   selectedNode: import('vue').Ref<
   *     import('@/types/flow.d').FlowNode | null
   *   >,
   *   editableNodeText: import('vue').Ref<string>,
   *   editableOptionMainText: import('vue').Ref<string>,
   * ) => void}
   */
  function saveNodeChanges(
    selectedNode,
    editableNodeText,
    editableOptionMainText,
  ) {
    if (selectedNode.value) {
      const nodeToUpdate = selectedNode.value

      if (nodeToUpdate.type === 'question') {
        flowStore.updateNodeText({
          nodeId: nodeToUpdate.id,
          newText: editableNodeText.value,
        })
      } else if (nodeToUpdate.type === 'option') {
        flowStore.updateNodeText({
          nodeId: nodeToUpdate.id,
          newText: editableOptionMainText.value,
        })

        if (nodeToUpdate.options && Array.isArray(nodeToUpdate.options)) {
          nodeToUpdate.options.forEach((option) => {
            if (option.id && typeof option.text === 'string') {
              flowStore.updateOptionText({
                nodeId: nodeToUpdate.id,
                optionId: option.id,
                newText: option.text,
              })
            }
          })
        }
      }
    }
  }

  /**
   * 處理新增選項功能
   *
   * @type {(
   *   selectedNode: import('vue').Ref<
   *     import('@/types/flow.d').FlowNode | null
   *   >,
   *   newOptionText: import('vue').Ref<string>,
   * ) => void}
   */
  function handleAddNewOption(selectedNode, newOptionText) {
    if (
      selectedNode.value &&
      selectedNode.value.type === 'option' &&
      newOptionText.value.trim() !== ''
    ) {
      flowStore.addOptionToNode({
        nodeId: selectedNode.value.id,
        optionText: newOptionText.value.trim(),
      })
      newOptionText.value = ''
    } else if (newOptionText.value.trim() === '') {
      toast.add({
        severity: 'warn',
        summary: '輸入錯誤',
        detail: '新選項文字不可為空。',
        life: 3000,
      })
    } else if (!selectedNode.value || selectedNode.value.type !== 'option') {
      toast.add({
        severity: 'warn',
        summary: '選擇錯誤',
        detail: '請先選取一個選項節點。',
        life: 3000,
      })
    }
  }

  /**
   * 清空所有節點
   *
   * @type {(clearSelectionCallback: () => void) => void}
   */
  function clearAllNodes(clearSelectionCallback) {
    confirm.require({
      message: '確定要清空所有節點和連線嗎？此操作無法復原。',
      header: '清空全部確認',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定清空',
      rejectLabel: '取消',
      accept: () => {
        flowStore.clearAll()
        clearSelectionCallback()
        console.log('All nodes and edges cleared')
      },
      reject: () => {
        // 使用者取消，不執行任何動作
      },
    })
  }

  /**
   * 處理連線
   *
   * @type {(params: any) => void}
   */
  function handleConnect(params) {
    flowStore.onConnect(params)
  }

  /**
   * 處理節點變更
   *
   * @type {(changes: any[]) => void}
   */
  function handleNodesChange(changes) {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        flowStore.updateNodePosition({
          nodeId: change.id,
          position: change.position,
        })
      }
    })
  }

  return {
    addNewQuestionNode,
    addNewOptionNode,
    handleDeleteNode,
    handleDeleteEdge,
    saveNodeChanges,
    handleAddNewOption,
    clearAllNodes,
    handleConnect,
    handleNodesChange,
  }
}
