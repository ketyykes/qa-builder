// @ts-check

/**
 * @typedef {import('../types/flow.d').FlowData}     FlowData
 *
 * @typedef {import('../types/flow.d').FlowNode}     InternalFlowNode
 *
 * @typedef {import('../types/flow.d').FlowEdge}     InternalFlowEdge
 *
 * @typedef {import('../types/flow.d').NodePosition} NodePosition
 *
 * @typedef {import('../types/flow.d').QuestionNode} QuestionNode
 *
 * @typedef {import('../types/flow.d').OptionNode}   OptionNode
 */

/**
 * Vue Flow 節點的簡化介面
 *
 * @typedef  {object}                 VueFlowNode
 * @property {string}                 id
 * @property {string}                 type        - 用於指定自訂節點組件的類型
 * @property {NodePosition}           position
 * @property {{ text: string } | any} data        - 儲存節點的特定資料，例如文字內容，any 用於彈性
 */

/**
 * Vue Flow 邊的簡化介面
 *
 * @typedef  {object} VueFlowEdge
 * @property {string} id
 * @property {string} source         - 起點節點 ID
 * @property {string} target         - 終點節點 ID
 * @property {string} [sourceHandle]
 * @property {string} [targetHandle]
 */

/**
 * @typedef  {object}        VueFlowElements
 * @property {VueFlowNode[]} nodes
 * @property {VueFlowEdge[]} edges
 */

/**
 * 將我們內部的 FlowData 格式轉換為 Vue Flow 元件所需的格式。
 *
 * @param   {FlowData}        flowData - 內部儲存的流程圖資料。
 * @returns {VueFlowElements}          供 Vue Flow 使用的節點和邊的物件。
 */
export function transformToVueFlowElements(flowData) {
  const vueFlowNodes = flowData.nodes.map((internalNode) => {
    let nodeTypeForVueFlow = ''
    let displayLabel = ''

    switch (internalNode.type) {
      case 'question':
        nodeTypeForVueFlow = 'default' // 使用 Vue Flow 的預設節點樣式
        displayLabel = internalNode.text
        break
      case 'option': {
        nodeTypeForVueFlow = 'default' // 使用 Vue Flow 的預設節點樣式
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

    return {
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
  })

  const vueFlowEdges = flowData.edges.map((internalEdge) => ({
    id: internalEdge.id,
    source: internalEdge.sourceId,
    target: internalEdge.targetId,
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
