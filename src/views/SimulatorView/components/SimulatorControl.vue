<template>
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
          @click="$emit('start-simulation')"
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
              v-for="option in currentOptions"
              :key="option.id"
              :label="option.text"
              class="p-button-outlined w-full"
              @click="$emit('select-option', option)"
            />
          </div>

          <!-- 如果沒有選項，顯示結束訊息 -->
          <div v-if="currentOptions.length === 0" class="text-center">
            <p class="mb-4 text-gray-600">這是流程的結束點。</p>
            <Button
              label="完成"
              icon="pi pi-check"
              class="p-button-success"
              @click="$emit('complete-simulation', '流程已完成')"
            />
          </div>
        </div>

        <hr class="my-4" />

        <Button
          label="重新開始"
          icon="pi pi-refresh"
          class="p-button-secondary w-full"
          @click="$emit('restart-simulation')"
        />
      </div>

      <!-- 已完成 -->
      <div v-else class="text-center">
        <div class="mb-6">
          <i class="pi pi-check-circle mb-4 text-6xl text-green-500"></i>
          <h3 class="mb-2 text-xl font-semibold text-green-600">模擬已完成</h3>
          <p class="text-gray-600">您已完成整個問答流程。</p>
        </div>

        <div class="space-y-3">
          <Button
            label="重新開始"
            icon="pi pi-refresh"
            class="p-button-success w-full"
            @click="$emit('restart-simulation')"
          />
          <Button
            label="修改流程"
            icon="pi pi-pencil"
            class="p-button-outlined w-full"
            @click="$emit('go-to-editor')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'

/** @import {QuestionNode, Option} from '@/types/flow' */

defineProps({
  isStarted: {
    type: Boolean,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    required: true,
  },
  currentNode: {
    /** @type {import('vue').PropType<QuestionNode | null>} */
    type: Object,
    default: null,
  },
  currentOptions: {
    /** @type {import('vue').PropType<Option[]>} */
    type: Array,
    required: true,
  },
})

defineEmits([
  'start-simulation',
  'restart-simulation',
  'select-option',
  'complete-simulation',
  'go-to-editor',
])
</script>
