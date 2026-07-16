import '~/components/modules/post/PostItem'

import type { Metadata } from 'next'

import { NormalContainer } from '~/components/layout/container/Normal'
import { PostPagination } from '~/components/modules/post'
import { PostItemComposer } from '~/components/modules/post/PostItemComposer'
import { NothingFound } from '~/components/modules/shared/NothingFound'
import { BackToTopFAB } from '~/components/ui/fab'
import { OnlyDesktop } from '~/components/ui/viewport'
import { apiClient } from '~/lib/request'
import { definePrerenderPage } from '~/lib/request.server'

import { fetchAggregationData } from '../../../api'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> => {
  const { category } = await params
  return { title: `分类：${category}` }
}

export default definePrerenderPage<{
  category: string
  page?: string
  size?: string
}>()({
  async fetcher({ category, page, size }) {
    const agg = await fetchAggregationData()
    const cat = agg.categories.find((c) => c.slug === category)

    return apiClient.post.getList(
      page ? Number.parseInt(page) : 1,
      size ? Number.parseInt(size) : 10,
      {
        categoryIds: cat ? [cat.id] : undefined,
        truncate: 310,
      },
    )
  },
  async Component({ data, params }) {
    const { data: posts, pagination } = data

    if (!posts?.length) return <NothingFound />

    return (
      <NormalContainer>
        <ul>
          {posts.map((item, index) => (
            <PostItemComposer key={item.id} data={item} index={index} />
          ))}
        </ul>

        {pagination.totalPage > 1 && <PostPagination pagination={pagination} />}

        <OnlyDesktop>
          <BackToTopFAB />
        </OnlyDesktop>
      </NormalContainer>
    )
  },
})
