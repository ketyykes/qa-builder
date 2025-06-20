/** Vue Flow 相關型別定義 */

import type { Position } from '@vue-flow/core'

import type { NodePosition, Option } from './flow.d'

// Vue Flow 節點型別
export interface VueFlowNode {
  id: string
  type: string
  position: NodePosition
  data: VueFlowNodeData
  label?: string
  sourcePosition?: Position
  targetPosition?: Position
}

// Vue Flow 節點資料型別
export interface VueFlowNodeData {
  text: string
  nodeType: 'question' | 'option'
  options?: Option[]
  sourceHandles?: VueFlowHandle[]
}

// Vue Flow 連線手柄型別
export interface VueFlowHandle {
  id: string
  type: 'source' | 'target'
  position: Position
}

// Vue Flow 邊型別
export interface VueFlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

// Vue Flow 元素集合型別
export interface VueFlowElements {
  nodes: VueFlowNode[]
  edges: VueFlowEdge[]
}

// Vue Flow 連線參數型別
export interface VueFlowConnectParams {
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

// Vue Flow 節點變更型別
export interface VueFlowNodeChange {
  id: string
  type: 'position' | 'remove' | 'add' | 'select' | 'dimensions'
  position?: NodePosition
  selected?: boolean
}
