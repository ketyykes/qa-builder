// @ts-check
import { computed } from 'vue'

import { useFlowStore } from '@/stores/flow'

/** @import {UseFlowStatsReturn} from '@/types/composables.d' */

/**
 * 取得流程統計資料的 composable
 *
 * @type {() => UseFlowStatsReturn}
 */
export function useFlowStats() {
  const flowStore = useFlowStore()

  const questionNodesCount = computed(
    () => flowStore.nodes.filter((n) => n.type === 'question').length,
  )

  const optionNodesCount = computed(
    () => flowStore.nodes.filter((n) => n.type === 'option').length,
  )

  const edgesCount = computed(() => flowStore.edges.length)

  const totalNodesCount = computed(() => flowStore.nodes.length)

  const flowStats = computed(() => ({
    questionNodes: questionNodesCount.value,
    optionNodes: optionNodesCount.value,
    edges: edgesCount.value,
    totalNodes: totalNodesCount.value,
  }))

  return {
    questionNodesCount,
    optionNodesCount,
    edgesCount,
    totalNodesCount,
    flowStats,
  }
}
