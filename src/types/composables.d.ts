/** Composables 相關型別定義 */

import type { Ref } from 'vue'

import type { FlowEdge, FlowNode, Option } from './flow.d'
import type { ConversationItem } from './vue-components.d'

// useNodeSelection 回傳型別
export interface UseNodeSelectionReturn {
  selectedNode: Ref<FlowNode | null>
  selectedEdge: Ref<FlowEdge | null>
  editableNodeText: Ref<string>
  editableOptionMainText: Ref<string>
  newOptionText: Ref<string>
  handleNodeClick: (event: { node: { id: string; data?: any } }) => void
  handleEdgeClick: (event: { edge: FlowEdge }) => void
  clearSelection: () => void
}

// useNodeOperations 回傳型別
export interface UseNodeOperationsReturn {
  addNewQuestionNode: () => void
  addNewOptionNode: () => void
  handleDeleteNode: (
    selectedNode: Ref<FlowNode | null>,
    clearSelectionCallback: () => void,
  ) => void
  handleDeleteEdge: (
    selectedEdge: Ref<FlowEdge | null>,
    clearSelectionCallback: () => void,
  ) => void
  saveNodeChanges: (
    selectedNode: Ref<FlowNode | null>,
    editableNodeText: Ref<string>,
    editableOptionMainText: Ref<string>,
  ) => void
  handleAddNewOption: (
    selectedNode: Ref<FlowNode | null>,
    newOptionText: Ref<string>,
  ) => void
  clearAllNodes: (clearSelectionCallback: () => void) => void
  handleConnect: (params: any) => void
  handleNodesChange: (changes: any[]) => void
}

// useFileOperations 回傳型別
export interface UseFileOperationsReturn {
  exportFlow: () => void
  importFlow: (clearSelectionCallback: () => void) => void
}

// useKeyboardEvents 參數型別
export type KeyboardEventCallback = () => void

// useSimulator 回傳型別
export interface UseSimulatorReturn {
  currentNodeId: Ref<string | null>
  isStarted: Ref<boolean>
  isCompleted: Ref<boolean>
  conversationHistory: Ref<ConversationItem[]>
  errorMessage: Ref<string>
  currentNode: Ref<FlowNode | null>
  startNode: Ref<FlowNode | null>
  hasFlowData: Ref<boolean>
  startSimulation: () => void
  restartSimulation: () => void
  selectOption: (option: Option) => void
  completeSimulation: (message: string) => void
  getCurrentOptions: () => Option[]
  initializeSimulator: () => void
}

// useFlowStats 回傳型別
export interface UseFlowStatsReturn {
  questionNodesCount: Ref<number>
  optionNodesCount: Ref<number>
  edgesCount: Ref<number>
  totalNodesCount: Ref<number>
  flowStats: Ref<{
    questionNodes: number
    optionNodes: number
    edges: number
    totalNodes: number
  }>
}
