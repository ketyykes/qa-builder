<template>
  <Card class="mb-6">
    <template #title>
      <i class="pi pi-info-circle mr-2"></i>
      尚未建立流程
    </template>
    <template #content>
      <p class="mb-4 text-gray-600">
        您尚未建立任何問答流程。請先回到編輯器建立節點和連線。
      </p>
      <Button
        label="前往編輯器"
        icon="pi pi-pencil"
        @click="$emit('go-to-editor')"
      />
    </template>
  </Card>
</template>

<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'

defineEmits(['go-to-editor'])
</script>
