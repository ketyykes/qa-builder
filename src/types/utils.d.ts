/** 工具函式相關型別定義 */

import type { FlowData } from './flow.d'
import type { VueFlowElements } from './vue-flow.d'

// 流程轉換函式參數型別
export type TransformToVueFlowElementsFunction = (
  flowData: FlowData,
) => VueFlowElements

// 匯入報告型別
export interface ImportReport {
  imported: {
    nodes: number
    edges: number
  }
  skipped: {
    nodes: number
    edges: number
  }
}

// 檔案操作錯誤型別
export interface FileOperationError {
  type: 'file_size' | 'file_type' | 'parse_error' | 'validation_error'
  message: string
  details?: string
}

// Toast 訊息型別
export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error'
  summary: string
  detail: string
  life?: number
}

// 確認對話框選項型別
export interface ConfirmDialogOptions {
  message: string
  header: string
  icon: string
  acceptLabel: string
  rejectLabel: string
  accept: () => void
  reject?: () => void
}
