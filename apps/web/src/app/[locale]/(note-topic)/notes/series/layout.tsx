import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { PropsWithChildren } from 'react'

import { NormalContainer } from '~/components/layout/container/Normal'

import { fetchAggregationData } from '../../../api'

export const generateMetadata = async (
  props: NextPageParams<{ locale: string }>,
): Promise<Metadata> => {
  const { locale } = await props.params
  const t = await getTranslations({
    namespace: 'common',
    locale,
  })
  return {
    title: t('page_title_topics'),
  }
}

export default async function Layout(props: PropsWithChildren) {
  const agg = await fetchAggregationData()
  if (agg.module?.noteTopics?.enable === false) notFound()

  return <NormalContainer>{props.children}</NormalContainer>
}
