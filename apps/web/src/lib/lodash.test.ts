import { describe, expect, test, vi } from 'vitest'

import { deepMerge } from './lodash'

describe('deepMerge', () => {
  test('合并标量：source 覆盖 target', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3 }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 3 })
  })

  test('合并对象：递归深度合并', () => {
    const target = { a: { x: 1, y: 2 } }
    const source = { a: { y: 3 } }
    expect(deepMerge(target, source)).toEqual({ a: { x: 1, y: 3 } })
  })

  test('合并数组：按 path 匹配合并', () => {
    const target = {
      items: [
        { path: '/a', title: 'A', icon: 'a-icon' },
        { path: '/b', title: 'B' },
      ],
    }
    const source = {
      items: [{ path: '/a', title: 'A Updated' }],
    }
    expect(deepMerge(target, source)).toEqual({
      items: [
        { path: '/a', title: 'A Updated', icon: 'a-icon' },
        { path: '/b', title: 'B' },
      ],
    })
  })

  test('合并数组：无匹配 path 则追加', () => {
    const target = { items: [{ path: '/a', title: 'A' }] }
    const source = { items: [{ path: '/c', title: 'C' }] }
    expect(deepMerge(target, source)).toEqual({
      items: [
        { path: '/a', title: 'A' },
        { path: '/c', title: 'C' },
      ],
    })
  })

  test('合并数组：无 path 字段直接追加', () => {
    const target = { items: [{ path: '/a', title: 'A' }] }
    const source = { items: [{ title: 'NoPath' }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ path: '/a', title: 'A' }, { title: 'NoPath' }],
    })
  })

  test('合并数组：source 带 path 覆盖 + 追加混合', () => {
    const target = {
      items: [
        { path: '/a', title: 'A' },
        { path: '/b', title: 'B' },
      ],
    }
    const source = {
      items: [
        { path: '/a', title: 'A Updated' },
        { path: '/c', title: 'C' },
        { title: 'NoPath' },
      ],
    }
    expect(deepMerge(target, source)).toEqual({
      items: [
        { path: '/a', title: 'A Updated' },
        { path: '/b', title: 'B' },
        { path: '/c', title: 'C' },
        { title: 'NoPath' },
      ],
    })
  })
})

describe('deepMerge replace: true', () => {
  test('replace: true 清除 target key 后合并', () => {
    const target = {
      nav: {
        title: 'Default',
        items: [{ path: '/a' }, { path: '/b' }],
      },
    }
    const source = {
      nav: {
        replace: true,
        title: 'Custom',
        items: [{ path: '/c' }],
      },
    }
    // nav 的 target 被清除 → 只剩 source 的 nav
    expect(deepMerge(target, source)).toEqual({
      nav: {
        title: 'Custom',
        items: [{ path: '/c' }],
      },
    })
  })

  test('replace: true 嵌套递归处理', () => {
    const target = {
      module: {
        nav: {
          items: [
            { path: '/a', title: 'A' },
            { path: '/b', title: 'B' },
          ],
          footer: { text: 'default' },
        },
        theme: 'light',
      },
    }
    const source = {
      module: {
        replace: true,
        nav: {
          replace: true,
          items: [{ path: '/c', title: 'C' }],
        },
      },
    }
    // module 被清除 → 只剩 nav，nav 也被清除 → 只剩 items
    expect(deepMerge(target, source)).toEqual({
      module: {
        nav: {
          items: [{ path: '/c', title: 'C' }],
        },
      },
    })
  })

  test('数组元素级 replace: true 清除该项默认值', () => {
    const target = {
      items: [
        { path: '/a', title: 'A', subMenu: [{ path: '/a1' }, { path: '/a2' }] },
        { path: '/b', title: 'B' },
      ],
    }
    const source = {
      items: [
        {
          path: '/a',
          replace: true,
          title: 'A Replaced',
          subMenu: [{ path: '/new' }],
        },
      ],
    }
    // /a 被清除后从零定义，丢失了 /a1, /a2
    expect(deepMerge(target, source)).toEqual({
      items: [
        { path: '/a', title: 'A Replaced', subMenu: [{ path: '/new' }] },
        { path: '/b', title: 'B' },
      ],
    })
  })

  test('replace 中间态不影响兄弟 key', () => {
    const target = { a: { x: 1 }, b: { y: 2 } }
    const source = {
      a: { replace: true, m: 0 },
      b: { z: 3 },
    }
    expect(deepMerge(target, source)).toEqual({
      a: { m: 0 },
      b: { y: 2, z: 3 },
    })
  })

  test('replace 后 key 不在 target 中仍然可以 merge', () => {
    const target = { a: { x: 1 } }
    const source = {
      b: { replace: true, c: 2 },
    }
    // b 不在 target 中，replace 不会有作用，但会被当作新键 merge
    expect(deepMerge(target, source)).toEqual({
      a: { x: 1 },
      b: { c: 2 },
    })
  })

  test('嵌套 replace: true 触发 console.info 并安全忽略', () => {
    const target = { a: { x: 1, y: 2 } }
    const source = {
      a: {
        replace: true,
        b: { replace: true, z: 3 },
        c: { m: 4 },
      },
    }
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { b: { z: 3 }, c: { m: 4 } } })
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Redundant "replace: true"'),
    )
    infoSpy.mockRestore()
  })

  test('replace: false 在祖先 replace: true 下触发 console.warn', () => {
    const target = { a: { x: 1 } }
    const source = {
      a: {
        replace: true,
        b: { replace: false, y: 2 },
      },
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { b: { y: 2 } } })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Conflicting "replace: false"'),
    )
    warnSpy.mockRestore()
  })
})

describe('deepMerge idKey', () => {
  test('自定义 idKey: 按 titleKey 合并数组', () => {
    const target = {
      items: [
        { titleKey: 'nav_home', path: '/', icon: 'home' },
        { titleKey: 'nav_posts', path: '/posts', icon: 'posts' },
      ],
    }
    const source = {
      items: [
        { titleKey: 'nav_posts', title: 'Blog' },
        { titleKey: 'nav_about', path: '/about', icon: 'info' },
      ],
    }
    expect(deepMerge(target, source, 'titleKey')).toEqual({
      items: [
        { titleKey: 'nav_home', path: '/', icon: 'home' },
        { titleKey: 'nav_posts', path: '/posts', icon: 'posts', title: 'Blog' },
        { titleKey: 'nav_about', path: '/about', icon: 'info' },
      ],
    })
  })

  test('自定义 idKey: 对象方式传参', () => {
    const target = {
      items: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ],
    }
    const source = { items: [{ id: 1, name: 'A Updated' }] }
    expect(deepMerge(target, source, { idKey: 'id' })).toEqual({
      items: [
        { id: 1, name: 'A Updated' },
        { id: 2, name: 'B' },
      ],
    })
  })

  test('idKey 为数字类型也能匹配', () => {
    const target = {
      items: [
        { num: 100, val: 'a' },
        { num: 200, val: 'b' },
      ],
    }
    const source = { items: [{ num: 100, val: 'updated' }] }
    expect(deepMerge(target, source, { idKey: 'num' })).toEqual({
      items: [
        { num: 100, val: 'updated' },
        { num: 200, val: 'b' },
      ],
    })
  })
})
