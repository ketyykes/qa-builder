// @ts-check
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { transformToVueFlowElements } from '../utils/flow-transformer.js'

/**
 * @import {FlowNode,
 *   FlowEdge,
 *   NodePosition,
 *   QuestionNode,
 *   OptionNode,
 *   Option} from '../types/flow.d'
 */

/** @typedef {'question' | 'option'} NodeType */

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
   * 新增節點到 store
   *
   * @type {(payload: {
   *   type: NodeType
   *   text?: string
   *   position?: NodePosition
   * }) => void}
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
   * 更新節點位置
   *
   * @type {(payload: { nodeId: string; position: NodePosition }) => void}
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
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    )

    console.log(`Node ${nodeId} and its related edges have been deleted.`)
  }

  /**
   * Adds a new edge (connection) between two nodes.
   *
   * @param {object} payload
   * @param {string} payload.source         - The ID of the source node.
   * @param {string} payload.target         - The ID of the target node.
   * @param {string} [payload.sourceHandle] - Optional source handle ID.
   * @param {string} [payload.targetHandle] - Optional target handle ID.
   */
  function addEdge({ source, target, sourceHandle, targetHandle }) {
    // Check if source and target nodes exist
    const sourceNode = nodes.value.find((node) => node.id === source)
    const targetNode = nodes.value.find((node) => node.id === target)

    if (!sourceNode) {
      console.warn(`Source node with id ${source} not found.`)
      return
    }

    if (!targetNode) {
      console.warn(`Target node with id ${target} not found.`)
      return
    }

    // Prevent self-connections
    if (source === target) {
      console.warn('不能連接節點到自己。')
      return
    }

    // Check if edge already exists with the same source handle
    const existingEdge = edges.value.find(
      (edge) =>
        edge.source === source &&
        edge.target === target &&
        edge.sourceHandle === sourceHandle,
    )

    if (existingEdge) {
      console.warn(
        `Edge from ${source} (handle: ${sourceHandle}) to ${target} already exists.`,
      )
      return
    }

    // Generate edge ID (include source handle if available for uniqueness)
    const edgeId = sourceHandle
      ? `edge_${source}_${sourceHandle}_to_${target}`
      : `edge_${source}_to_${target}`

    /** @type {FlowEdge} */
    const newEdge = {
      id: edgeId,
      source,
      target,
      sourceHandle,
      targetHandle,
    }

    edges.value.push(newEdge)
    console.log(`Edge added: ${source} -> ${target}`)

    // If source is an option node and sourceHandle is specified,
    // update the option's nextQuestionId
    if (sourceNode.type === 'option' && sourceHandle) {
      const option = sourceNode.options?.find((opt) => opt.id === sourceHandle)
      if (option) {
        option.nextQuestionId = target
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
      (node) => node.id === edgeToRemove.source,
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
      (edge) => edge.source === nodeId || edge.target === nodeId,
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
      source: params.source,
      target: params.target,
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
    // 計算一些統計資訊
    const questionNodes = nodes.value.filter((node) => node.type === 'question')
    const optionNodes = nodes.value.filter((node) => node.type === 'option')
    const totalOptions = optionNodes.reduce((total, node) => {
      return total + (node.options ? node.options.length : 0)
    }, 0)

    // 檢查流程的完整性
    const connectedNodeIds = new Set()
    edges.value.forEach((edge) => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })
    const isolatedNodes = nodes.value.filter(
      (node) => !connectedNodeIds.has(node.id),
    )

    const exportData = {
      version: '1.0.0',
      metadata: {
        exportDate: new Date().toISOString(),
        appName: 'QA Builder',
        appVersion: '1.0.0',
        nodeCount: nodes.value.length,
        edgeCount: edges.value.length,
        statistics: {
          questionNodes: questionNodes.length,
          optionNodes: optionNodes.length,
          totalOptions: totalOptions,
          isolatedNodes: isolatedNodes.length,
          connectedNodes: connectedNodeIds.size,
        },
        // 為未來功能預留欄位
        flowProperties: {
          hasStartNode: nodes.value.some((node) => node.type === 'question'),
          hasEndNodes: optionNodes.some(
            (node) =>
              node.options && node.options.some((opt) => !opt.nextQuestionId),
          ),
          maxDepth: null, // 可以在未來計算流程深度
          tags: [], // 可以在未來添加標籤功能
          description: '', // 可以在未來添加流程描述
        },
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

      // 詳細驗證匯入資料的結構
      if (!importData || typeof importData !== 'object') {
        console.error('Invalid JSON: 根物件格式不正確')
        return false
      }

      // 檢查版本相容性
      if (importData.version && importData.version !== '1.0.0') {
        console.warn(
          `版本不匹配：檔案版本 ${importData.version}，目前支援版本 1.0.0`,
        )
        // 繼續匯入，但發出警告
      }

      // 驗證必要欄位
      if (!importData.nodes || !Array.isArray(importData.nodes)) {
        console.error('Invalid JSON: nodes 陣列遺失或格式不正確')
        return false
      }

      if (!importData.edges || !Array.isArray(importData.edges)) {
        console.error('Invalid JSON: edges 陣列遺失或格式不正確')
        return false
      }

      // 驗證節點資料
      const validNodes = []
      const skippedNodes = []

      importData.nodes.forEach((node, index) => {
        // 檢查必要欄位
        if (
          !node.id ||
          !node.type ||
          !node.position ||
          typeof node.text !== 'string'
        ) {
          console.warn(`跳過無效節點 ${index}:`, node)
          skippedNodes.push({
            index,
            reason: '缺少必要欄位 (id, type, position, text)',
          })
          return
        }

        // 檢查節點類型
        if (node.type !== 'question' && node.type !== 'option') {
          console.warn(`跳過無效節點 ${index}: 未知類型 ${node.type}`)
          skippedNodes.push({ index, reason: `未知節點類型：${node.type}` })
          return
        }

        // 檢查位置格式
        if (
          (!node.position.x && node.position.x !== 0) ||
          (!node.position.y && node.position.y !== 0)
        ) {
          console.warn(`跳過無效節點 ${index}: 位置格式不正確`)
          skippedNodes.push({ index, reason: '位置格式不正確' })
          return
        }

        // 驗證選項節點的額外資料
        if (node.type === 'option') {
          if (!node.options || !Array.isArray(node.options)) {
            // 如果沒有 options 陣列，建立空陣列
            node.options = []
          } else {
            // 驗證每個選項
            node.options = node.options.filter((option, optIndex) => {
              if (!option.id || typeof option.text !== 'string') {
                console.warn(
                  `跳過節點 ${node.id} 中的無效選項 ${optIndex}:`,
                  option,
                )
                return false
              }
              return true
            })
          }
        }

        validNodes.push(node)
      })

      // 驗證邊資料
      const validEdges = []
      const skippedEdges = []

      importData.edges.forEach((edge, index) => {
        if (!edge.id || !edge.source || !edge.target) {
          console.warn(`跳過無效連線 ${index}:`, edge)
          skippedEdges.push({
            index,
            reason: '缺少必要欄位 (id, source, target)',
          })
          return
        }

        // 檢查連線的節點是否存在
        const sourceExists = validNodes.some((node) => node.id === edge.source)
        const targetExists = validNodes.some((node) => node.id === edge.target)

        if (!sourceExists || !targetExists) {
          console.warn(`跳過無效連線 ${index}: 參照的節點不存在`)
          skippedEdges.push({ index, reason: '參照的節點不存在' })
          return
        }

        validEdges.push(edge)
      })

      // 如果沒有有效資料，則失敗
      if (validNodes.length === 0) {
        console.error('匯入失敗：沒有有效的節點資料')
        return false
      }

      // 清除目前資料並匯入新資料
      nodes.value = []
      edges.value = []

      // 匯入有效的節點和邊
      nodes.value = validNodes
      edges.value = validEdges

      // 更新計數器以避免 ID 衝突
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

      // 報告匯入結果
      const summary = {
        imported: {
          nodes: validNodes.length,
          edges: validEdges.length,
        },
        skipped: {
          nodes: skippedNodes.length,
          edges: skippedEdges.length,
        },
      }

      console.log('匯入完成：', summary)

      if (skippedNodes.length > 0 || skippedEdges.length > 0) {
        console.warn('跳過的項目詳情：', { skippedNodes, skippedEdges })
      }

      return true
    } catch (error) {
      console.error('匯入流程資料失敗：', error)
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
