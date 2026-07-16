'use client'

import { m } from 'motion/react'
import { useCallback } from 'react'

import { useResolveAdminUrl } from '~/atoms/hooks/url'
import { useViewport } from '~/atoms/hooks/viewport'
import { API_URL } from '~/constants/env'
import { useIsClient } from '~/hooks/common/use-is-client'
import { useSingleAndDoubleClick } from '~/hooks/common/use-single-double-click'
import { useRouter } from '~/i18n/navigation'
import { noopObj } from '~/lib/noop'
import { useAppConfigSelector } from '~/providers/root/aggregation-data-provider'

import { SiteOwnerAvatar } from './SiteOwnerAvatar'
import { useLiveQuery } from './useLiveQuery'

const TapableLogo = () => {
  const router = useRouter()

  const { data: isLiving } = useLiveQuery()

  const { liveId } = (useAppConfigSelector(
    (config) => config.module?.bilibili,
  ) || noopObj) as Bilibili

  const goLive = useCallback(() => {
    window.open(`https://live.bilibili.com/${liveId}`)
  }, [liveId])

  const resolveAdminUrl = useResolveAdminUrl()

  const getAdminLoginUrl = useCallback(() => {
    const configured = resolveAdminUrl()
    if (configured && configured !== '') {
      return `${configured}#/login?from=${encodeURIComponent(location.href)}`
    }
    // Fallback: derive from API_URL (usually Core and admin share same origin)
    try {
      const apiOrigin = new URL(API_URL, location.origin).origin
      return `${apiOrigin}/proxy/qaqdmin#/login?from=${encodeURIComponent(location.href)}`
    } catch {
      return ''
    }
  }, [resolveAdminUrl])

  const fn = useSingleAndDoubleClick(
    () => {
      if (isLiving) return goLive()
      router.push('/')
    },
    () => {
      const url = getAdminLoginUrl()
      if (url) location.href = url
    },
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={fn}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          fn()
        }
      }}
    >
      <SiteOwnerAvatar className="cursor-pointer" />
      <span className="sr-only">Owner Avatar</span>
    </div>
  )
}
export const AnimatedLogo = () => {
  const isDesktop = useViewport(($) => $.lg && $.w !== 0)

  const isClient = useIsClient()
  if (!isClient) return null

  if (isDesktop) return <TapableLogo />

  return (
    <m.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center will-change-[unset]!"
    >
      <TapableLogo />
    </m.div>
  )
}
