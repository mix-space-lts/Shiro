'use client'

import { useTranslations } from 'next-intl'

import { NotFoundSVG } from '~/components/common/404'

export const EmptyPage = () => {
  const t = useTranslations('error')

  return (
    <div className="center flex flex-col space-y-6">
      <NotFoundSVG className="w-1/2 max-w-[280px]" />
      <p>{t('404_description')}</p>
    </div>
  )
}
