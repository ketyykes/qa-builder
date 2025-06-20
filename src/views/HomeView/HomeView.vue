<script setup>
import { useRouter } from 'vue-router'

import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'

import { VueFlow } from '@vue-flow/core'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import PropertiesPanel from './components/PropertiesPanel.vue'
import ToolbarSection from './components/ToolbarSection.vue'
import { useFileOperations } from './composables/useFileOperations'
import { useKeyboardEvents } from './composables/useKeyboardEvents'
import { useNodeOperations } from './composables/useNodeOperations'
import { useNodeSelection } from './composables/useNodeSelection'
import OptionNode from '../../components/OptionNode.vue'
import QuestionNode from '../../components/QuestionNode.vue'
import { useFlowStore } from '../../stores/flow'

const router = useRouter()
const flowStore = useFlowStore()

// 使用 composables
const {
  selectedNode,
  selectedEdge,
  editableNodeText,
  editableOptionMainText,
  newOptionText,
  handleNodeClick,
  handleEdgeClick,
  clearSelection,
} = useNodeSelection()

const {
  addNewQuestionNode,
  addNewOptionNode,
  handleDeleteNode,
  handleDeleteEdge,
  saveNodeChanges,
  handleAddNewOption,
  clearAllNodes,
  handleConnect,
  handleNodesChange,
} = useNodeOperations()

const { exportFlow, importFlow } = useFileOperations()

// 定義自訂節點類型
const nodeTypes = {
  questionNode: QuestionNode,
  optionNode: OptionNode,
}

// 鍵盤事件處理
useKeyboardEvents(
  () => handleDeleteNode(selectedNode, clearSelection),
  () => handleDeleteEdge(selectedEdge, clearSelection),
)

// 導航函式
function goToSimulator() {
  router.push('/simulator')
}

// 包裝函式來符合元件事件
function onDeleteNode() {
  handleDeleteNode(selectedNode, clearSelection)
}

function onDeleteEdge() {
  handleDeleteEdge(selectedEdge, clearSelection)
}

function onSaveNodeChanges() {
  saveNodeChanges(selectedNode, editableNodeText, editableOptionMainText)
}

function onHandleAddNewOption() {
  handleAddNewOption(selectedNode, newOptionText)
}

function onImportFlow() {
  importFlow(clearSelection)
}

function onClearAllNodes() {
  clearAllNodes(clearSelection)
}
</script>

<template>
  <ConfirmDialog />
  <Toast />
  <div class="flex h-screen bg-gray-100">
    <!-- Left Toolbar -->
    <ToolbarSection
      @add-question-node="addNewQuestionNode"
      @add-option-node="addNewOptionNode"
      @export-flow="exportFlow"
      @import-flow="onImportFlow"
      @go-to-simulator="goToSimulator"
      @clear-all-nodes="onClearAllNodes"
    />

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
    <PropertiesPanel
      :selected-node="selectedNode"
      :selected-edge="selectedEdge"
      :editable-node-text="editableNodeText"
      :editable-option-main-text="editableOptionMainText"
      :new-option-text="newOptionText"
      @update:editable-node-text="editableNodeText = $event"
      @update:editable-option-main-text="editableOptionMainText = $event"
      @update:new-option-text="newOptionText = $event"
      @save-node-changes="onSaveNodeChanges"
      @delete-node="onDeleteNode"
      @delete-edge="onDeleteEdge"
      @add-new-option="onHandleAddNewOption"
    />
  </div>
</template>

<style scoped>
.flex-1 {
  min-height: 0;
}
</style>
