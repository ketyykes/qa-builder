<template>
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
</template>

<script setup>
import Card from 'primevue/card'

defineProps({
  conversationHistory: {
    type: Array,
    required: true,
  },
})
</script>
