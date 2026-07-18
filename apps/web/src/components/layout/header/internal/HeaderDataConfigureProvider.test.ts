import { describe, expect, test } from 'vitest'

import type { IHeaderMenu } from '../config'
import {
  filterDisabledModules,
  injectDynamicSubMenus,
  resolveIcons,
} from './HeaderDataConfigureProvider'

describe('filterDisabledModules', () => {
  const items: IHeaderMenu[] = [
    { title: '首页', titleKey: 'nav_home', path: '/' },
    { title: '友链', titleKey: 'nav_friends', path: '/friends' },
    {
      title: '更多',
      titleKey: 'nav_more',
      path: '#',
      subMenu: [
        { title: '项目', titleKey: 'nav_projects', path: '/projects' },
        { title: '跃迁', titleKey: 'nav_travel', path: '/travel' },
      ],
    },
  ]

  test('过滤掉 disabled key', () => {
    const disabled = new Set(['nav_friends'])
    const result = filterDisabledModules(items, disabled)
    expect(result.map((i) => i.titleKey)).toEqual(['nav_home', 'nav_more'])
  })

  test('子菜单递归过滤', () => {
    const disabled = new Set(['nav_travel'])
    const result = filterDisabledModules(items, disabled)
    const more = result.find((i) => i.titleKey === 'nav_more')
    expect(more?.subMenu?.map((s) => s.titleKey)).toEqual(['nav_projects'])
  })

  test('子菜单被清空的父级（path=#）移除', () => {
    const disabled = new Set(['nav_projects', 'nav_travel'])
    const result = filterDisabledModules(items, disabled)
    // "更多" 在过滤完子菜单后 path=# 且 subMenu 为空 → 删除
    expect(result.find((i) => i.titleKey === 'nav_more')).toBeUndefined()
  })

  test('普通项（path≠#）子菜单清空也保留', () => {
    const itemsWithSub: IHeaderMenu[] = [
      {
        title: '时光',
        titleKey: 'nav_timeline',
        path: '/timeline',
        subMenu: [
          {
            title: '回忆',
            titleKey: 'nav_memories',
            path: '/timeline?memory=1',
          },
        ],
      },
    ]
    const disabled = new Set(['nav_memories'])
    const result = filterDisabledModules(itemsWithSub, disabled)
    // 时光 path 不是 # → 保留
    expect(result.find((i) => i.titleKey === 'nav_timeline')).toBeTruthy()
    expect(result.find((i) => i.titleKey === 'nav_timeline')?.subMenu).toEqual(
      [],
    )
  })

  test('无 titleKey 的项不被过滤', () => {
    const itemsNoKey: IHeaderMenu[] = [
      { title: 'Custom', path: '/custom' },
      { title: 'Another', titleKey: 'nav_test', path: '/test' },
    ]
    const disabled = new Set(['nav_test'])
    const result = filterDisabledModules(itemsNoKey, disabled)
    expect(result.map((i) => i.title)).toEqual(['Custom'])
  })
})

describe('injectDynamicSubMenus', () => {
  const categories = [
    { id: '1', slug: 'tech', name: '技术' } as any,
    { id: '2', slug: 'life', name: '生活' } as any,
  ]
  const pages = [
    { slug: 'about', title: '关于' },
    { slug: 'friends-page', title: '友链' },
  ]

  test('无 inject 标记 → 原样返回', () => {
    const items: IHeaderMenu[] = [
      { title: '思考', titleKey: 'nav_thinking', path: '/thinking' },
    ]
    const result = injectDynamicSubMenus(items, categories, null)
    expect(result).toEqual(items)
  })

  test('injectCategories → 注入分类到子菜单', () => {
    const items: IHeaderMenu[] = [
      {
        title: '文稿',
        titleKey: 'nav_posts',
        path: '/posts',
        injectCategories: true,
      },
    ]
    const result = injectDynamicSubMenus(items, categories, null)
    expect(result[0].subMenu).toEqual([
      { path: '/posts/tech', title: '技术' },
      { path: '/posts/life', title: '生活' },
    ])
  })

  test('injectPages → 注入独立页到子菜单', () => {
    const items: IHeaderMenu[] = [
      {
        title: '首页',
        titleKey: 'nav_home',
        path: '/',
        injectPages: true,
      },
    ]
    const result = injectDynamicSubMenus(items, null, pages)
    expect(result[0].subMenu).toEqual([
      { path: '/about', title: '关于' },
      { path: '/friends-page', title: '友链' },
    ])
  })

  test('同时 injectCategories + injectPages', () => {
    const items: IHeaderMenu[] = [
      {
        title: '浏览',
        titleKey: 'nav_browse',
        path: '#',
        injectCategories: true,
        injectPages: true,
      },
    ]
    const result = injectDynamicSubMenus(items, categories, pages)
    // injectCategories 先声明 → 先注入分类
    expect(result[0].subMenu).toEqual([
      { path: '/posts/tech', title: '技术' },
      { path: '/posts/life', title: '生活' },
      { path: '/about', title: '关于' },
      { path: '/friends-page', title: '友链' },
    ])
  })

  test('有已有 subMenu → 注入项按声明顺序合并到已有项之后', () => {
    const items: IHeaderMenu[] = [
      {
        title: '文稿',
        titleKey: 'nav_posts',
        path: '/posts',
        subMenu: [{ title: 'RSS', titleKey: 'nav_rss', path: '/feed' }],
        injectCategories: true,
      },
    ]
    const result = injectDynamicSubMenus(items, categories, null)
    // subMenu 在 injectCategories 之前声明 → 先 subMenu 再 categories
    expect(result[0].subMenu).toEqual([
      { title: 'RSS', titleKey: 'nav_rss', path: '/feed' },
      { path: '/posts/tech', title: '技术' },
      { path: '/posts/life', title: '生活' },
    ])
  })

  test('data 为空时 inject 不生效', () => {
    const items: IHeaderMenu[] = [
      {
        title: '文稿',
        titleKey: 'nav_posts',
        path: '/posts',
        injectCategories: true,
      },
    ]
    const result = injectDynamicSubMenus(items, [], null)
    expect(result[0].subMenu).toBeFalsy()
  })
})

describe('resolveIcons', () => {
  test('string icon → React 元素', () => {
    const items: IHeaderMenu[] = [
      { title: '首页', titleKey: 'nav_home', path: '/', icon: 'home' },
    ]
    const result = resolveIcons(items)
    expect(typeof result[0].icon).toBe('object')
    expect(result[0].icon).not.toBe('home')
  })

  test('非 string icon 保持不变', () => {
    const items: IHeaderMenu[] = [
      { title: '首页', titleKey: 'nav_home', path: '/', icon: 42 as any },
    ]
    const result = resolveIcons(items)
    expect(result[0].icon).toBe(42)
  })

  test('递归解析子菜单 icon', () => {
    const items: IHeaderMenu[] = [
      {
        title: '时光',
        titleKey: 'nav_timeline',
        path: '/timeline',
        icon: 'timeline',
        subMenu: [
          {
            title: '文稿',
            titleKey: 'nav_posts',
            path: '/timeline?type=post',
            icon: 'timeline-post',
          },
        ],
      },
    ]
    const result = resolveIcons(items)
    expect(typeof result[0].icon).toBe('object')
    expect(typeof result[0].subMenu![0].icon).toBe('object')
  })
})
