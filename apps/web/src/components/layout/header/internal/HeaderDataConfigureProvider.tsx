'use client'

import { createContext, use, useMemo } from 'react'

import {
  useAggregationSelector,
  useAppConfigSelector,
} from '~/providers/root/aggregation-data-provider'

import type { IHeaderMenu } from '../config'
import { resolveNavIcon } from '../config'

const HeaderMenuConfigContext = createContext<IHeaderMenu[]>([])

export const useHeaderConfig = () => use(HeaderMenuConfigContext)

/** 递归过滤掉 titleKey 在 disabledKeys 中的菜单项，并移除子菜单已清空的父级 */
export function filterDisabledModules(
  items: IHeaderMenu[],
  disabledKeys: Set<string>,
): IHeaderMenu[] {
  return items
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
}

/** 根据 injectCategories/injectPages 将动态内容按声明顺序合并到子菜单 */
export function injectDynamicSubMenus(
  items: IHeaderMenu[],
  categories: import('@mix-space-lts/api-client').CategoryModel[] | null,
  pageMeta: { slug: string; title: string }[] | null,
): IHeaderMenu[] {
  return items.map((item) => {
    const hasCats = item.injectCategories && categories?.length
    const hasPages = item.injectPages && pageMeta

    if (!hasCats && !hasPages) return item

    const result: IHeaderMenu[] = []
    for (const key of Object.keys(item)) {
      if (key === 'subMenu') {
        result.push(...(item.subMenu ?? []))
      } else if (key === 'injectCategories' && hasCats) {
        result.push(
          ...categories!.map((cat) => ({
            path: `/posts/${cat.slug}`,
            title: cat.name,
          })),
        )
      } else if (key === 'injectPages' && hasPages) {
        result.push(
          ...pageMeta!.map((page) => ({
            path: `/${page.slug}`,
            title: page.title,
          })),
        )
      }
    }

    return result.length ? { ...item, subMenu: result } : item
  })
}

/** 递归解析所有 string icon → React 元素 */
export function resolveIcons(items: IHeaderMenu[]): IHeaderMenu[] {
  return items.map((item) => ({
    ...item,
    icon: typeof item.icon === 'string' ? resolveNavIcon(item.icon) : item.icon,
    subMenu: item.subMenu
      ? resolveIcons(item.subMenu as IHeaderMenu[])
      : undefined,
  }))
}

export const HeaderDataConfigureProvider: Component = ({ children }) => {
  const pageMeta = useAggregationSelector((a) => a.pageMeta)
  const categories = useAggregationSelector((a) => a.categories)
  const postListViewMode = useAppConfigSelector((c) => c.module?.posts?.mode)
  const travelEnabled = useAppConfigSelector(
    (c) => c.module?.travel?.enable ?? true,
  )
  const friendsEnabled = useAppConfigSelector(
    (c) => c.module?.friends?.enable ?? true,
  )
  const projectsEnabled = useAppConfigSelector(
    (c) => c.module?.projects?.enable ?? true,
  )
  const saysEnabled = useAppConfigSelector(
    (c) => c.module?.says?.enable ?? true,
  )
  const thinkingEnabled = useAppConfigSelector(
    (c) => c.module?.thinking?.enable ?? true,
  )
  const notesEnabled = useAppConfigSelector(
    (c) => c.module?.notes?.enable ?? true,
  )
  const timelineEnabled = useAppConfigSelector(
    (c) => c.module?.timeline?.enable ?? true,
  )
  const noteTopicsEnabled = useAppConfigSelector(
    (c) => c.module?.noteTopics?.enable ?? true,
  )
  const navItems = useAppConfigSelector(
    (c) => (c.module?.nav?.items ?? []) as NavItemConfig[],
  )

  const config = useMemo(() => {
    let items = navItems.map(
      (item): IHeaderMenu => ({
        title: item.title || '',
        titleKey: item.titleKey,
        path: item.path,
        type: item.type,
        exclude: item.exclude,
        search: item.search,
        injectCategories: item.injectCategories,
        injectPages: item.injectPages,
        icon: item.icon,
        subMenu: item.subMenu
          ? (item.subMenu.map((sub) => ({
              title: sub.title || '',
              titleKey: sub.titleKey,
              path: sub.path,
              icon: sub.icon,
            })) as IHeaderMenu['subMenu'])
          : undefined,
      }),
    )

    // 动态注入
    items = injectDynamicSubMenus(items, categories, pageMeta)

    // 文章列表视图模式
    if (postListViewMode) {
      const postIdx = items.findIndex((i) => i.titleKey === 'nav_posts')
      if (postIdx !== -1) {
        items = items.map((item, idx) =>
          idx !== postIdx
            ? item
            : {
                ...item,
                search: { ...item.search, view_mode: postListViewMode },
              },
        )
      }
    }

    // 过滤禁用模块
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
      items = filterDisabledModules(items, disabledKeys)
    }

    return resolveIcons(items)
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
    <HeaderMenuConfigContext value={config}>{children}</HeaderMenuConfigContext>
  )
}
