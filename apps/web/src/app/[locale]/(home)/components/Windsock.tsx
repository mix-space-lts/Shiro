'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { m } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { ReactElement, SVGProps } from 'react'
import { createElement, useMemo } from 'react'

import {
  NAV_ICON_MAP,
  type NavIconKey,
} from '~/components/layout/header/config'
import { usePresentSubscribeModal } from '~/components/modules/subscribe'
import { StyledButton } from '~/components/ui/button'
import { NumberSmoothTransition } from '~/components/ui/number-transition/NumberSmoothTransition'
import { Link } from '~/i18n/navigation'
import { preventDefault } from '~/lib/dom'
import { apiClient } from '~/lib/request'
import { toast } from '~/lib/toast'
import { useAppConfigSelector } from '~/providers/root/aggregation-data-provider'

function isImageSrc(s: string) {
  return s.startsWith('data:') || s.startsWith('http')
}

function resolveIcon(icon: string | undefined): WindsockItem['icon'] {
  if (!icon) return undefined
  if (icon in NAV_ICON_MAP) return NAV_ICON_MAP[icon as NavIconKey]
  if (isImageSrc(icon)) {
    return function ImgIcon(props: SVGProps<SVGSVGElement>) {
      return createElement('img', {
        ...props,
        src: icon,
        alt: '',
        className: 'w-6 h-6',
      })
    }
  }
  return undefined
}

interface WindsockItem {
  title: string
  path: string
  icon?: (props: SVGProps<SVGSVGElement>) => ReactElement
  do?: () => void
}

export const Windsock = () => {
  const t = useTranslations('common')
  const windsockItems = useAppConfigSelector((c) => c.module?.windsock?.items)
  const navItems = useAppConfigSelector((c) => c.module?.nav?.items)

  const windsock = useMemo<WindsockItem[]>(() => {
    // 从 config 拿 items（deepMerge 已合并默认/自定义）
    if (windsockItems?.length) {
      return windsockItems.map((item) => ({
        title: item.titleKey
          ? t(item.titleKey as any)
          : item.title || item.path,
        path: item.path,
        icon: resolveIcon(item.icon),
      }))
    }

    // 有自定义 nav → 从 nav 顶级项生成
    if (navItems?.length) {
      return navItems
        .filter(
          (item) =>
            !!item.path && item.path !== '/' && !item.path.startsWith('#'),
        )
        .map((item) => ({
          title: item.titleKey
            ? t(item.titleKey as any)
            : item.title || item.path,
          path: item.path,
          icon: resolveIcon(item.icon),
        }))
    }

    return []
  }, [windsockItems, navItems, t])

  const likeQueryKey = ['site-like']
  const { data: count } = useQuery({
    queryKey: likeQueryKey,
    queryFn: () => apiClient.proxy('like_this').get(),
    refetchInterval: 1000 * 60 * 5,
  })

  const queryClient = useQueryClient()
  const navigate = useRouter()

  const { present: presentSubscribe } = usePresentSubscribeModal()
  return (
    <>
      <div className="center mt-28 flex flex-col">
        <div className="my-5 text-2xl font-medium">{t('windsock_title')}</div>
        <div className="mb-24 opacity-90">{t('windsock_subtitle')}</div>
        <ul className="flex flex-col flex-wrap gap-2 gap-y-8 opacity-80 lg:flex-row">
          {windsock.map((item, index) => (
            <m.li
              initial={{ opacity: 0.0001, y: 10 }}
              viewport={{ once: true }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  stiffness: 641,
                  damping: 23,
                  mass: 3.9,
                  type: 'spring',
                  delay: index * 0.05,
                },
              }}
              transition={{
                delay: 0.001,
              }}
              key={index}
              className="flex items-center cursor-pointer justify-between text-sm duration-200 group"
              onClick={() => {
                item.do?.()

                navigate.push(item.path)
              }}
            >
              <Link
                href={item.path}
                className="flex items-center gap-4 text-neutral duration-200 group-hover:text-accent! dark:text-neutral-200 group-hover:-translate-y-2!"
                onClick={preventDefault}
              >
                {item.icon &&
                  createElement(item.icon, { className: 'w-6 h-6' })}
                <span>{item.title}</span>
              </Link>

              {index != windsock.length - 1 && (
                <span className="mx-4 hidden select-none lg:inline"> · </span>
              )}
            </m.li>
          ))}
        </ul>
      </div>

      <div className="mt-24 flex justify-center gap-4">
        <StyledButton
          className="center flex gap-2 bg-red-400"
          onClick={() => {
            apiClient
              .proxy('like_this')
              .post()
              .then(() => {
                queryClient.setQueryData(likeQueryKey, (prev: any) => prev + 1)
              })

            toast.success(t('thanks'), {
              iconElement: (
                <m.i
                  className="i-mingcute-heart-fill text-error"
                  initial={{
                    scale: 0.96,
                  }}
                  animate={{
                    scale: 1.22,
                  }}
                  transition={{
                    ease: 'easeInOut',
                    delay: 0.3,
                    repeat: 5,
                    repeatDelay: 0.3,
                  }}
                />
              ),
            })
          }}
        >
          {t('like_site')} <i className="i-mingcute-heart-fill" />{' '}
          <NumberSmoothTransition>
            {count as any as string}
          </NumberSmoothTransition>
        </StyledButton>

        <StyledButton
          className="center flex gap-2"
          onClick={() => {
            presentSubscribe()
          }}
        >
          {t('subscribe')}
          <i className="i-material-symbols-notifications-active" />
        </StyledButton>
      </div>
    </>
  )
}
