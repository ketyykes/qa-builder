// @ts-check
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { transformToVueFlowElements } from '../utils/flow-transformer.js'

/**
 * @typedef {import('../types/flow.d').FlowNode}     FlowNode
 *
 * @typedef {import('../types/flow.d').FlowEdge}     FlowEdge
 *
 * @typedef {import('../types/flow.d').NodePosition} NodePosition
 *
 * @typedef {import('../types/flow.d').QuestionNode} QuestionNode
 *
 * @typedef {import('../types/flow.d').OptionNode}   OptionNode
 *
 * @typedef {import('../types/flow.d').Option}       Option
 *
 * @typedef {'question' | 'option'}                  NodeType
 */

let nodeIdCounter = 0
const getNextNodeId = () => `node_${nodeIdCounter++}`

let optionIdCounter = 0
const getNextOptionId = () => `opt_${optionIdCounter++}`

export const useFlowStore = defineStore('flow', () => {
  /** @type {import('vue').Ref<FlowNode[]>} */
  const nodes = ref([])
  /** @type {import('vue').Ref<FlowEdge[]>} */
  const edges = ref([])

  // Getter to transform nodes and edges for Vue Flow
  const vueFlowElements = computed(() => {
    return transformToVueFlowElements({
      nodes: nodes.value,
      edges: edges.value,
    })
  })

  /**
   * Adds a new node to the store.
   *
   * @param {object}       payload
   * @param {NodeType}     payload.type       - The type of the node ('question'
   *   or 'option').
   * @param {string}       [payload.text]     - The initial text for the node.
   * @param {NodePosition} [payload.position] - The initial position of the
   *   node.
   */
  function addNode({ type, text = '', position = { x: 100, y: 100 } }) {
    const newNodeId = getNextNodeId()
    /** @type {FlowNode} */
    let newNode

    if (type === 'question') {
      newNode = /** @type {QuestionNode} */ ({
        id: newNodeId,
        type: 'question',
        text: text || '新問題節點',
        position,
      })
    } else if (type === 'option') {
      newNode = /** @type {OptionNode} */ ({
        id: newNodeId,
        type: 'option',
        text: text || '新選項節點',
        options: [],
        position,
      })
    } else {
      console.error('無效的節點類型：', type)
      return
    }

    nodes.value.push(newNode)
  }

  /**
   * Updates the position of a node in the store.
   *
   * @param {object}       payload
   * @param {string}       payload.nodeId   - The ID of the node to update.
   * @param {NodePosition} payload.position - The new position of the node.
   */
  function updateNodePosition({ nodeId, position }) {
    const nodeToUpdate = nodes.value.find((node) => node.id === nodeId)
    if (nodeToUpdate) {
      nodeToUpdate.position = position
    } else {
      console.warn(`Node with id ${nodeId} not found for position update.`)
    }
  }

  /**
   * Updates the text content of a specific node.
   *
   * @param {object} payload
   * @param {string} payload.nodeId  - The ID of the node to update.
   * @param {string} payload.newText - The new text for the node.
   */
  function updateNodeText({ nodeId, newText }) {
    const nodeToUpdate = nodes.value.find((node) => node.id === nodeId)
    if (nodeToUpdate) {
      nodeToUpdate.text = newText
    } else {
      console.warn(`Node with id ${nodeId} not found for text update.`)
    }
  }

  /**
   * Adds a new option to a specified OptionNode.
   *
   * @param {object} payload
   * @param {string} payload.nodeId       - The ID of the OptionNode to add an
   *   option to.
   * @param {string} [payload.optionText] - The text for the new option.
   *   Defaults to "新選項".
   */
  function addOptionToNode({ nodeId, optionText = '新選項' }) {
    const nodeToUpdate = nodes.value.find((node) => node.id === nodeId)

    if (nodeToUpdate && nodeToUpdate.type === 'option') {
      /** @type {Option} */
      const newOption = {
        id: getNextOptionId(),
        text: optionText,
        // nextQuestionId will be set when connecting edges
      }
      if (!nodeToUpdate.options) {
        nodeToUpdate.options = []
      }
      nodeToUpdate.options.push(newOption)
    } else {
      console.warn(
        `Node with id ${nodeId} not found or is not an OptionNode for adding an option.`,
      )
    }
  }

  /**
   * Updates the text of a specific option within an OptionNode.
   *
   * @param {object} payload
   * @param {string} payload.nodeId   - The ID of the OptionNode.
   * @param {string} payload.optionId - The ID of the option to update.
   * @param {string} payload.newText  - The new text for the option.
   */
  function updateOptionText({ nodeId, optionId, newText }) {
    const nodeToUpdate = nodes.value.find((node) => node.id === nodeId)
    if (nodeToUpdate && nodeToUpdate.type === 'option') {
      const optionToUpdate = nodeToUpdate.options?.find(
        (opt) => opt.id === optionId,
      )
      if (optionToUpdate) {
        optionToUpdate.text = newText
      } else {
        console.warn(`Option with id ${optionId} not found in node ${nodeId}.`)
      }
    } else {
      console.warn(
        `Node with id ${nodeId} not found or is not an option node for option text update.`,
      )
    }
  }

  /**
   * Deletes a node and all its related edges from the store.
   *
   * @param {object} payload
   * @param {string} payload.nodeId - The ID of the node to delete.
   */
  function deleteNode({ nodeId }) {
    // Find the index of the node to delete
    const nodeIndex = nodes.value.findIndex((node) => node.id === nodeId)
    if (nodeIndex === -1) {
      console.warn(`Node with id ${nodeId} not found for deletion.`)
      return
    }

    // Remove the node from the nodes array
    nodes.value.splice(nodeIndex, 1)

    // Remove all edges that connect to or from this node
    edges.value = edges.value.filter(
      (edge) => edge.sourceId !== nodeId && edge.targetId !== nodeId,
    )

    console.log(`Node ${nodeId} and its related edges have been deleted.`)
  }

  return {
    nodes,
    edges,
    vueFlowElements,
    addNode,
    updateNodePosition,
    updateNodeText,
    addOptionToNode,
    updateOptionText,
    deleteNode, // Export the new delete action
  }
})
