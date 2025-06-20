<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { VueFlow } from '@vue-flow/core'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import OptionNode from '../../components/OptionNode.vue'
import QuestionNode from '../../components/QuestionNode.vue'
import { useFlowStore } from '../../stores/flow'

const router = useRouter()
const flowStore = useFlowStore()
const confirm = useConfirm()
const toast = useToast()

const selectedNode = ref(null)
const selectedEdge = ref(null)
const editableNodeText = ref('')
const editableOptionMainText = ref('')
const newOptionText = ref('') // For adding new options to an OptionNode

// Define custom node types
const nodeTypes = {
  questionNode: QuestionNode,
  optionNode: OptionNode,
}

watch(selectedNode, (currentNode) => {
  if (currentNode) {
    const storeNode = flowStore.nodes.find((n) => n.id === currentNode.id)
    if (storeNode) {
      editableNodeText.value = storeNode.text // For QuestionNode
      if (storeNode.type === 'option') {
        editableOptionMainText.value = storeNode.text // Main text for OptionNode
        newOptionText.value = '' // Clear new option input when selection changes
      }
    } else {
      // Fallback if node somehow not in store (should be rare with current logic)
      editableNodeText.value = currentNode.data?.text || ''
      editableOptionMainText.value = ''
      newOptionText.value = ''
      console.warn(
        'Selected node was not found in Pinia store during watch. Displaying VueFlow data.',
      )
    }
  } else {
    editableNodeText.value = ''
    editableOptionMainText.value = ''
    newOptionText.value = ''
  }
})

function handleNodeClick(event) {
  const storeNode = flowStore.nodes.find((n) => n.id === event.node.id)
  if (storeNode) {
    selectedNode.value = storeNode
    selectedEdge.value = null // Clear edge selection when selecting a node
  } else {
    selectedNode.value = null
    console.error(
      `Critical: Clicked node with ID ${event.node.id} not found in Pinia store.`,
    )
  }
}

function handleEdgeClick(event) {
  selectedEdge.value = event.edge
  selectedNode.value = null // Clear node selection when selecting an edge
}

function saveNodeChanges() {
  if (selectedNode.value) {
    const nodeToUpdate = selectedNode.value

    if (nodeToUpdate.type === 'question') {
      flowStore.updateNodeText({
        nodeId: nodeToUpdate.id,
        newText: editableNodeText.value,
      })
    } else if (nodeToUpdate.type === 'option') {
      // Save the main text label of the OptionNode
      flowStore.updateNodeText({
        nodeId: nodeToUpdate.id,
        newText: editableOptionMainText.value,
      })

      // Save text for each individual option within the OptionNode
      if (nodeToUpdate.options && Array.isArray(nodeToUpdate.options)) {
        nodeToUpdate.options.forEach((option) => {
          if (option.id && typeof option.text === 'string') {
            flowStore.updateOptionText({
              nodeId: nodeToUpdate.id,
              optionId: option.id,
              newText: option.text,
            })
          }
        })
      }
    }
    // console.log('Changes saved for node:', nodeToUpdate.id)
  }
}

function handleAddNewOption() {
  if (
    selectedNode.value &&
    selectedNode.value.type === 'option' &&
    newOptionText.value.trim() !== ''
  ) {
    flowStore.addOptionToNode({
      nodeId: selectedNode.value.id,
      optionText: newOptionText.value.trim(),
    })
    newOptionText.value = '' // Clear input after adding
  } else if (newOptionText.value.trim() === '') {
    toast.add({
      severity: 'warn',
      summary: '輸入錯誤',
      detail: '新選項文字不可為空。',
      life: 3000,
    })
  } else if (!selectedNode.value || selectedNode.value.type !== 'option') {
    toast.add({
      severity: 'warn',
      summary: '選擇錯誤',
      detail: '請先選取一個選項節點。',
      life: 3000,
    })
  }
}

function addNewQuestionNode() {
  flowStore.addNode({
    type: 'question',
    text: '新問題節點',
    position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 },
  })
}

function addNewOptionNode() {
  flowStore.addNode({
    type: 'option',
    text: '新選項節點', // This is the main label for the option group node
    position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 },
  })
}

function handleDeleteNode() {
  if (selectedNode.value) {
    const nodeId = selectedNode.value.id
    const nodeText = selectedNode.value.text

    // 確認刪除
    confirm.require({
      message: `確定要刪除節點「${nodeText}」嗎？此操作無法復原。`,
      header: '刪除節點確認',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定刪除',
      rejectLabel: '取消',
      accept: () => {
        flowStore.deleteNode({ nodeId })
        selectedNode.value = null // 清除選擇狀態
      },
      reject: () => {
        // 使用者取消，不執行任何動作
      },
    })
  }
}

function handleDeleteEdge() {
  if (selectedEdge.value) {
    const edgeId = selectedEdge.value.id
    confirm.require({
      message: '確定要刪除此連線嗎？此操作無法復原。',
      header: '刪除連線確認',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定刪除',
      rejectLabel: '取消',
      accept: () => {
        flowStore.removeEdge({ edgeId })
        selectedEdge.value = null // Clear selection after deletion
      },
      reject: () => {
        // 使用者取消，不執行任何動作
      },
    })
  }
}

function handleConnect(params) {
  flowStore.onConnect(params)
}

// 鍵盤事件處理
function handleKeyDown(event) {
  if (event.key === 'Delete') {
    if (selectedNode.value) {
      handleDeleteNode()
    } else if (selectedEdge.value) {
      handleDeleteEdge()
    }
  }
}

// 綁定鍵盤事件
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function handleNodesChange(changes) {
  // 處理節點變化，特別是位置移動
  changes.forEach((change) => {
    if (change.type === 'position' && change.position) {
      // 同步位置變化到 Pinia store
      flowStore.updateNodePosition({
        nodeId: change.id,
        position: change.position,
      })
    }
  })
}

// 儲存/載入功能
function exportFlow() {
  try {
    // 檢查是否有內容可以匯出
    if (flowStore.nodes.length === 0) {
      toast.add({
        severity: 'warn',
        summary: '無法匯出',
        detail: '目前沒有任何節點，無法匯出流程。請先建立一些節點。',
        life: 5000,
      })
      return
    }

    const jsonData = flowStore.exportNodeGraph()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // 生成更有意義的檔案名稱
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
    const nodeCount = flowStore.nodes.length
    const fileName = `qa-flow-${nodeCount}nodes-${dateStr}-${timeStr}.json`

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    // 顯示成功訊息
    const stats = `包含 ${flowStore.nodes.length} 個節點和 ${flowStore.edges.length} 個連線`
    console.log('Flow exported successfully:', fileName)
    toast.add({
      severity: 'success',
      summary: '匯出成功',
      detail: `檔案名稱：${fileName}\n內容：${stats}`,
      life: 6000,
    })
  } catch (error) {
    console.error('Failed to export flow:', error)
    toast.add({
      severity: 'error',
      summary: '匯出失敗',
      detail: `${error.message}，請稍後再試或檢查瀏覽器控制台了解詳細錯誤。`,
      life: 8000,
    })
  }
}

function importFlow() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (event) => {
    // Type guard: 確保 event.target 是 HTMLInputElement
    if (!(event.target instanceof HTMLInputElement) || !event.target.files) {
      toast.add({
        severity: 'error',
        summary: '檔案選擇錯誤',
        detail: '無法取得選擇的檔案，請重試。',
        life: 5000,
      })
      return
    }

    const file = event.target.files[0]
    if (!file) return

    // 檢查檔案大小（限制為 10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.add({
        severity: 'error',
        summary: '檔案太大',
        detail: '請選擇小於 10MB 的檔案。',
        life: 5000,
      })
      return
    }

    // 檢查檔案類型
    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.add({
        severity: 'error',
        summary: '檔案格式錯誤',
        detail: '請選擇 JSON 格式的檔案。',
        life: 5000,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonString = e.target.result

        // 顯示載入中訊息
        console.log('開始匯入流程檔案：', file.name)

        // Type guard: 確保 jsonString 是 string 型別
        if (typeof jsonString !== 'string') {
          toast.add({
            severity: 'error',
            summary: '檔案讀取錯誤',
            detail: '檔案內容格式異常，無法解析為文字格式。',
            life: 5000,
          })
          return
        }

        const success = flowStore.importNodeGraph(jsonString)

        if (success) {
          // 清除選擇狀態
          selectedNode.value = null
          selectedEdge.value = null

          // 顯示詳細的成功訊息
          const nodeCount = flowStore.nodes.length
          const edgeCount = flowStore.edges.length
          const questionNodes = flowStore.nodes.filter(
            (n) => n.type === 'question',
          ).length
          const optionNodes = flowStore.nodes.filter(
            (n) => n.type === 'option',
          ).length

          console.log('Flow imported successfully:', {
            fileName: file.name,
            nodeCount,
            edgeCount,
            questionNodes,
            optionNodes,
          })

          toast.add({
            severity: 'success',
            summary: '匯入成功',
            detail: `檔案名稱：${file.name}\n匯入 ${nodeCount} 個節點（${questionNodes} 個問句，${optionNodes} 個選項）和 ${edgeCount} 個連線`,
            life: 8000,
          })
        } else {
          toast.add({
            severity: 'error',
            summary: '匯入失敗',
            detail: `JSON 格式不正確或檔案內容無效。請確認檔案是由 QA Builder 匯出的有效 JSON 格式。`,
            life: 8000,
          })
        }
      } catch (error) {
        console.error('Failed to import flow:', error)
        toast.add({
          severity: 'error',
          summary: '匯入失敗',
          detail: `檔案解析錯誤：${error.message}。請檢查檔案是否完整且格式正確。`,
          life: 8000,
        })
      }
    }

    reader.onerror = () => {
      toast.add({
        severity: 'error',
        summary: '檔案讀取失敗',
        detail: `無法讀取檔案 ${file.name}`,
        life: 5000,
      })
    }

    reader.readAsText(file, 'UTF-8')
  }

  input.click()
}

function clearAllNodes() {
  confirm.require({
    message: '確定要清空所有節點和連線嗎？此操作無法復原。',
    header: '清空全部確認',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確定清空',
    rejectLabel: '取消',
    accept: () => {
      flowStore.clearAll()
      selectedNode.value = null
      selectedEdge.value = null
      console.log('All nodes and edges cleared')
    },
    reject: () => {
      // 使用者取消，不執行任何動作
    },
  })
}

function goToSimulator() {
  router.push('/simulator')
}
</script>
<template>
  <ConfirmDialog />
  <Toast />
  <div class="flex h-screen bg-gray-100">
    <!-- Left Toolbar -->
    <div class="flex w-1/4 flex-col space-y-4 bg-gray-200 p-4">
      <h2 class="mb-4 text-xl font-semibold">工具欄</h2>

      <!-- 節點新增區域 -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium text-gray-700">新增節點</h3>
        <Button
          label="新增問句節點"
          icon="pi pi-plus"
          class="p-button-sm w-full"
          @click="addNewQuestionNode"
        />
        <Button
          label="新增選項節點"
          icon="pi pi-plus"
          class="p-button-sm p-button-secondary w-full"
          @click="addNewOptionNode"
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
          @click="exportFlow"
        />
        <Button
          label="匯入流程"
          icon="pi pi-upload"
          class="p-button-sm w-full"
          @click="importFlow"
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
          @click="goToSimulator"
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
          @click="clearAllNodes"
        />
      </div>
    </div>

    <!-- Center Canvas Area -->
    <div class="flex-1 bg-gray-100 p-4">
      <h2 class="text-xl font-semibold">編輯畫布</h2>
      <VueFlow
        :nodes="flowStore.vueFlowElements.nodes"
        :edges="flowStore.vueFlowElements.edges"
        :node-types="nodeTypes"
        fit-view-on-init
        :nodes-connectable="true"
        :edges-updatable="true"
        :default-edge-options="{ type: 'default', updatable: true }"
        class="h-full w-full"
        @node-click="handleNodeClick"
        @edge-click="handleEdgeClick"
        @connect="handleConnect"
        @nodes-change="handleNodesChange"
      >
      </VueFlow>
    </div>

    <!-- Right Properties Panel -->
    <div class="w-1/4 bg-gray-300 p-4">
      <h2 class="text-xl font-semibold">屬性編輯</h2>
      <div v-if="selectedNode" class="mt-4 space-y-4">
        <div>
          <label class="text-sm font-medium">節點 ID:</label>
          <!-- @vue-ignore -->
          <p class="text-sm text-gray-700">{{ selectedNode.id }}</p>
        </div>
        <div>
          <label class="text-sm font-medium">節點類型：</label>
          <!-- @vue-ignore -->
          <p class="text-sm text-gray-700">{{ selectedNode.type }}</p>
        </div>

        <!-- Editing for QuestionNode -->
        <!-- @vue-ignore -->
        <div v-if="selectedNode.type === 'question'" class="space-y-2">
          <label for="nodeText" class="text-sm font-medium">問句內容：</label>
          <Textarea
            id="nodeText"
            v-model="editableNodeText"
            autoResize
            rows="3"
            class="w-full"
          />
        </div>

        <!-- Editing for OptionNode (Main Text and its options) -->
        <!-- @vue-ignore -->
        <div v-if="selectedNode.type === 'option'" class="space-y-2">
          <label for="optionMainText" class="text-sm font-medium"
            >選項節點標題：</label
          >
          <InputText
            id="optionMainText"
            v-model="editableOptionMainText"
            class="w-full"
          />

          <h3 class="text-md mt-4 font-semibold">選項列表：</h3>
          <!-- @vue-ignore -->
          <div v-if="selectedNode.options && selectedNode.options.length > 0">
            <!-- @vue-ignore -->
            <div
              v-for="(option, index) in selectedNode.options"
              :key="option.id"
              class="mt-2 space-y-1 border-t pt-2"
            >
              <label :for="`optionText_${option.id}`" class="text-sm"
                >選項 {{ index + 1 }} 文字：</label
              >
              <InputText
                :id="`optionText_${option.id}`"
                v-model="option.text"
                class="w-full text-sm"
                placeholder="選項文字"
              />
            </div>
          </div>
          <p v-else class="text-xs text-gray-500">此選項節點尚無選項。</p>

          <!-- Add new option section -->
          <div class="mt-4 space-y-2 border-t pt-4">
            <label for="newOptionText" class="text-sm font-medium"
              >新增選項文字：</label
            >
            <InputText
              id="newOptionText"
              v-model="newOptionText"
              class="w-full text-sm"
              placeholder="輸入新選項內容"
              @keyup.enter="handleAddNewOption"
            />
            <Button
              label="加入新選項"
              icon="pi pi-plus-circle"
              class="p-button-sm p-button-success mt-2"
              @click="handleAddNewOption"
            />
          </div>
        </div>

        <div class="mt-4 flex space-x-2">
          <Button
            label="儲存變更"
            icon="pi pi-save"
            class="p-button-sm flex-1"
            @click="saveNodeChanges"
          />
          <Button
            label="刪除節點"
            icon="pi pi-trash"
            class="p-button-sm p-button-danger"
            @click="handleDeleteNode"
          />
        </div>
      </div>
      <p v-else class="mt-2 text-sm text-gray-600">
        選取一個節點以編輯其屬性。
      </p>

      <!-- Edge properties when an edge is selected -->
      <div v-if="selectedEdge" class="mt-4 space-y-4">
        <div>
          <label class="text-sm font-medium">連線 ID:</label>
          <p class="text-sm text-gray-700">{{ selectedEdge.id }}</p>
        </div>
        <div>
          <label class="text-sm font-medium">起點節點：</label>
          <p class="text-sm text-gray-700">{{ selectedEdge.source }}</p>
        </div>
        <div>
          <label class="text-sm font-medium">終點節點：</label>
          <p class="text-sm text-gray-700">{{ selectedEdge.target }}</p>
        </div>
        <div class="mt-4">
          <Button
            label="刪除連線"
            icon="pi pi-trash"
            class="p-button-sm p-button-danger w-full"
            @click="handleDeleteEdge"
          />
        </div>
      </div>
      <p v-else-if="!selectedNode" class="mt-2 text-sm text-gray-600">
        選取一個節點或連線以編輯其屬性。
      </p>
    </div>
  </div>
</template>
<style scoped>
.flex-1 {
  min-height: 0;
}
</style>
