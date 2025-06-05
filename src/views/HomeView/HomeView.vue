<script setup>
import { ref, watch } from 'vue'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

import { VueFlow } from '@vue-flow/core'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import { useFlowStore } from '../../stores/flow'

const flowStore = useFlowStore()

const selectedNode = ref(null)
const editableNodeText = ref('')
const editableOptionMainText = ref('')
const newOptionText = ref('') // For adding new options to an OptionNode

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
  } else {
    selectedNode.value = null
    console.error(
      `Critical: Clicked node with ID ${event.node.id} not found in Pinia store.`,
    )
  }
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
</script>
<template>
  <div class="flex h-screen">
    <!-- Left Toolbar -->
    <div class="flex w-1/4 flex-col space-y-4 bg-gray-200 p-4">
      <h2 class="mb-4 text-xl font-semibold">工具欄</h2>
      <Button
        label="新增問句節點"
        icon="pi pi-plus"
        class="p-button-sm"
        @click="addNewQuestionNode"
      />
      <Button
        label="新增選項節點"
        icon="pi pi-plus"
        class="p-button-sm p-button-secondary"
        @click="addNewOptionNode"
      />
    </div>

    <!-- Center Canvas Area -->
    <div class="flex-1 bg-gray-100 p-4">
      <h2 class="text-xl font-semibold">編輯畫布</h2>
      <VueFlow
        :nodes="flowStore.vueFlowElements.nodes"
        :edges="flowStore.vueFlowElements.edges"
        fit-view-on-init
        class="h-full w-full"
        @node-click="handleNodeClick"
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

        <Button
          label="儲存變更"
          icon="pi pi-save"
          class="p-button-sm mt-4"
          @click="saveNodeChanges"
        />
      </div>
      <p v-else class="mt-2 text-sm text-gray-600">
        選取一個節點以編輯其屬性。
      </p>
    </div>
  </div>
</template>
<style scoped>
.flex-1 {
  min-height: 0;
}
</style>
