import type { Node, Edge, XYPosition } from '@vue-flow/core'

// 代表節點在畫布上的位置
export interface NodePosition {
  x: number
  y: number
}

// 基礎節點介面，包含所有節點共有的屬性
export interface BaseNode {
  id: string // 節點的唯一標識符
  text: string // 節點顯示的文字內容 (問句內容或選項文字)
  position: XYPosition // 節點在畫布上的位置 (供 Vue Flow 使用)
}

// 問句節點定義
export interface QuestionNode extends BaseNode {
  type: 'question' // 節點類型，用於區分不同節點
}

// 單個選項的定義 (用於 OptionNode)
export interface Option {
  id: string // 選項的唯一標識符
  text: string // 選項顯示的文字
  nextQuestionId?: string | null // 此選項指向的下一個問題節點的 ID，可選
}

// 選項節點定義
export interface OptionNode extends BaseNode {
  type: 'option' // 節點類型
  options: Option[] // 此選項節點包含的選項列表
}

// 我們的流程圖中節點的聯合類型
export type FlowNode = QuestionNode | OptionNode

// 連線 (邊) 定義 - 使用 Vue Flow 的 Edge 型別作為基礎
export interface FlowEdge
  extends Pick<
    Edge,
    'id' | 'source' | 'target' | 'sourceHandle' | 'targetHandle'
  > {
  // 使用 Vue Flow 的標準欄位名稱
  // id: string - 由 Pick 提供
  // source: string - 由 Pick 提供 (連線起點節點的 ID)
  // target: string - 由 Pick 提供 (連線終點節點的 ID)
  // sourceHandle?: string - 由 Pick 提供 (Vue Flow 特定的源句柄)
  // targetHandle?: string - 由 Pick 提供 (Vue Flow 特定的目標句柄)
}

// 完整的流程圖資料結構
export interface FlowData {
  nodes: FlowNode[] // 包含所有節點的陣列
  edges: FlowEdge[] // 包含所有連線的陣列
  version?: string // 版本號 (用於未來擴充)
  metadata?: object // 其他元資料 (用於未來擴充)
}

// @deprecated - 為了向後兼容而保留的型別別名
export type NodePosition = XYPosition
