'use client'

import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { useIsOwnerLogged } from '~/atoms/hooks/owner'
import { CreateSayButton } from '~/components/modules/say/Button'
import { useSayListQuery } from '~/components/modules/say/hooks'
import { SayMasonry } from '~/components/modules/say/SayMasonry'
import { NothingFound } from '~/components/modules/shared/NothingFound'
import { FullPageLoading } from '~/components/ui/loading'
import { useAppConfigSelector } from '~/providers/root/aggregation-data-provider'

export default function Page() {
  const t = useTranslations('says')
  const saysEnabled = useAppConfigSelector(
    (config) => config.module?.says?.enable ?? true,
  )
  if (saysEnabled === false) notFound()
  const { data, isLoading, status } = useSayListQuery()
  const isLogged = useIsOwnerLogged()

  if (isLoading || status === 'pending') {
    return <FullPageLoading />
  }

  if (!data || data.pages.length === 0) return <NothingFound />

  return (
    <div>
      <header className="mb-[80px] flex items-center gap-3 text-3xl">
        <h1 className="text-4xl font-bold">{t('page_title')}</h1>

        <a
          data-event="Say RSS click"
          href="/says/feed"
          target="_blank"
          className="center flex size-8 text-[#EE802F]"
          rel="noreferrer"
        >
          <i className="i-mingcute-rss-fill" />
        </a>
        {isLogged && <CreateSayButton />}
      </header>

      <main className="mt-10">
        <SayMasonry />
      </main>
    </div>
  )
}
