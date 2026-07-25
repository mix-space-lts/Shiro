import { describe, expect, test } from 'vitest'

import { defaultThemeConfig } from '../app.default.theme-config'
import { deepMerge } from './lodash'

describe('defaultThemeConfig schema integrity', () => {
  const navItems = defaultThemeConfig.config.module.nav?.items
  const windItems = defaultThemeConfig.config.module.windsock?.items

  test('默认 nav 有 7 个顶级项', () => {
    expect(navItems).toHaveLength(7)
  })

  test('默认 nav 每项都有 path', () => {
    for (const item of navItems ?? []) {
      expect(item.path).toEqual(expect.any(String))
    }
  })

  test('默认 nav 首页有 injectPages', () => {
    const home = navItems?.find((i) => i.titleKey === 'nav_home')
    expect(home?.injectPages).toBe(true)
  })

  test('默认 nav 文稿有 injectCategories', () => {
    const posts = navItems?.find((i) => i.titleKey === 'nav_posts')
    expect(posts?.injectCategories).toBe(true)
  })

  test('默认 nav 手记有专栏子菜单', () => {
    const notes = navItems?.find((i) => i.titleKey === 'nav_notes')
    expect(notes?.subMenu?.[0]?.titleKey).toBe('nav_topics')
  })

  test('默认 nav 时光有 3 个子菜单项', () => {
    const timeline = navItems?.find((i) => i.titleKey === 'nav_timeline')
    expect(timeline?.subMenu).toHaveLength(3)
  })

  test('默认 nav 更多有 3 个子菜单项', () => {
    const more = navItems?.find((i) => i.titleKey === 'nav_more')
    expect(more?.subMenu).toHaveLength(3)
  })

  test('默认 nav 专栏不在更多中', () => {
    const more = navItems?.find((i) => i.titleKey === 'nav_more')
    expect(
      more?.subMenu?.find((s) => s.titleKey === 'nav_topics'),
    ).toBeUndefined()
  })

  test('默认 nav 每个 icon 都是合法的 NAV_ICON_MAP key', async () => {
    const { NAV_ICON_MAP } = await import('../components/layout/header/config')
    const checkItems = (items: any[], path: string[] = []): void => {
      for (const item of items) {
        if (item.icon) {
          expect(NAV_ICON_MAP).toHaveProperty(item.icon)
        }
        if (item.subMenu) checkItems(item.subMenu, [...path, item.path])
      }
    }
    checkItems(navItems ?? [])
  })

  test('默认 windsock 有 items', () => {
    expect(windItems?.length).toBeGreaterThan(0)
    for (const item of windItems ?? []) {
      expect(item.path).toEqual(expect.any(String))
    }
  })

  test('默认 color 是成对数组（light/dark 一一对应）', () => {
    const { color } = defaultThemeConfig.config
    expect(Array.isArray(color)).toBe(true)
    expect(color?.length).toBeGreaterThan(0)
    for (const pair of color ?? []) {
      expect(typeof pair.light).toBe('string')
      expect(typeof pair.dark).toBe('string')
    }
  })
})

describe('deepMerge with defaultThemeConfig', () => {
  const base = defaultThemeConfig.config.module

  test('nav items 按 path 合并', () => {
    const source = {
      nav: {
        items: [{ path: '/posts', title: 'Blog' }],
      },
    }
    const result = deepMerge(base, source)
    const posts = result.nav?.items?.find((i: any) => i.path === '/posts')
    expect(posts?.title).toBe('Blog')
    // 其余字段保留默认
    expect(posts?.titleKey).toBe('nav_posts')
    expect(posts?.injectCategories).toBe(true)
  })

  test('$replace: true 清除整个 nav', () => {
    const source = {
      nav: {
        $replace: true,
        items: [{ path: '/', title: 'Home Only' }],
      },
    }
    const result = deepMerge(base, source)
    expect(result.nav?.items).toHaveLength(1)
    expect(result.nav?.items?.[0].path).toBe('/')
  })

  test('windsock 按 path 合并', () => {
    const source = {
      windsock: {
        items: [{ path: '/friends', title: 'Friends Updated' }],
      },
    }
    const result = deepMerge(base, source)
    const fri = result.windsock?.items?.find((i: any) => i.path === '/friends')
    expect(fri?.title).toBe('Friends Updated')
    expect(fri?.titleKey).toBe('windsock_friends')
  })

  test('module 级 $replace: true', () => {
    const source = {
      $replace: true,
      nav: {
        items: [{ path: '/', titleKey: 'nav_home' }],
      },
    }
    const result = deepMerge(base, source)
    // module 被完全替换，原有的 notes、timeline 等 enable 键消失
    expect(result.notes?.enable).toBeUndefined()
    expect(result.nav?.items).toHaveLength(1)
  })
})

describe('deepMerge color (paired structure)', () => {
  const base = defaultThemeConfig.config

  test('color 按 light 合并：匹配项覆盖，无匹配追加', () => {
    const source = {
      color: [
        { light: '#33A6B8', dark: '#NEW_DARK' },
        { light: '#NEW_LIGHT', dark: '#NEW_DARK2' },
      ],
    }
    const result = deepMerge(base, source)
    const color = result.color as AccentColor[]
    expect(color).toHaveLength(4) // 3 默认 + 1 新增
    // 第一项 dark 被覆盖
    expect(color[0]).toEqual({ light: '#33A6B8', dark: '#NEW_DARK' })
    // 新增项
    expect(color[3]).toEqual({ light: '#NEW_LIGHT', dark: '#NEW_DARK2' })
  })

  test('color $replace: true 清除整个默认数组', () => {
    const source = {
      color: [
        { $replace: true },
        { light: '#AAA', dark: '#BBB' },
        { light: '#CCC', dark: '#DDD' },
      ],
    }
    const result = deepMerge(base, source)
    const color = result.color as AccentColor[]
    expect(color).toEqual([
      { light: '#AAA', dark: '#BBB' },
      { light: '#CCC', dark: '#DDD' },
    ])
  })

  test('color 单项 $replace: true 按 light 匹配清除后重建', () => {
    const source = {
      color: [{ $replace: true, light: '#33A6B8', dark: '#REPLACED' }],
    }
    const result = deepMerge(base, source)
    const color = result.color as AccentColor[]
    expect(color).toHaveLength(3)
    expect(color[0]).toEqual({ light: '#33A6B8', dark: '#REPLACED' })
    // 其余默认项保留
    expect(color[1]).toEqual({ light: '#FF6666', dark: '#A0A7D4' })
  })

  test('color 用户配置含重复 light 不会被去重（idKey 匹配覆盖）', () => {
    // 用户故意重复 light 以影响随机概率 → 按 idKey 匹配，第二项覆盖第一项
    const source = {
      color: [
        { light: '#33A6B8', dark: '#D1' },
        { light: '#33A6B8', dark: '#D2' },
      ],
    }
    const result = deepMerge(base, source)
    const color = result.color as AccentColor[]
    // 两次都匹配默认第一项 → 第二次覆盖第一次
    expect(color[0]).toEqual({ light: '#33A6B8', dark: '#D2' })
    expect(color).toHaveLength(3)
  })
})
