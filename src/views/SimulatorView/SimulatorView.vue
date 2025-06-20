<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'

import { useFlowStore } from '@/stores/flow'

const router = useRouter()
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

// 初始化函式
onMounted(() => {
  if (!hasFlowData.value) {
    errorMessage.value = '尚未建立任何流程，請先回到編輯器建立問答流程。'
  }
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

// 回到編輯器
function goToEditor() {
  router.push('/')
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
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="mx-auto max-w-4xl">
      <!-- 標題列 -->
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-800">問答流程模擬器</h1>
        <Button
          label="回到編輯器"
          icon="pi pi-arrow-left"
          class="p-button-outlined"
          @click="goToEditor"
        />
      </div>

      <!-- 錯誤訊息 -->
      <Message v-if="errorMessage" severity="error" class="mb-6">
        {{ errorMessage }}
      </Message>

      <!-- 無流程資料時的提示 -->
      <Card v-if="!hasFlowData && !errorMessage" class="mb-6">
        <template #title>
          <i class="pi pi-info-circle mr-2"></i>
          尚未建立流程
        </template>
        <template #content>
          <p class="mb-4 text-gray-600">
            您尚未建立任何問答流程。請先回到編輯器建立節點和連線。
          </p>
          <Button label="前往編輯器" icon="pi pi-pencil" @click="goToEditor" />
        </template>
      </Card>

      <!-- 模擬器主要內容 -->
      <div
        v-if="hasFlowData && !errorMessage"
        class="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <!-- 左側：對話歷史 -->
        <Card>
          <template #title>
            <i class="pi pi-comments mr-2"></i>
            對話歷史
          </template>
          <template #content>
            <div
              v-if="conversationHistory.length === 0"
              class="py-8 text-center text-gray-500"
            >
              <i class="pi pi-play-circle mb-4 text-4xl"></i>
              <p>點擊「開始模擬」來開始問答流程</p>
            </div>

            <div v-else class="max-h-96 space-y-4 overflow-y-auto">
              <div
                v-for="(item, index) in conversationHistory"
                :key="index"
                class="flex"
                :class="{
                  'justify-start': item.type === 'question',
                  'justify-end': item.type === 'answer',
                  'justify-center': item.type === 'result',
                }"
              >
                <div
                  class="max-w-xs rounded-lg px-4 py-2"
                  :class="{
                    'bg-blue-100 text-blue-800': item.type === 'question',
                    'bg-green-100 text-green-800': item.type === 'answer',
                    'bg-gray-100 text-gray-800': item.type === 'result',
                  }"
                >
                  <p class="text-sm">{{ item.text }}</p>
                  <p class="mt-1 text-xs opacity-70">{{ item.timestamp }}</p>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 右側：當前狀態和控制 -->
        <Card>
          <template #title>
            <i class="pi pi-cog mr-2"></i>
            模擬控制
          </template>
          <template #content>
            <!-- 尚未開始 -->
            <div v-if="!isStarted" class="text-center">
              <div class="mb-6">
                <i class="pi pi-play mb-4 text-6xl text-blue-500"></i>
                <h3 class="mb-2 text-xl font-semibold">準備開始模擬</h3>
                <p class="mb-4 text-gray-600">
                  模擬器將從第一個問題開始，引導您完成整個問答流程。
                </p>
              </div>
              <Button
                label="開始模擬"
                icon="pi pi-play"
                class="p-button-success"
                size="large"
                @click="startSimulation"
              />
            </div>

            <!-- 進行中 -->
            <div v-else-if="!isCompleted">
              <div class="mb-6">
                <h3 class="mb-4 text-lg font-semibold text-blue-600">
                  {{ currentNode?.text }}
                </h3>

                <!-- 選項列表 -->
                <div class="space-y-3">
                  <Button
                    v-for="option in getCurrentOptions()"
                    :key="option.id"
                    :label="option.text"
                    class="p-button-outlined w-full"
                    @click="selectOption(option)"
                  />
                </div>

                <!-- 如果沒有選項，顯示結束訊息 -->
                <div
                  v-if="getCurrentOptions().length === 0"
                  class="text-center"
                >
                  <p class="mb-4 text-gray-600">這是流程的結束點。</p>
                  <Button
                    label="完成"
                    icon="pi pi-check"
                    class="p-button-success"
                    @click="completeSimulation('流程已完成')"
                  />
                </div>
              </div>

              <hr class="my-4" />

              <Button
                label="重新開始"
                icon="pi pi-refresh"
                class="p-button-secondary w-full"
                @click="restartSimulation"
              />
            </div>

            <!-- 已完成 -->
            <div v-else class="text-center">
              <div class="mb-6">
                <i class="pi pi-check-circle mb-4 text-6xl text-green-500"></i>
                <h3 class="mb-2 text-xl font-semibold text-green-600">
                  模擬已完成
                </h3>
                <p class="text-gray-600">您已完成整個問答流程。</p>
              </div>

              <div class="space-y-3">
                <Button
                  label="重新開始"
                  icon="pi pi-refresh"
                  class="p-button-success w-full"
                  @click="restartSimulation"
                />
                <Button
                  label="修改流程"
                  icon="pi pi-pencil"
                  class="p-button-outlined w-full"
                  @click="goToEditor"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- 流程資訊 -->
      <Card v-if="hasFlowData && !errorMessage" class="mt-6">
        <template #title>
          <i class="pi pi-info mr-2"></i>
          流程資訊
        </template>
        <template #content>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{
                  flowStore.nodes.filter((n) => n.type === 'question').length
                }}
              </div>
              <div class="text-sm text-gray-600">問句節點</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ flowStore.nodes.filter((n) => n.type === 'option').length }}
              </div>
              <div class="text-sm text-gray-600">選項節點</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">
                {{ flowStore.edges.length }}
              </div>
              <div class="text-sm text-gray-600">連線數量</div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* 自定義樣式 */
.pi {
  display: inline-block;
}
</style>
