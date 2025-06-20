// @ts-check
import { Position } from '@vue-flow/core'

/**
 * @import {FlowData,
 *   FlowNode as InternalFlowNode,
 *   FlowEdge as InternalFlowEdge,
 *   NodePosition,
 *   QuestionNode,
 *   OptionNode} from '../types/flow.d'
 */

/**
 * @import {VueFlowNode,
 *   VueFlowEdge,
 *   VueFlowElements} from '../types/vue-flow.d'
 */

/**
 * 將我們內部的 FlowData 格式轉換為 Vue Flow 元件所需的格式
 *
 * @type {(flowData: FlowData) => VueFlowElements}
 */
export function transformToVueFlowElements(flowData) {
  const vueFlowNodes = flowData.nodes.map((internalNode) => {
    let nodeTypeForVueFlow = ''
    let displayLabel = ''

    switch (internalNode.type) {
      case 'question':
        nodeTypeForVueFlow = 'questionNode' // 使用自定義問句節點
        displayLabel = internalNode.text
        break
      case 'option': {
        nodeTypeForVueFlow = 'optionNode' // 使用自定義選項節點
        const optionCount = internalNode.options
          ? internalNode.options.length
          : 0
        displayLabel = `${internalNode.text} (${optionCount}個選項)`
        break
      }
      default:
        // @ts-ignore
        console.warn(`未知節點類型：${internalNode.type}`)
        nodeTypeForVueFlow = 'default'
        // @ts-ignore
        displayLabel = internalNode.text
    }

    /** @type {VueFlowNode} */
    const vueFlowNode = {
      id: internalNode.id,
      type: nodeTypeForVueFlow,
      position: internalNode.position,
      data: {
        text: internalNode.text,
        nodeType: internalNode.type,
        options:
          internalNode.type === 'option' ? internalNode.options || [] : [],
      },
      label: displayLabel, // 這樣 Vue Flow 就會顯示節點文字
    }

    // Add connection handles for option nodes
    if (internalNode.type === 'option' && internalNode.options) {
      // Add source handles for each option
      vueFlowNode.sourcePosition = Position.Right // Options connect from the right

      // Store option handles in data for custom rendering if needed
      vueFlowNode.data.sourceHandles = internalNode.options.map((option) => ({
        id: option.id,
        type: 'source',
        position: Position.Right,
      }))
    }

    // Add target handle for question nodes
    if (internalNode.type === 'question') {
      vueFlowNode.targetPosition = Position.Left // Questions receive connections from the left
    }

    return vueFlowNode
  })

  const vueFlowEdges = flowData.edges.map((internalEdge) => ({
    id: internalEdge.id,
    source: internalEdge.sourceId,
    target: internalEdge.targetId,
    sourceHandle: internalEdge.sourceHandle,
    targetHandle: internalEdge.targetHandle,
  }))

  return {
    nodes: vueFlowNodes,
    edges: vueFlowEdges,
  }
}

/**
 * (未來可能需要) 將 Vue Flow 的元素轉換回我們內部的 FlowData 格式。
 *
 * @param   {VueFlowNode[]}     vueFlowNodes       - Vue Flow 的節點陣列。
 * @param   {VueFlowEdge[]}     vueFlowEdges       - Vue Flow 的邊陣列。
 * @param   {Partial<FlowData>} [existingFlowData]
 * @returns {FlowData}                             內部的 FlowData 格式。
 */
export function transformFromVueFlowElements(
  vueFlowNodes,
  vueFlowEdges,
  existingFlowData,
) {
  const internalNodes = vueFlowNodes.map((vfNode) => {
    /** @type {'question' | 'option'} */
    let internalType
    if (vfNode.type === 'questionNode') {
      internalType = 'question'
    } else if (vfNode.type === 'optionNode') {
      internalType = 'option'
    } else {
      console.warn(`未知 Vue Flow 節點類型用於反向轉換：${vfNode.type}`)
      internalType = 'question' // Fallback
    }

    const node = {
      id: vfNode.id,
      type: internalType,
      text: vfNode.data?.text || '',
      position: vfNode.position,
    }

    if (internalType === 'question') {
      return /** @type {QuestionNode} */ (/** @type {unknown} */ (node))
    } else {
      return /** @type {OptionNode} */ (/** @type {unknown} */ (node))
    }
  })

  const internalEdges = vueFlowEdges.map((vfEdge) => ({
    id: vfEdge.id,
    sourceId: vfEdge.source,
    targetId: vfEdge.target,
  }))

  return {
    version: existingFlowData?.version,
    metadata: existingFlowData?.metadata,
    nodes: /** @type {InternalFlowNode[]} */ (
      /** @type {unknown} */ (internalNodes)
    ),
    edges: internalEdges,
  }
}
