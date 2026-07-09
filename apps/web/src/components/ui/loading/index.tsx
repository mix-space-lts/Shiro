'use client'

import { useEffect, useState } from 'react'
import { useMessages } from 'next-intl'

import { clsxm } from '~/lib/helper'

export type LoadingProps = {
  loadingText?: string
  useDefaultLoadingText?: boolean
}

const useRandomLoadingText = (): string | undefined => {
  const messages = useMessages() as {
    common?: { loading_default?: string[] }
  }
  const loadingMessages = messages?.common?.loading_default

  const [text, setText] = useState<string | undefined>(
    loadingMessages?.[0],
  )

  useEffect(() => {
    if (loadingMessages && loadingMessages.length > 1) {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length)
      setText(loadingMessages[randomIndex])
    }
  }, [loadingMessages])

  return text
}

export const Loading: Component<LoadingProps> = ({
  loadingText,
  className,
  useDefaultLoadingText = false,
}) => {
  const defaultLoadingText = useRandomLoadingText()
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
