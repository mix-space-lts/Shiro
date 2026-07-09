import type { AggregateRoot } from '@mix-space-lts/api-client'
import { isServer } from '@tanstack/react-query'

import { appStaticConfig } from '~/app.static.config'
import { apiClient } from '~/lib/request'

import { defineQuery } from '../helper'

const cacheTime = appStaticConfig.cache.enabled
  ? appStaticConfig.cache.ttl.aggregation * 1000
  : 1000 * 60 * 10

export const aggregation = {
  root: () =>
    defineQuery({
      queryKey: ['aggregation'],
      queryFn: async () =>
        apiClient.aggregate.getAggregateData('shiro').then(
          (res) =>
            res.$serialized as AggregateRoot & {
              theme: AppThemeConfig
            },
        ),
      gcTime: cacheTime,
      staleTime: isServer ? cacheTime : undefined,
    }),
}
