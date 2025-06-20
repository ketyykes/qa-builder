<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

import { VueFlow } from '@vue-flow/core'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import OptionNode from '../../components/OptionNode.vue'
import QuestionNode from '../../components/QuestionNode.vue'
import { useFlowStore } from '../../stores/flow'

const flowStore = useFlowStore()

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
    console.warn('新選項文字不可為空。')
    // TODO: Provide user feedback via a toast message or similar
  } else if (!selectedNode.value || selectedNode.value.type !== 'option') {
    console.warn('請先選取一個選項節點。')
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
    if (confirm(`確定要刪除節點「${nodeText}」嗎？此操作無法復原。`)) {
      flowStore.deleteNode({ nodeId })
      selectedNode.value = null // 清除選擇狀態
    }
  }
}

function handleDeleteEdge() {
  if (selectedEdge.value) {
    const edgeId = selectedEdge.value.id
    if (confirm(`確定要刪除此連線嗎？此操作無法復原。`)) {
      flowStore.removeEdge({ edgeId })
      selectedEdge.value = null // Clear selection after deletion
    }
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
    const jsonData = flowStore.exportNodeGraph()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `qa-flow-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
    console.log('Flow exported successfully')
  } catch (error) {
    console.error('Failed to export flow:', error)
    alert('匯出失敗，請稍後再試。')
  }
}

function importFlow() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonString = e.target.result
        const success = flowStore.importNodeGraph(jsonString)

        if (success) {
          // 清除選擇狀態
          selectedNode.value = null
          selectedEdge.value = null
          console.log('Flow imported successfully')
          alert('流程匯入成功！')
        } else {
          alert('匯入失敗：JSON 格式不正確。')
        }
      } catch (error) {
        console.error('Failed to import flow:', error)
        alert('匯入失敗：檔案格式錯誤。')
      }
    }

    reader.readAsText(file)
  }

  input.click()
}

function clearAllNodes() {
  if (confirm('確定要清空所有節點和連線嗎？此操作無法復原。')) {
    flowStore.clearAll()
    selectedNode.value = null
    selectedEdge.value = null
    console.log('All nodes and edges cleared')
  }
}
</script>
<template>
  <div class="flex h-screen">
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
