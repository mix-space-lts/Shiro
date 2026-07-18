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
    injectCategories: item.injectCategories,
    injectPages: item.injectPages,
    subMenu: item.subMenu
      ? cloneHeaderMenuConfig(item.subMenu as IHeaderMenu[])
      : undefined,
  }))

/** 递归过滤掉 titleKey 在 disabledKeys 中的菜单项，并移除子菜单已清空的父级 */
const filterDisabledModules = (
  items: IHeaderMenu[],
  disabledKeys: Set<string>,
): IHeaderMenu[] =>
  items
    .filter((item) => !item.titleKey || !disabledKeys.has(item.titleKey))
    .map((item) => {
      const subMenu =
        item.subMenu && item.subMenu.length > 0
          ? filterDisabledModules(item.subMenu as IHeaderMenu[], disabledKeys)
          : item.subMenu

      return { ...item, subMenu }
    })
    .filter((item) => {
      if (!item.subMenu) return true
      if (item.subMenu.length === 0 && item.path === '#') return false
      return true
    })

/** 根据 injectCategories/injectPages 将动态内容合并到各菜单项的子菜单 */
function injectDynamicSubMenus(
  config: IHeaderMenu[],
  categories: import('@mix-space-lts/api-client').CategoryModel[] | null,
  pageMeta: { slug: string; title: string }[] | null,
): IHeaderMenu[] {
  return config.map((item) => {
    const staticSub = item.subMenu ?? []
    const hasCats = item.injectCategories && categories?.length
    const hasPages = item.injectPages && pageMeta

    if (!hasCats && !hasPages) return item

    // 按 item 属性声明顺序构建最终子菜单
    const result: IHeaderMenu[] = []
    for (const key of Object.keys(item)) {
      switch (key) {
        case 'subMenu':
          result.push(...staticSub)
          break
        case 'injectCategories':
          if (hasCats) {
            result.push(
              ...categories!.map((cat) => ({
                path: `/posts/${cat.slug}`,
                title: cat.name,
              })),
            )
          }
          break
        case 'injectPages':
          if (hasPages) {
            result.push(
              ...pageMeta!.map((page) => ({
                path: `/${page.slug}`,
                title: page.title,
              })),
            )
          }
          break
      }
    }

    if (result.length === 0) return item
    return { ...item, subMenu: result }
  })
}

/** 将用户自定义 NavItemConfig[] 转为内部 IHeaderMenu[]。
 *  先根据声明顺序解析 inject → subMenu，再转换，以尊重 YAML key 顺序。 */
function resolveAndConvertNavItems(
  items: NavItemConfig[],
  categories: import('@mix-space-lts/api-client').CategoryModel[] | null,
  pageMeta: { slug: string; title: string }[] | null,
): IHeaderMenu[] {
  return items.map((item) => {
    const hasCats = item.injectCategories && categories?.length
    const hasPages = item.injectPages && pageMeta
    const staticSub = item.subMenu?.length
      ? resolveAndConvertNavItems(item.subMenu, categories, pageMeta)
      : []

    if (!hasCats && !hasPages) {
      return {
        title: item.title || '',
        titleKey: item.titleKey,
        path: item.path,
        type: item.type,
        subMenu: staticSub.length
          ? (staticSub as IHeaderMenu['subMenu'])
          : undefined,
      }
    }

    // 按 item 属性声明顺序构建最终子菜单
    const result: IHeaderMenu[] = []
    for (const key of Object.keys(item)) {
      switch (key) {
        case 'subMenu':
          result.push(...(staticSub as IHeaderMenu[]))
          break
        case 'injectCategories':
          if (hasCats) {
            result.push(
              ...categories!.map((cat) => ({
                title: cat.name,
                path: `/posts/${cat.slug}`,
              })),
            )
          }
          break
        case 'injectPages':
          if (hasPages) {
            result.push(
              ...pageMeta!.map((page) => ({
                title: page.title,
                path: `/${page.slug}`,
              })),
            )
          }
          break
      }
    }

    return {
      title: item.title || '',
      titleKey: item.titleKey,
      path: item.path,
      type: item.type,
      subMenu: result.length ? (result as IHeaderMenu['subMenu']) : undefined,
    }
  })
}

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

  const headerMenuConfig = useMemo(() => {
    // 根据配置收集禁用模块的 titleKey
    const disabledKeys = new Set<string>()
    if (travelEnabled === false) disabledKeys.add('nav_travel')
    if (friendsEnabled === false) disabledKeys.add('nav_friends')
    if (projectsEnabled === false) disabledKeys.add('nav_projects')
    if (saysEnabled === false) disabledKeys.add('nav_says')
    if (thinkingEnabled === false) disabledKeys.add('nav_thinking')
    if (notesEnabled === false) disabledKeys.add('nav_notes')
    if (timelineEnabled === false) disabledKeys.add('nav_timeline')
    if (noteTopicsEnabled === false) disabledKeys.add('nav_topics')

    // 自定义 nav 覆写
    if (navItems?.length) {
      let config = resolveAndConvertNavItems(navItems, categories, pageMeta)

      // enable 开关过滤自定义 nav（仅影响 navbar 渲染，路由仍由 page 级 enable 检查控制）
      if (disabledKeys.size > 0) {
        config = filterDisabledModules(config, disabledKeys)
      }

      return config
    }

    // 默认流程
    let config = cloneHeaderMenuConfig(baseHeaderMenuConfig)

    config = injectDynamicSubMenus(config, categories, pageMeta)

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
  ])

  return (
    <HeaderMenuConfigContext
      value={useMemo(() => ({ config: headerMenuConfig }), [headerMenuConfig])}
    >
      {children}
    </HeaderMenuConfigContext>
  )
}
