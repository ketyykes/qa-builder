import { useToast } from 'primevue/usetoast'

import { useFlowStore } from '../../../stores/flow'

export function useFileOperations() {
  const flowStore = useFlowStore()
  const toast = useToast()

  function exportFlow() {
    try {
      // 檢查是否有內容可以匯出
      if (flowStore.nodes.length === 0) {
        toast.add({
          severity: 'warn',
          summary: '無法匯出',
          detail: '目前沒有任何節點，無法匯出流程。請先建立一些節點。',
          life: 5000,
        })
        return
      }

      const jsonData = flowStore.exportNodeGraph()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      // 生成更有意義的檔案名稱
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
      const nodeCount = flowStore.nodes.length
      const fileName = `qa-flow-${nodeCount}nodes-${dateStr}-${timeStr}.json`

      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      // 顯示成功訊息
      const stats = `包含 ${flowStore.nodes.length} 個節點和 ${flowStore.edges.length} 個連線`
      console.log('Flow exported successfully:', fileName)
      toast.add({
        severity: 'success',
        summary: '匯出成功',
        detail: `檔案名稱：${fileName}\n內容：${stats}`,
        life: 6000,
      })
    } catch (error) {
      console.error('Failed to export flow:', error)
      toast.add({
        severity: 'error',
        summary: '匯出失敗',
        detail: `${error.message}，請稍後再試或檢查瀏覽器控制台了解詳細錯誤。`,
        life: 8000,
      })
    }
  }

  /** @param {() => void} clearSelectionCallback */
  function importFlow(clearSelectionCallback) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (event) => {
      // Type guard: 確保 event.target 是 HTMLInputElement
      if (!(event.target instanceof HTMLInputElement) || !event.target.files) {
        toast.add({
          severity: 'error',
          summary: '檔案選擇錯誤',
          detail: '無法取得選擇的檔案，請重試。',
          life: 5000,
        })
        return
      }

      const file = event.target.files[0]
      if (!file) return

      // 檢查檔案大小（限制為 10MB）
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.add({
          severity: 'error',
          summary: '檔案太大',
          detail: '請選擇小於 10MB 的檔案。',
          life: 5000,
        })
        return
      }

      // 檢查檔案類型
      if (!file.name.toLowerCase().endsWith('.json')) {
        toast.add({
          severity: 'error',
          summary: '檔案格式錯誤',
          detail: '請選擇 JSON 格式的檔案。',
          life: 5000,
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonString = e.target.result

          // 顯示載入中訊息
          console.log('開始匯入流程檔案：', file.name)

          // Type guard: 確保 jsonString 是 string 型別
          if (typeof jsonString !== 'string') {
            toast.add({
              severity: 'error',
              summary: '檔案讀取錯誤',
              detail: '檔案內容格式異常，無法解析為文字格式。',
              life: 5000,
            })
            return
          }

          const success = flowStore.importNodeGraph(jsonString)

          if (success) {
            // 清除選擇狀態
            clearSelectionCallback()

            // 顯示詳細的成功訊息
            const nodeCount = flowStore.nodes.length
            const edgeCount = flowStore.edges.length
            const questionNodes = flowStore.nodes.filter(
              (n) => n.type === 'question',
            ).length
            const optionNodes = flowStore.nodes.filter(
              (n) => n.type === 'option',
            ).length

            console.log('Flow imported successfully:', {
              fileName: file.name,
              nodeCount,
              edgeCount,
              questionNodes,
              optionNodes,
            })

            toast.add({
              severity: 'success',
              summary: '匯入成功',
              detail: `檔案名稱：${file.name}\n匯入 ${nodeCount} 個節點（${questionNodes} 個問句，${optionNodes} 個選項）和 ${edgeCount} 個連線`,
              life: 8000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: '匯入失敗',
              detail: `JSON 格式不正確或檔案內容無效。請確認檔案是由 QA Builder 匯出的有效 JSON 格式。`,
              life: 8000,
            })
          }
        } catch (error) {
          console.error('Failed to import flow:', error)
          toast.add({
            severity: 'error',
            summary: '匯入失敗',
            detail: `檔案解析錯誤：${error.message}。請檢查檔案是否完整且格式正確。`,
            life: 8000,
          })
        }
      }

      reader.onerror = () => {
        toast.add({
          severity: 'error',
          summary: '檔案讀取失敗',
          detail: `無法讀取檔案 ${file.name}`,
          life: 5000,
        })
      }

      reader.readAsText(file, 'UTF-8')
    }

    input.click()
  }

  return {
    exportFlow,
    importFlow,
  }
}
