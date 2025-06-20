<template>
  <div class="flex w-1/4 flex-col space-y-4 bg-gray-200 p-4">
    <h2 class="mb-4 text-xl font-semibold">工具欄</h2>

    <!-- 節點新增區域 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-700">新增節點</h3>
      <Button
        label="新增問句節點"
        icon="pi pi-plus"
        class="p-button-sm w-full"
        @click="$emit('add-question-node')"
      />
      <Button
        label="新增選項節點"
        icon="pi pi-plus"
        class="p-button-sm p-button-secondary w-full"
        @click="$emit('add-option-node')"
      />
    </div>

    <!-- 分隔線 -->
    <hr class="border-gray-300" />

    <!-- 檔案操作區域 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-700">檔案操作</h3>
      <Button
        label="匯出流程"
        icon="pi pi-download"
        class="p-button-sm w-full"
        @click="$emit('export-flow')"
      />
      <Button
        label="匯入流程"
        icon="pi pi-upload"
        class="p-button-sm w-full"
        @click="$emit('import-flow')"
      />
    </div>

    <!-- 分隔線 -->
    <hr class="border-gray-300" />

    <!-- 測試操作區域 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-700">測試流程</h3>
      <Button
        label="測試流程"
        icon="pi pi-play"
        class="p-button-sm p-button-success w-full"
        @click="$emit('go-to-simulator')"
      />
    </div>

    <!-- 分隔線 -->
    <hr class="border-gray-300" />

    <!-- 危險操作區域 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-red-700">危險操作</h3>
      <Button
        label="清空全部"
        icon="pi pi-trash"
        class="p-button-sm p-button-danger w-full"
        @click="$emit('clear-all-nodes')"
      />
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button'

defineEmits([
  'add-question-node',
  'add-option-node',
  'export-flow',
  'import-flow',
  'go-to-simulator',
  'clear-all-nodes',
])
</script>
