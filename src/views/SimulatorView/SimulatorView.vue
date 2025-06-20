<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import Button from 'primevue/button'
import Message from 'primevue/message'

import ConversationHistory from './components/ConversationHistory.vue'
import EmptyState from './components/EmptyState.vue'
import FlowStats from './components/FlowStats.vue'
import SimulatorControl from './components/SimulatorControl.vue'
import { useFlowStats } from './composables/useFlowStats'
import { useSimulator } from './composables/useSimulator'

const router = useRouter()

// 使用 composables
const {
  isStarted,
  isCompleted,
  conversationHistory,
  errorMessage,
  currentNode,
  hasFlowData,
  startSimulation,
  restartSimulation,
  selectOption,
  completeSimulation,
  getCurrentOptions,
  initializeSimulator,
} = useSimulator()

const { flowStats } = useFlowStats()

// 初始化
onMounted(() => {
  initializeSimulator()
})

// 導航函式
function goToEditor() {
  router.push('/')
}

// 事件處理函式
function handleStartSimulation() {
  startSimulation()
}

function handleRestartSimulation() {
  restartSimulation()
}

function handleSelectOption(option) {
  selectOption(option)
}

function handleCompleteSimulation(message) {
  completeSimulation(message)
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
      <EmptyState
        v-if="!hasFlowData && !errorMessage"
        @go-to-editor="goToEditor"
      />

      <!-- 模擬器主要內容 -->
      <div
        v-if="hasFlowData && !errorMessage"
        class="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <!-- 左側：對話歷史 -->
        <ConversationHistory :conversation-history="conversationHistory" />

        <!-- 右側：模擬器控制 -->
        <SimulatorControl
          :is-started="isStarted"
          :is-completed="isCompleted"
          :current-node="currentNode"
          :current-options="getCurrentOptions()"
          @start-simulation="handleStartSimulation"
          @restart-simulation="handleRestartSimulation"
          @select-option="handleSelectOption"
          @complete-simulation="handleCompleteSimulation"
          @go-to-editor="goToEditor"
        />
      </div>

      <!-- 流程資訊 -->
      <FlowStats
        v-if="hasFlowData && !errorMessage"
        :flow-stats="flowStats"
        class="mt-6"
      />
    </div>
  </div>
</template>

<style scoped>
/* 自定義樣式 */
.pi {
  display: inline-block;
}
</style>
