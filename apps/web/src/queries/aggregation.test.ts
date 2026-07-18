import { describe, expect, test } from 'vitest'

import { appStaticConfig } from '~/app.static.config'

describe('aggregationRefresh config', () => {
  test('staleTime 默认 30 秒', () => {
    expect(appStaticConfig.aggregationRefresh.staleTime).toBe(30 * 1000)
  })

  test('refetchOnMount 默认 true', () => {
    expect(appStaticConfig.aggregationRefresh.refetchOnMount).toBe(true)
  })

  test('refetchOnWindowFocus 默认 true', () => {
    expect(appStaticConfig.aggregationRefresh.refetchOnWindowFocus).toBe(true)
  })
})

describe('useAggregationQuery queryKey', () => {
  test('queryKey 与服务端 fetchAggregationData 对齐', async () => {
    const { aggregationQueryKey } = await import('~/queries/aggregation')
    expect(aggregationQueryKey).toEqual(['aggregate', 'shiro'])
  })
})
