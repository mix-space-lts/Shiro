import type { AggregateRoot } from '@mix-space-lts/api-client'
import type { Metadata } from 'next'

import { getQueryClient } from '~/lib/query-client.server'
import { queries } from '~/queries/definition'

import { attachServerFetch } from './attach-fetch'

export const defineMetadata = <T extends Record<string, string>>(
  fn: (
    params: T,
    getAggregationData: () => Promise<AggregateRoot & { theme: any }>,
  ) => Promise<Partial<Metadata>>,
) => {
  const handler = async ({ params }: { params: T }): Promise<Metadata> => {
    const getData = async () => {
      const queryClient = getQueryClient()
      await attachServerFetch()
      return await queryClient.fetchQuery({
        ...queries.aggregation.root(),
      })
    }
    const result = await fn(params, getData).catch(() => ({}))

    return {
      ...result,
    }
  }

  return handler
}
