<script setup>
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()

const isHomePage = computed(() => route.name === 'home')
const isSimulatorPage = computed(() => route.name === 'simulator')

function goToEditor() {
  router.push('/')
}

function goToSimulator() {
  router.push('/simulator')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 頂部導航欄 -->
    <nav class="border-b border-gray-200 bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">QA Builder</h1>
            <span class="ml-2 text-sm text-gray-500">決策樹問答系統產生器</span>
          </div>

          <div class="flex items-center space-x-4">
            <Button
              label="流程編輯器"
              icon="pi pi-pencil"
              :class="isHomePage ? 'p-button-info' : 'p-button-outlined'"
              class="p-button-sm"
              @click="goToEditor"
            />
            <Button
              label="流程模擬器"
              icon="pi pi-play"
              :class="
                isSimulatorPage ? 'p-button-success' : 'p-button-outlined'
              "
              class="p-button-sm"
              @click="goToSimulator"
            />
          </div>
        </div>
      </div>
    </nav>

    <!-- 頁面內容 -->
    <RouterView />
  </div>
</template>

<style scoped></style>
