import { computed, ref } from 'vue'

import { useFlowStore } from '@/stores/flow'

export function useSimulator() {
  const flowStore = useFlowStore()

  // 模擬器狀態
  const currentNodeId = ref(null)
  const isStarted = ref(false)
  const isCompleted = ref(false)
  const conversationHistory = ref([])
  const errorMessage = ref('')

  // 計算屬性
  const currentNode = computed(() => {
    if (!currentNodeId.value) return null
    return flowStore.nodes.find((node) => node.id === currentNodeId.value)
  })

  const startNode = computed(() => {
    // 尋找開始節點（沒有任何邊指向它的問句節點）
    const questionNodes = flowStore.nodes.filter(
      (node) => node.type === 'question',
    )
    return questionNodes.find((node) => {
      return !flowStore.edges.some((edge) => edge.targetId === node.id)
    })
  })

  const hasFlowData = computed(() => {
    return flowStore.nodes.length > 0
  })

  // 開始模擬
  function startSimulation() {
    if (!startNode.value) {
      errorMessage.value =
        '找不到開始節點，請確保有至少一個問句節點且沒有被其他節點指向。'
      return
    }

    currentNodeId.value = startNode.value.id
    isStarted.value = true
    isCompleted.value = false
    conversationHistory.value = []
    errorMessage.value = ''

    // 添加開始節點到對話歷史
    addToHistory('question', startNode.value.text)
  }

  // 重新開始
  function restartSimulation() {
    currentNodeId.value = null
    isStarted.value = false
    isCompleted.value = false
    conversationHistory.value = []
    errorMessage.value = ''
  }

  // 選擇選項
  function selectOption(option) {
    if (!option) return

    // 添加選擇的選項到對話歷史
    addToHistory('answer', option.text)

    // 如果選項有下一個問題
    if (option.nextQuestionId) {
      const nextNode = flowStore.nodes.find(
        (node) => node.id === option.nextQuestionId,
      )
      if (nextNode) {
        currentNodeId.value = nextNode.id
        addToHistory('question', nextNode.text)
      } else {
        // 下一個節點不存在，結束流程
        completeSimulation('找不到下一個問題節點')
      }
    } else {
      // 沒有下一個問題，結束流程
      completeSimulation('流程已完成')
    }
  }

  // 完成模擬
  function completeSimulation(message) {
    isCompleted.value = true
    addToHistory('result', message)
  }

  // 添加到對話歷史
  function addToHistory(type, text) {
    conversationHistory.value.push({
      type, // 'question', 'answer', 'result'
      text,
      timestamp: new Date().toLocaleTimeString(),
    })
  }

  // 找到當前問題對應的選項節點
  function getCurrentOptions() {
    if (!currentNode.value || currentNode.value.type !== 'question') return []

    // 找到從當前問句節點出發的邊
    const outgoingEdges = flowStore.edges.filter(
      (edge) => edge.sourceId === currentNodeId.value,
    )

    if (outgoingEdges.length === 0) return []

    // 取第一個邊對應的選項節點（通常問句節點只會連接到一個選項節點）
    const optionNodeId = outgoingEdges[0].targetId
    const optionNode = flowStore.nodes.find((node) => node.id === optionNodeId)

    // Type guard: 確保是選項節點才存取 options 屬性
    if (optionNode && optionNode.type === 'option') {
      return optionNode.options || []
    }

    return []
  }

  // 初始化檢查
  function initializeSimulator() {
    if (!hasFlowData.value) {
      errorMessage.value = '尚未建立任何流程，請先回到編輯器建立問答流程。'
    }
  }

  return {
    // 狀態
    currentNodeId,
    isStarted,
    isCompleted,
    conversationHistory,
    errorMessage,

    // 計算屬性
    currentNode,
    startNode,
    hasFlowData,

    // 方法
    startSimulation,
    restartSimulation,
    selectOption,
    completeSimulation,
    getCurrentOptions,
    initializeSimulator,
  }
}
