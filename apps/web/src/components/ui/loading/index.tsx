'use client'

import { useId } from 'react'

import { useTranslations } from 'next-intl'

import { clsxm } from '~/lib/helper'

export type LoadingProps = {
  loadingText?: string
  useDefaultLoadingText?: boolean
}

export const Loading: Component<LoadingProps> = ({
  loadingText,
  className,
  useDefaultLoadingText = false,
}) => {
  const t = useTranslations('common')
  const rawLoadingText = t.raw('loading_default')
  const id = useId()
  // 用 useId 提取确定性索引，避免 SSR/客户端 hydration mismatch
  const deterministicIndex =
    rawLoadingText && Array.isArray(rawLoadingText)
      ? id
          .split('')
          .filter((c) => /\d/.test(c))
          .map(Number)
          .reduce((a, b) => a + b, 0) % rawLoadingText.length
      : 0
  const defaultLoadingText = Array.isArray(rawLoadingText)
    ? rawLoadingText[deterministicIndex]
    : rawLoadingText
  const nextLoadingText = useDefaultLoadingText
    ? defaultLoadingText
    : loadingText
  return (
    <div
      data-hide-print
      className={clsxm('my-20 flex flex-col center', className)}
    >
      <span className="loading loading-ball loading-lg" />
      {!!nextLoadingText && (
        <span className="mt-6 block">{nextLoadingText}</span>
      )}
    </div>
  )
}

export const FullPageLoading = () => (
  <Loading useDefaultLoadingText className="h-[calc(100vh-6.5rem-10rem)]" />
)
