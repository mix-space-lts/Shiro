'use client'

import { differenceInDays } from 'date-fns'
import { useTranslations } from 'next-intl'

import { Banner } from '~/components/ui/banner'
import { RelativeTime } from '~/components/ui/relative-time'
import { useCurrentPostDataSelector } from '~/providers/post/CurrentPostDataProvider'
import { useAppConfigSelector } from '~/providers/root/aggregation-data-provider'

export const PostOutdate = () => {
  const t = useTranslations('post')
  const time = useCurrentPostDataSelector((s) => s?.modified)
  const outdatedDays =
    useAppConfigSelector((s) => s.module?.posts?.outdated_days) ?? 60

  if (!time || outdatedDays <= 0) {
    return null
  }
  return differenceInDays(new Date(), new Date(time)) > outdatedDays ? (
    <Banner className="my-10" type="warning">
      <span className="leading-[1.8]">
        {t('outdated_prefix')}
        <RelativeTime date={time} />
        {t('outdated_suffix')}
      </span>
    </Banner>
  ) : null
}
