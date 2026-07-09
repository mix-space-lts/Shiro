'use client'

import { createContext, use, useMemo } from 'react'

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

/** 递归过滤掉所有 titleKey === 'nav_travel' 的菜单项（含子菜单） */
const filterNavTravel = (items: IHeaderMenu[]): IHeaderMenu[] =>
  items
    .filter((item) => item.titleKey !== 'nav_travel')
    .map((item) => ({
      ...item,
      subMenu: item.subMenu
        ? filterNavTravel(item.subMenu as IHeaderMenu[])
        : item.subMenu,
    }))

export const HeaderDataConfigureProvider: Component = ({ children }) => {
  const pageMeta = useAggregationSelector(
    (aggregationData) => aggregationData.pageMeta,
  )
  const postListViewMode = useAppConfigSelector(
    (appConfig) => appConfig.module?.posts?.mode,
  )
  const travelEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.travel?.enable ?? true,
  )

  const headerMenuConfig = useMemo(() => {
    let config = cloneHeaderMenuConfig(baseHeaderMenuConfig)

    // 注入独立页面到"首页"子菜单
    if (pageMeta) {
      const homeIndex = config.findIndex((item) => item.type === 'Home')
      if (homeIndex !== -1) {
        config[homeIndex].subMenu = pageMeta.map((page) => ({
          path: `/${page.slug}`,
          title: page.title,
        }))
      }
    }

    // 注入文章列表视图模式
    if (postListViewMode) {
      const postIndex = config.findIndex((item) => item.type === 'Post')
      if (postIndex !== -1) {
        config = config.map((item, index) => {
          if (index !== postIndex) return item
          return {
            ...item,
            search: {
              ...item.search,
              view_mode: postListViewMode,
            },
          }
        })
      }
    }

    // 根据配置过滤跃迁入口
    if (!travelEnabled) {
      config = filterNavTravel(config)
    }

    return config
  }, [pageMeta, postListViewMode, travelEnabled])

  return (
    <HeaderMenuConfigContext
      value={useMemo(() => ({ config: headerMenuConfig }), [headerMenuConfig])}
    >
      {children}
    </HeaderMenuConfigContext>
  )
}
