<template>
  <Card>
    <template #title>
      <i class="pi pi-info mr-2"></i>
      流程資訊
    </template>
    <template #content>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ flowStats.questionNodes }}
          </div>
          <div class="text-sm text-gray-600">問句節點</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {{ flowStats.optionNodes }}
          </div>
          <div class="text-sm text-gray-600">選項節點</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">
            {{ flowStats.edges }}
          </div>
          <div class="text-sm text-gray-600">連線數量</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'

defineProps({
  flowStats: {
    type: Object,
    required: true,
  },
})
</script>
