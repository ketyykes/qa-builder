<script setup>
import { computed } from 'vue'

import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

// 使用 computed 讓資料響應式地更新
const options = computed(() => props.data?.options || [])
const nodeText = computed(() => props.data?.text || '新選項節點')
</script>

<template>
  <div
    class="option-node min-w-48 rounded-lg border-2 border-blue-300 bg-blue-100 p-3"
  >
    <!-- 節點標題 -->
    <div class="mb-2 font-semibold text-blue-800">{{ nodeText }}</div>

    <!-- 選項列表 -->
    <div v-if="options.length > 0" class="space-y-1">
      <div
        v-for="option in options"
        :key="option.id"
        class="relative flex items-center rounded border border-blue-200 bg-white px-2 py-1 text-sm"
      >
        <span class="flex-1">{{ option.text }}</span>
        <!-- 每個選項的連線手柄 -->
        <Handle
          :id="option.id"
          type="source"
          :position="Position.Right"
          class="option-handle"
        />
      </div>
    </div>

    <!-- 沒有選項時的提示 -->
    <div v-else class="text-sm italic text-gray-500">尚無選項</div>

    <!-- 目標手柄（用於接收連線） -->
    <Handle type="target" :position="Position.Left" class="target-handle" />
  </div>
</template>

<style scoped>
.option-node {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.option-handle {
  right: -8px;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border: 2px solid white;
}

.target-handle {
  left: -8px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border: 2px solid white;
}
</style>
