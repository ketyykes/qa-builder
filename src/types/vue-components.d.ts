/** Vue 組件 Props 和 Emits 型別定義 */

import type { FlowEdge, FlowNode, Option } from './flow.d'

// PropertiesPanel 組件的 Props 型別
export interface PropertiesPanelProps {
  selectedNode: FlowNode | null
  selectedEdge: FlowEdge | null
  editableNodeText: string
  editableOptionMainText: string
  newOptionText: string
}

// PropertiesPanel 組件的 Emits 型別
export interface PropertiesPanelEmits {
  'update:editableNodeText': [value: string]
  'update:editableOptionMainText': [value: string]
  'update:newOptionText': [value: string]
  'save-node-changes': []
  'delete-node': []
  'delete-edge': []
  'add-new-option': []
}

// ToolbarSection 組件的 Emits 型別
export interface ToolbarSectionEmits {
  'add-question-node': []
  'add-option-node': []
  'export-flow': []
  'import-flow': []
  'go-to-simulator': []
  'clear-all-nodes': []
}

// SimulatorControl 組件的 Props 型別
export interface SimulatorControlProps {
  isStarted: boolean
  isCompleted: boolean
  currentNode: FlowNode | null
  currentOptions: Option[]
}

// SimulatorControl 組件的 Emits 型別
export interface SimulatorControlEmits {
  'start-simulation': []
  'restart-simulation': []
  'select-option': [option: Option]
  'complete-simulation': [message: string]
  'go-to-editor': []
}

// FlowStats 組件的 Props 型別
export interface FlowStatsProps {
  flowStats: {
    questionNodes: number
    optionNodes: number
    edges: number
    totalNodes: number
  }
}

// ConversationHistory 項目型別
export interface ConversationItem {
  type: 'question' | 'answer' | 'result'
  text: string
  timestamp: string
}

// ConversationHistory 組件的 Props 型別
export interface ConversationHistoryProps {
  conversationHistory: ConversationItem[]
}

// EmptyState 組件的 Emits 型別
export interface EmptyStateEmits {
  'go-to-editor': []
}

// OptionNode 組件的 Props 型別
export interface OptionNodeProps {
  data: {
    text: string
    nodeType: 'option'
    options: Option[]
    sourceHandles?: Array<{
      id: string
      type: 'source'
      position: import('@vue-flow/core').Position
    }>
  }
}

// QuestionNode 組件的 Props 型別
export interface QuestionNodeProps {
  data: {
    text: string
    nodeType: 'question'
  }
}
