<script setup>
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const nodeText = props.data?.text || ''
</script>

<template>
  <div
    class="question-node min-w-48 rounded-lg border-2 border-green-300 bg-green-100 p-4"
  >
    <!-- 問句內容 -->
    <div class="font-semibold text-green-800">{{ nodeText }}</div>

    <!-- 目標手柄（用於接收連線） -->
    <Handle type="target" :position="Position.Left" class="target-handle" />

    <!-- 源手柄（用於發出連線，問句也可以連到其他問句） -->
    <Handle type="source" :position="Position.Right" class="source-handle" />
  </div>
</template>

<style scoped>
.question-node {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.target-handle {
  left: -8px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border: 2px solid white;
}

.source-handle {
  right: -8px;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border: 2px solid white;
}
</style>
