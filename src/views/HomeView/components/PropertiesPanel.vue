<template>
  <div class="w-1/4 bg-gray-300 p-4">
    <h2 class="text-xl font-semibold">屬性編輯</h2>

    <!-- 節點編輯區域 -->
    <div v-if="selectedNode" class="mt-4 space-y-4">
      <div>
        <label class="text-sm font-medium">節點 ID:</label>
        <p class="text-sm text-gray-700">{{ selectedNode.id }}</p>
      </div>
      <div>
        <label class="text-sm font-medium">節點類型：</label>
        <p class="text-sm text-gray-700">{{ selectedNode.type }}</p>
      </div>

      <!-- Editing for QuestionNode -->
      <div v-if="selectedNode.type === 'question'" class="space-y-2">
        <label for="nodeText" class="text-sm font-medium">問句內容：</label>
        <Textarea
          id="nodeText"
          :model-value="editableNodeText"
          autoResize
          rows="3"
          class="w-full"
          @update:model-value="$emit('update:editableNodeText', $event)"
        />
      </div>

      <!-- Editing for OptionNode (Main Text and its options) -->
      <div v-if="selectedNode.type === 'option'" class="space-y-2">
        <label for="optionMainText" class="text-sm font-medium"
          >選項節點標題：</label
        >
        <InputText
          id="optionMainText"
          :model-value="editableOptionMainText"
          class="w-full"
          @update:model-value="$emit('update:editableOptionMainText', $event)"
        />

        <h3 class="text-md mt-4 font-semibold">選項列表：</h3>
        <div v-if="selectedNode.options && selectedNode.options.length > 0">
          <div
            v-for="(option, index) in selectedNode.options"
            :key="option.id"
            class="mt-2 space-y-1 border-t pt-2"
          >
            <label :for="`optionText_${option.id}`" class="text-sm">
              選項 {{ index + 1 }} 文字：
            </label>
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
            :model-value="newOptionText"
            class="w-full text-sm"
            placeholder="輸入新選項內容"
            @update:model-value="$emit('update:newOptionText', $event)"
            @keyup.enter="$emit('add-new-option')"
          />
          <Button
            label="加入新選項"
            icon="pi pi-plus-circle"
            class="p-button-sm p-button-success mt-2"
            @click="$emit('add-new-option')"
          />
        </div>
      </div>

      <div class="mt-4 flex space-x-2">
        <Button
          label="儲存變更"
          icon="pi pi-save"
          class="p-button-sm flex-1"
          @click="$emit('save-node-changes')"
        />
        <Button
          label="刪除節點"
          icon="pi pi-trash"
          class="p-button-sm p-button-danger"
          @click="$emit('delete-node')"
        />
      </div>
    </div>
    <p v-else class="mt-2 text-sm text-gray-600">選取一個節點以編輯其屬性。</p>

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
          @click="$emit('delete-edge')"
        />
      </div>
    </div>
    <p v-else-if="!selectedNode" class="mt-2 text-sm text-gray-600">
      選取一個節點或連線以編輯其屬性。
    </p>
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

defineProps({
  selectedNode: {
    type: Object,
    default: null,
  },
  selectedEdge: {
    type: Object,
    default: null,
  },
  editableNodeText: {
    type: String,
    default: '',
  },
  editableOptionMainText: {
    type: String,
    default: '',
  },
  newOptionText: {
    type: String,
    default: '',
  },
})

defineEmits([
  'update:editableNodeText',
  'update:editableOptionMainText',
  'update:newOptionText',
  'save-node-changes',
  'delete-node',
  'delete-edge',
  'add-new-option',
])
</script>
