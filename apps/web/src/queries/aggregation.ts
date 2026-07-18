'use client'

import type { AggregateRoot } from '@mix-space-lts/api-client'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { defaultThemeConfig } from '~/app.default.theme-config'
import { appStaticConfig } from '~/app.static.config'
import { deepMerge } from '~/lib/lodash'
import { apiClient } from '~/lib/request'

export const aggregationQueryKey = ['aggregate', 'shiro'] as const

export type AggregationQueryData = AggregateRoot & {
  theme: AppThemeConfig
}

/**
 * 客户端 aggregation 数据查询 hook。
 *
 * 配置由 appStaticConfig.aggregationRefresh 控制（可被 NEXT_PUBLIC_* 环境变量覆盖）：
 *   - staleTime：默认 30 秒，此期间内导航不重新请求
 *   - refetchOnMount：默认 true，挂载时检查新鲜度
 *   - refetchOnWindowFocus：默认 true，窗口聚焦时检查新鲜度
 *
 * 与服务端 fetchAggregationData 共享 queryKey，确保缓存一致性。
 */
export const useAggregationQuery = () => {
  const { data, ...rest } = useQuery({
    queryKey: aggregationQueryKey,
    queryFn: async () => {
      const result = await apiClient.aggregate.getAggregateData('shiro')
      const theme = result.theme
        ? deepMerge(defaultThemeConfig, result.theme)
        : defaultThemeConfig

      return {
        ...result,
        theme,
      } as unknown as AggregationQueryData
    },
    staleTime: appStaticConfig.aggregationRefresh.staleTime,
    refetchOnMount: appStaticConfig.aggregationRefresh.refetchOnMount,
    refetchOnWindowFocus:
      appStaticConfig.aggregationRefresh.refetchOnWindowFocus,
    gcTime: appStaticConfig.cache.ttl.aggregation * 1000,
  })

  const memoized = useMemo(() => data ?? null, [data])

  return { data: memoized, ...rest }
}
