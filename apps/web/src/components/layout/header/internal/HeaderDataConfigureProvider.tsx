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

/** 递归过滤掉 titleKey 在 disabledKeys 中的菜单项（含子菜单） */
const filterDisabledModules = (
  items: IHeaderMenu[],
  disabledKeys: Set<string>,
): IHeaderMenu[] =>
  items
    .filter((item) => !item.titleKey || !disabledKeys.has(item.titleKey))
    .map((item) => ({
      ...item,
      subMenu: item.subMenu
        ? filterDisabledModules(item.subMenu as IHeaderMenu[], disabledKeys)
        : item.subMenu,
    }))

/** 将用户自定义 NavItemConfig[] 转为内部 IHeaderMenu[] */
const convertNavItems = (items: NavItemConfig[]): IHeaderMenu[] =>
  items.map((item) => ({
    title: item.title || '',
    titleKey: item.titleKey,
    path: item.path,
    type: item.type,
    subMenu: item.subMenu
      ? (convertNavItems(item.subMenu) as IHeaderMenu['subMenu'])
      : undefined,
  }))

export const HeaderDataConfigureProvider: Component = ({ children }) => {
  const pageMeta = useAggregationSelector(
    (aggregationData) => aggregationData.pageMeta,
  )
  const categories = useAggregationSelector(
    (aggregationData) => aggregationData.categories,
  )
  const postListViewMode = useAppConfigSelector(
    (appConfig) => appConfig.module?.posts?.mode,
  )
  const travelEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.travel?.enable ?? true,
  )
  const friendsEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.friends?.enable ?? true,
  )
  const projectsEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.projects?.enable ?? true,
  )
  const saysEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.says?.enable ?? true,
  )
  const thinkingEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.thinking?.enable ?? true,
  )
  const notesEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.notes?.enable ?? true,
  )
  const timelineEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.timeline?.enable ?? true,
  )
  const noteTopicsEnabled = useAppConfigSelector(
    (appConfig) => appConfig.module?.noteTopics?.enable ?? true,
  )
  const navItems = useAppConfigSelector(
    (appConfig) => appConfig.module?.nav?.items,
  )
  const autoInjectCategories = useAppConfigSelector(
    (appConfig) => appConfig.module?.nav?.autoInjectCategories ?? true,
  )

  const headerMenuConfig = useMemo(() => {
    // 自定义 nav 覆写
    if (navItems?.length) {
      if (
        travelEnabled === false ||
        friendsEnabled === false ||
        projectsEnabled === false ||
        saysEnabled === false ||
        thinkingEnabled === false ||
        notesEnabled === false ||
        timelineEnabled === false ||
        noteTopicsEnabled === false
      ) {
        console.warn(
          '[Shiro] nav.items 已设置，module 下的 enable 开关已失效。路由访问由自定义 nav 结构决定。',
        )
      }

      const config = convertNavItems(navItems)

      // 仅当 autoInjectCategories 为 true 时注入分类
      if (autoInjectCategories && categories?.length) {
        const postIndex = config.findIndex((item) => item.type === 'Post')
        if (postIndex !== -1) {
          config[postIndex].subMenu = categories.map((cat) => ({
            path: `/posts/${cat.slug}`,
            title: cat.name,
          }))
        }
      }

      return config
    }

    // 默认流程
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

    // 注入分类列表到"文稿"子菜单
    if (categories?.length) {
      const postIndex = config.findIndex((item) => item.type === 'Post')
      if (postIndex !== -1) {
        config[postIndex].subMenu = categories.map((cat) => ({
          path: `/posts/${cat.slug}`,
          title: cat.name,
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

    // 根据配置过滤禁用板块的 menu 项（=== false 确保仅在明确禁用时过滤，加载中 null 不过滤）
    const disabledKeys = new Set<string>()
    if (travelEnabled === false) disabledKeys.add('nav_travel')
    if (friendsEnabled === false) disabledKeys.add('nav_friends')
    if (projectsEnabled === false) disabledKeys.add('nav_projects')
    if (saysEnabled === false) disabledKeys.add('nav_says')
    if (thinkingEnabled === false) disabledKeys.add('nav_thinking')
    if (notesEnabled === false) disabledKeys.add('nav_notes')
    if (timelineEnabled === false) disabledKeys.add('nav_timeline')
    if (noteTopicsEnabled === false) disabledKeys.add('nav_topics')

    if (disabledKeys.size > 0) {
      config = filterDisabledModules(config, disabledKeys)
    }

    return config
  }, [
    pageMeta,
    categories,
    postListViewMode,
    travelEnabled,
    friendsEnabled,
    projectsEnabled,
    saysEnabled,
    thinkingEnabled,
    notesEnabled,
    timelineEnabled,
    noteTopicsEnabled,
    navItems,
    autoInjectCategories,
  ])

  return (
    <HeaderMenuConfigContext
      value={useMemo(() => ({ config: headerMenuConfig }), [headerMenuConfig])}
    >
      {children}
    </HeaderMenuConfigContext>
  )
}
