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

  /**
   * Adds a new edge (connection) between two nodes.
   *
   * @param {object} payload
   * @param {string} payload.sourceId       - The ID of the source node.
   * @param {string} payload.targetId       - The ID of the target node.
   * @param {string} [payload.sourceHandle] - Optional source handle ID.
   * @param {string} [payload.targetHandle] - Optional target handle ID.
   */
  function addEdge({ sourceId, targetId, sourceHandle, targetHandle }) {
    // Check if source and target nodes exist
    const sourceNode = nodes.value.find((node) => node.id === sourceId)
    const targetNode = nodes.value.find((node) => node.id === targetId)

    if (!sourceNode) {
      console.warn(`Source node with id ${sourceId} not found.`)
      return
    }

    if (!targetNode) {
      console.warn(`Target node with id ${targetId} not found.`)
      return
    }

    // Prevent self-connections
    if (sourceId === targetId) {
      console.warn('不能連接節點到自己。')
      return
    }

    // Check if edge already exists
    const existingEdge = edges.value.find(
      (edge) => edge.sourceId === sourceId && edge.targetId === targetId,
    )

    if (existingEdge) {
      console.warn(`Edge from ${sourceId} to ${targetId} already exists.`)
      return
    }

    // Generate edge ID
    const edgeId = `edge_${sourceId}_to_${targetId}`

    /** @type {FlowEdge} */
    const newEdge = {
      id: edgeId,
      sourceId,
      targetId,
      sourceHandle,
      targetHandle,
    }

    edges.value.push(newEdge)
    console.log(`Edge added: ${sourceId} -> ${targetId}`)

    // If source is an option node and sourceHandle is specified,
    // update the option's nextQuestionId
    if (sourceNode.type === 'option' && sourceHandle) {
      const option = sourceNode.options?.find((opt) => opt.id === sourceHandle)
      if (option) {
        option.nextQuestionId = targetId
      }
    }
  }

  /**
   * Removes an edge (connection) between two nodes.
   *
   * @param {object} payload
   * @param {string} payload.edgeId - The ID of the edge to delete.
   */
  function removeEdge({ edgeId }) {
    const edgeIndex = edges.value.findIndex((edge) => edge.id === edgeId)

    if (edgeIndex === -1) {
      console.warn(`Edge with id ${edgeId} not found.`)
      return
    }

    const edgeToRemove = edges.value[edgeIndex]

    // If this edge is connected to an option, clear the nextQuestionId
    const sourceNode = nodes.value.find(
      (node) => node.id === edgeToRemove.sourceId,
    )
    if (
      sourceNode &&
      sourceNode.type === 'option' &&
      edgeToRemove.sourceHandle
    ) {
      const option = sourceNode.options?.find(
        (opt) => opt.id === edgeToRemove.sourceHandle,
      )
      if (option) {
        option.nextQuestionId = null
      }
    }

    edges.value.splice(edgeIndex, 1)
    console.log(`Edge ${edgeId} removed.`)
  }

  /**
   * Removes all edges connected to or from a specific node.
   *
   * @param {object} payload
   * @param {string} payload.nodeId - The ID of the node whose edges should be
   *   removed.
   */
  function removeNodeEdges({ nodeId }) {
    // Find all edges connected to this node
    const connectedEdges = edges.value.filter(
      (edge) => edge.sourceId === nodeId || edge.targetId === nodeId,
    )

    // Remove each edge and update option references
    connectedEdges.forEach((edge) => {
      removeEdge({ edgeId: edge.id })
    })

    console.log(`Removed ${connectedEdges.length} edges for node ${nodeId}.`)
  }

  /**
   * Handles Vue Flow's connection event.
   *
   * @param {object} params                - Vue Flow connection parameters.
   * @param {string} params.source         - Source node ID.
   * @param {string} params.target         - Target node ID.
   * @param {string} [params.sourceHandle] - Source handle ID.
   * @param {string} [params.targetHandle] - Target handle ID.
   */
  function onConnect(params) {
    addEdge({
      sourceId: params.source,
      targetId: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
    })
  }

  /**
   * Exports the current flow data as JSON.
   *
   * @returns {string} JSON string containing all nodes and edges data
   */
  function exportNodeGraph() {
    const exportData = {
      version: '1.0.0',
      metadata: {
        exportDate: new Date().toISOString(),
        nodeCount: nodes.value.length,
        edgeCount: edges.value.length,
      },
      nodes: nodes.value,
      edges: edges.value,
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Imports flow data from JSON string.
   *
   * @param   {string}  jsonString - JSON string containing flow data
   * @returns {boolean}            Success status
   */
  function importNodeGraph(jsonString) {
    try {
      const importData = JSON.parse(jsonString)

      // Validate the structure
      if (!importData.nodes || !Array.isArray(importData.nodes)) {
        console.error('Invalid JSON: nodes array is missing or invalid')
        return false
      }

      if (!importData.edges || !Array.isArray(importData.edges)) {
        console.error('Invalid JSON: edges array is missing or invalid')
        return false
      }

      // Clear current data
      nodes.value = []
      edges.value = []

      // Import nodes
      importData.nodes.forEach((node) => {
        // Validate node structure
        if (!node.id || !node.type || !node.position) {
          console.warn('Skipping invalid node:', node)
          return
        }

        nodes.value.push(node)
      })

      // Import edges
      importData.edges.forEach((edge) => {
        // Validate edge structure
        if (!edge.id || !edge.sourceId || !edge.targetId) {
          console.warn('Skipping invalid edge:', edge)
          return
        }

        edges.value.push(edge)
      })

      // Update counters to avoid ID conflicts
      const maxNodeId = nodes.value.reduce((max, node) => {
        const match = node.id.match(/^node_(\d+)$/)
        return match ? Math.max(max, parseInt(match[1])) : max
      }, 0)

      const maxOptionId = nodes.value.reduce((max, node) => {
        if (node.type === 'option' && node.options) {
          return node.options.reduce((optMax, option) => {
            const match = option.id.match(/^opt_(\d+)$/)
            return match ? Math.max(optMax, parseInt(match[1])) : optMax
          }, max)
        }
        return max
      }, 0)

      nodeIdCounter = maxNodeId + 1
      optionIdCounter = maxOptionId + 1

      console.log(
        `Successfully imported ${nodes.value.length} nodes and ${edges.value.length} edges`,
      )
      return true
    } catch (error) {
      console.error('Failed to import flow data:', error)
      return false
    }
  }

  /** Clears all nodes and edges from the store. */
  function clearAll() {
    nodes.value = []
    edges.value = []
    nodeIdCounter = 0
    optionIdCounter = 0
    console.log('All flow data cleared')
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
    deleteNode,
    addEdge,
    removeEdge,
    removeNodeEdges,
    onConnect,
    exportNodeGraph,
    importNodeGraph,
    clearAll,
  }
})
