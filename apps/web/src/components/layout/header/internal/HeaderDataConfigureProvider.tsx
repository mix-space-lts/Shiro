'use client'

import { createContext, use, useEffect, useMemo, useState } from 'react'

import {
  useAggregationSelector,
  useAppConfigSelector,
} from '~/providers/root/aggregation-data-provider'

import type { IHeaderMenu } from '../config'
import { headerMenuConfig as baseHeaderMenuConfig } from '../config'

const HeaderMenuConfigContext = createContext({
  config: baseHeaderMenuConfig,
})

export const useHeaderConfig = () => use(HeaderMenuConfigContext)
const cloneHeaderMenuConfig = (items: IHeaderMenu[]): IHeaderMenu[] =>
  items.map((item) => ({
    ...item,
    icon: item.icon,
    titleKey: item.titleKey,
    search: item.search ? { ...item.search } : undefined,
    exclude: item.exclude ? [...item.exclude] : undefined,
    subMenu: item.subMenu
      ? cloneHeaderMenuConfig(item.subMenu as IHeaderMenu[])
      : undefined,
  }))

export const HeaderDataConfigureProvider: Component = ({ children }) => {
  const pagesMeta = useAggregationSelector(
    (aggregationData) =>
      (aggregationData as any).pageMeta as
        | Array<{ slug: string; title: string }>
        | undefined,
  )
  const postListViewMode = useAppConfigSelector(
    (appConfig) => appConfig.module?.posts?.mode,
  )

  const [headerMenuConfig, setHeaderMenuConfig] = useState(() =>
    cloneHeaderMenuConfig(baseHeaderMenuConfig),
  )

  useEffect(() => {
    if (!Array.isArray(pagesMeta)) return
    const nextMenuConfig = cloneHeaderMenuConfig(baseHeaderMenuConfig)
    const homeIndex = nextMenuConfig.findIndex((item) => item.type === 'Home')
    if (homeIndex !== -1) {
      nextMenuConfig[homeIndex].subMenu = pagesMeta.map((page) => ({
        path: `/${page.slug}`,
        title: page.title,
      }))
    }

    setHeaderMenuConfig(nextMenuConfig)
  }, [pagesMeta])

  useEffect(() => {
    setHeaderMenuConfig((config) => {
      const postIndex = config.findIndex((item) => item.type === 'Post')

      if (postIndex === -1 || !postListViewMode) {
        return config
      }

      return config.map((item, index) => {
        if (index !== postIndex) return item
        return {
          ...item,
          search: {
            ...item.search,
            view_mode: postListViewMode,
          },
        }
      })
    })
  }, [postListViewMode])

  return (
    <HeaderMenuConfigContext
      value={useMemo(() => ({ config: headerMenuConfig }), [headerMenuConfig])}
    >
      {children}
    </HeaderMenuConfigContext>
  )
}
