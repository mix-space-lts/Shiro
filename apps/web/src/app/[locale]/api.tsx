import type { AggregateRoot } from '@mix-space-lts/api-client'
import { simpleCamelcaseKeys } from '@mix-space-lts/api-client'

import { defaultThemeConfig } from '~/app.default.theme-config'
import { appStaticConfig } from '~/app.static.config'
import { attachServerFetch } from '~/lib/attach-fetch'
import { deepMerge } from '~/lib/lodash'
import { getQueryClient } from '~/lib/query-client.server'
import { apiClient } from '~/lib/request'

const cacheTime = appStaticConfig.cache.enabled
  ? appStaticConfig.cache.ttl.aggregation
  : 1
export const fetchAggregationData = async () => {
  await attachServerFetch()
  const queryClient = getQueryClient()
  const fetcher = async () => {
    const url = new URL(apiClient.aggregate.proxy.toString(true))
    url.searchParams.set('theme', 'shiro')

    const data = (await fetch(url.toString(), {
      next: { revalidate: cacheTime },
    })
      .then((res) => res.json())
      .then(simpleCamelcaseKeys)) as AggregateRoot & {
      theme: AppThemeConfig
    }

    return {
      ...data,
      theme: data.theme
        ? deepMerge(defaultThemeConfig, data.theme)
        : defaultThemeConfig,
    }
  }

  return queryClient.fetchQuery({
    queryKey: ['aggregate', 'shiro'],
    queryFn: fetcher,
    staleTime: cacheTime * 1000,
    gcTime: cacheTime * 1000,
  })
}
