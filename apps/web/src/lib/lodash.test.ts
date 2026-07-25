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

  test('合并数组：无 idKey 时追加不覆盖', () => {
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
        { path: '/a', title: 'A', icon: 'a-icon' },
        { path: '/b', title: 'B' },
        { path: '/a', title: 'A Updated' },
      ],
    })
  })

  test('合并数组：无 idKey 时深比较去重', () => {
    const target = { items: [{ a: 1, b: { c: 2 } }] }
    const source = { items: [{ b: { c: 2 }, a: 1 }, { a: 2 }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ a: 1, b: { c: 2 } }, { a: 2 }],
    })
  })

  test('合并数组：无 idKey 时深比较去重（位置无关）', () => {
    // {b:2} 和 {a:1} 分别与 target 中的同名项深比较相等 → 去重
    const target = { items: [{ a: 1 }, { b: 2 }] }
    const source = { items: [{ b: 2 }, { a: 1 }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ a: 1 }, { b: 2 }],
    })
  })

  test('合并数组：无 idKey 时对象 key 顺序不同仍算重复', () => {
    // isDeepEqual 对对象 key 顺序无关 → 视为相同元素 → 去重
    const target = { items: [{ a: 1, b: 2 }] }
    const source = { items: [{ b: 2, a: 1 }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ a: 1, b: 2 }],
    })
  })

  test('合并数组：无 idKey 时 source 项直接追加', () => {
    const target = { items: [{ path: '/a', title: 'A' }] }
    const source = { items: [{ title: 'NoPath' }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ path: '/a', title: 'A' }, { title: 'NoPath' }],
    })
  })

  test('合并数组：无 idKey 时原始类型数组去重合并', () => {
    // 标量数组也走深比较去重合并：source 中与 target 重复的元素被忽略，其余追加
    const target = { colors: ['red', 'green'] }
    const source = { colors: ['green', 'blue'] }
    expect(deepMerge(target, source)).toEqual({
      colors: ['red', 'green', 'blue'],
    })
  })

  test('合并数组：标量数组 source 内部重复元素也会被去重', () => {
    // 深比较去重是 full-scan：source 内部重复元素也会被去重
    const target = { colors: ['#33A6B8'] }
    const source = {
      colors: ['#FF6666', '#FF6666', '#26A69A'],
    }
    expect(deepMerge(target, source)).toEqual({
      colors: ['#33A6B8', '#FF6666', '#26A69A'],
    })
  })

  test('合并数组：无 idKey 时嵌套对象深比较去重', () => {
    const target = {
      items: [{ a: { x: [1, 2] }, b: 'hello' }],
    }
    const source = {
      items: [{ b: 'hello', a: { x: [1, 2] } }, { c: 'new' }],
    }
    expect(deepMerge(target, source)).toEqual({
      items: [{ a: { x: [1, 2] }, b: 'hello' }, { c: 'new' }],
    })
  })

  test('合并数组：无 idKey 时数组内数组顺序敏感', () => {
    // isDeepEqual 对数组顺序敏感 → [1,2] ≠ [2,1] → 不去重
    const target = { items: [{ arr: [1, 2] }] }
    const source = { items: [{ arr: [2, 1] }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ arr: [1, 2] }, { arr: [2, 1] }],
    })
  })

  test('合并数组：无 idKey 时空 source 数组保持 target', () => {
    const target = { items: [{ a: 1 }, { a: 2 }] }
    const source = { items: [] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ a: 1 }, { a: 2 }],
    })
  })

  test('合并数组：无 idKey 时空 target 数组使用 source', () => {
    const target = { items: [] as any[] }
    const source = { items: [{ a: 1 }, { a: 2 }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ a: 1 }, { a: 2 }],
    })
  })

  test('合并数组：无 idKey 时 source 含 null/undefined 不崩溃', () => {
    const target = { items: [{ a: 1 }] }
    const source = { items: [null, undefined, { a: 1 }, { b: 2 }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ a: 1 }, null, undefined, { b: 2 }],
    })
  })
})

describe('deepMerge $replace', () => {
  test('$replace: true 清除 target key 后合并', () => {
    const target = {
      nav: {
        title: 'Default',
        items: [{ path: '/a' }, { path: '/b' }],
      },
    }
    const source = {
      nav: {
        $replace: true,
        title: 'Custom',
        items: [{ path: '/c' }],
      },
    }
    expect(deepMerge(target, source)).toEqual({
      nav: {
        title: 'Custom',
        items: [{ path: '/c' }],
      },
    })
  })

  test('$replace: true 嵌套递归处理', () => {
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
        $replace: true,
        nav: {
          $replace: true,
          items: [{ path: '/c', title: 'C' }],
        },
      },
    }
    expect(deepMerge(target, source)).toEqual({
      module: {
        nav: {
          items: [{ path: '/c', title: 'C' }],
        },
      },
    })
  })

  test('数组元素级 $replace: true 清除该项默认值', () => {
    const target = {
      items: Object.assign(
        [
          {
            path: '/a',
            title: 'A',
            subMenu: [{ path: '/a1' }, { path: '/a2' }],
          },
          { path: '/b', title: 'B' },
        ],
        { $idkey: 'path' },
      ),
    }
    const source = {
      items: [
        {
          path: '/a',
          $replace: true,
          title: 'A Replaced',
          subMenu: [{ path: '/new' }],
        },
      ],
    }
    expect(deepMerge(target, source)).toEqual({
      items: [
        { path: '/a', title: 'A Replaced', subMenu: [{ path: '/new' }] },
        { path: '/b', title: 'B' },
      ],
    })
  })

  test('$replace 中间态不影响兄弟 key', () => {
    const target = { a: { x: 1 }, b: { y: 2 } }
    const source = {
      a: { $replace: true, m: 0 },
      b: { z: 3 },
    }
    expect(deepMerge(target, source)).toEqual({
      a: { m: 0 },
      b: { y: 2, z: 3 },
    })
  })

  test('$replace 后 key 不在 target 中仍然可以 merge', () => {
    const target = { a: { x: 1 } }
    const source = {
      b: { $replace: true, c: 2 },
    }
    expect(deepMerge(target, source)).toEqual({
      a: { x: 1 },
      b: { c: 2 },
    })
  })

  test('嵌套 $replace: true 触发 console.info 并安全忽略', () => {
    const target = { a: { x: 1, y: 2 } }
    const source = {
      a: {
        $replace: true,
        b: { $replace: true, z: 3 },
        c: { m: 4 },
      },
    }
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { b: { z: 3 }, c: { m: 4 } } })
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Redundant "$replace: true"'),
    )
    infoSpy.mockRestore()
  })

  test('$replace: false 在祖先 $replace: true 下触发 console.warn', () => {
    const target = { a: { x: 1 } }
    const source = {
      a: {
        $replace: true,
        b: { $replace: false, y: 2 },
      },
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { b: { y: 2 } } })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Conflicting "$replace: false"'),
    )
    warnSpy.mockRestore()
  })

  test('$replace: true 清除数组后用 source 数组替换', () => {
    const target = {
      items: [{ a: 1 }, { a: 2 }],
      other: 'keep',
    }
    const source = {
      items: { $replace: true, list: [{ a: 3 }] },
    }
    // $replace 在 items 上 → 清除 items 的默认值后合并
    // items 原本是数组，source 的 items 是对象 → 覆盖为对象
    expect(deepMerge(target, source)).toEqual({
      items: { list: [{ a: 3 }] },
      other: 'keep',
    })
  })

  test('$replace: true 不影响兄弟 key', () => {
    const target = {
      a: { x: 1, y: 2 },
      b: { z: 3 },
    }
    const source = {
      a: { $replace: true, m: 0 },
      b: { w: 4 },
    }
    expect(deepMerge(target, source)).toEqual({
      a: { m: 0 },
      b: { z: 3, w: 4 },
    })
  })

  test('$replace: true 深层嵌套：只清除对应子树', () => {
    const target = {
      module: {
        nav: { items: [{ path: '/a' }], title: 'Default' },
        windsock: { items: [{ path: '/w' }] },
      },
    }
    const source = {
      module: {
        nav: { $replace: true, items: [{ path: '/x' }] },
      },
    }
    const result = deepMerge(target, source)
    expect(result.module.nav).toEqual({ items: [{ path: '/x' }] })
    expect(result.module.windsock).toEqual({ items: [{ path: '/w' }] })
  })

  test('$replace: true 空对象：清除 target 所有键后结果为空对象', () => {
    const target = { a: { x: 1, y: 2, z: 3 } }
    const source = { a: { $replace: true } }
    expect(deepMerge(target, source)).toEqual({ a: {} })
  })
})

describe('deepMerge $idkey in default template', () => {
  test('默认模板声明 $idkey 后按该字段合并', () => {
    const target = {
      items: Object.assign(
        [
          { path: '/a', title: 'A', icon: 'a-icon' },
          { path: '/b', title: 'B' },
        ],
        { $idkey: 'path' },
      ),
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

  test('默认模板声明 $idkey 后无匹配项追加', () => {
    const target = {
      items: Object.assign([{ path: '/a', title: 'A' }], { $idkey: 'path' }),
    }
    const source = { items: [{ path: '/c', title: 'C' }] }
    expect(deepMerge(target, source)).toEqual({
      items: [
        { path: '/a', title: 'A' },
        { path: '/c', title: 'C' },
      ],
    })
  })

  test('footer.linkSections 默认按 name 合并，$replace 不会留下空 section', () => {
    const target = {
      footer: {
        linkSections: Object.assign(
          [
            {
              name: '更多',
              links: [{ name: '时间线', href: '/timeline' }],
            },
            {
              name: '联系',
              links: [{ name: 'GitHub', href: 'https://github.com' }],
            },
          ],
          { $idkey: 'name' },
        ),
      },
    }
    const source = {
      footer: {
        linkSections: [
          {
            $replace: true,
            name: '更多',
            links: [{ name: 'RSS', href: '/feed' }],
          },
        ],
      },
    }
    const result = deepMerge(target, source)
    expect(result.footer.linkSections).toHaveLength(2)
    expect(result.footer.linkSections[0]).toEqual({
      name: '更多',
      links: [{ name: 'RSS', href: '/feed' }],
    })
    expect(result.footer.linkSections[1]).toEqual({
      name: '联系',
      links: [{ name: 'GitHub', href: 'https://github.com' }],
    })
  })

  test('footer.linkSections 按 name 合并：部分匹配 + 追加', () => {
    const target = {
      footer: {
        linkSections: Object.assign(
          [
            { name: '更多', links: [{ name: '时间线', href: '/timeline' }] },
            {
              name: '联系',
              links: [{ name: 'GitHub', href: 'https://github.com' }],
            },
          ],
          { $idkey: 'name' },
        ),
      },
    }
    const source = {
      footer: {
        linkSections: [
          { name: '更多', links: [{ name: 'RSS', href: '/feed' }] },
          { name: '关于', links: [{ name: '关于本站', href: '/about-site' }] },
        ],
      },
    }
    const result = deepMerge(target, source)
    expect(result.footer.linkSections).toHaveLength(3)
    // '更多' 匹配 → links 深比较去重后合并
    expect(result.footer.linkSections[0]).toEqual({
      name: '更多',
      links: [
        { name: '时间线', href: '/timeline' },
        { name: 'RSS', href: '/feed' },
      ],
    })
    // '联系' 保留默认
    expect(result.footer.linkSections[1]).toEqual({
      name: '联系',
      links: [{ name: 'GitHub', href: 'https://github.com' }],
    })
    // '关于' 无匹配 → 追加
    expect(result.footer.linkSections[2]).toEqual({
      name: '关于',
      links: [{ name: '关于本站', href: '/about-site' }],
    })
  })

  test('footer.linkSections $replace 整个 section 后 links 不含默认项', () => {
    const target = {
      footer: {
        linkSections: Object.assign(
          [
            {
              name: '更多',
              links: [
                { name: '时间线', href: '/timeline' },
                { name: '友链', href: '/friends' },
              ],
            },
          ],
          { $idkey: 'name' },
        ),
      },
    }
    const source = {
      footer: {
        linkSections: [
          {
            $replace: true,
            name: '更多',
            links: [{ name: 'RSS', href: '/feed' }],
          },
        ],
      },
    }
    const result = deepMerge(target, source)
    expect(result.footer.linkSections).toHaveLength(1)
    // $replace 清除了默认 '更多' 的所有字段后从 source 重建 → 只有 RSS
    expect(result.footer.linkSections[0]).toEqual({
      name: '更多',
      links: [{ name: 'RSS', href: '/feed' }],
    })
  })

  test('嵌套 $idkey：subMenu 按 path 合并', () => {
    const target = {
      nav: {
        items: Object.assign(
          [
            {
              path: '/notes',
              title: 'Notes',
              subMenu: Object.assign(
                [
                  { path: '/notes/series', title: 'Series' },
                  { path: '/notes/tags', title: 'Tags' },
                ],
                { $idkey: 'path' },
              ),
            },
          ],
          { $idkey: 'path' },
        ),
      },
    }
    const source = {
      nav: {
        items: [
          {
            path: '/notes',
            subMenu: [{ path: '/notes/series', title: '专栏' }],
          },
        ],
      },
    }
    const result = deepMerge(target, source)
    const notes = result.nav.items[0]
    expect(notes.subMenu).toHaveLength(2)
    expect(notes.subMenu[0]).toEqual({ path: '/notes/series', title: '专栏' })
    expect(notes.subMenu[1]).toEqual({ path: '/notes/tags', title: 'Tags' })
  })

  test('$idkey 声明在默认模板：source 项缺少 idKey 字段时走深比较去重', () => {
    const target = {
      items: Object.assign([{ path: '/a', title: 'A' }], { $idkey: 'path' }),
    }
    // source 项没有 path → 无法按 idKey 匹配 → 走深比较去重
    const source = { items: [{ title: 'NoPath' }] }
    expect(deepMerge(target, source)).toEqual({
      items: [{ path: '/a', title: 'A' }, { title: 'NoPath' }],
    })
  })

  test('$idkey 声明在默认模板：$replace 元素无 idKey 字段时不崩溃', () => {
    const target = {
      items: Object.assign(
        [
          { path: '/a', title: 'A' },
          { path: '/b', title: 'B' },
        ],
        { $idkey: 'path' },
      ),
    }
    // $replace 但无 path 且有其他字段 → 不是纯标记 → 保留元素并 warn
    const source = {
      items: [{ $replace: true, title: 'Orphan' }],
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result.items).toHaveLength(3)
    expect(result.items[2]).toEqual({ title: 'Orphan' })
    warnSpy.mockRestore()
  })

  test('纯 {$replace: true} 标记清除整个默认数组', () => {
    const target = {
      footer: {
        linkSections: Object.assign(
          [
            { name: '更多', links: [{ name: '时间线', href: '/timeline' }] },
            {
              name: '联系',
              links: [{ name: 'GitHub', href: 'https://github.com' }],
            },
          ],
          { $idkey: 'name' },
        ),
      },
    }
    const source = {
      footer: {
        linkSections: [
          { $replace: true },
          { name: '更多', links: [{ name: 'RSS', href: '/feed' }] },
          {
            name: '联系',
            links: [{ name: '发邮件', href: 'mailto:me@bcw2.top' }],
          },
        ],
      },
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    // 默认 linkSections 被清除，仅保留 source 中标记后的两项
    expect(result.footer.linkSections).toHaveLength(2)
    expect(result.footer.linkSections[0]).toEqual({
      name: '更多',
      links: [{ name: 'RSS', href: '/feed' }],
    })
    expect(result.footer.linkSections[1]).toEqual({
      name: '联系',
      links: [{ name: '发邮件', href: 'mailto:me@bcw2.top' }],
    })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('clearing entire default array'),
    )
    warnSpy.mockRestore()
  })

  test('纯 {$replace: true} 标记清除整个默认数组（无 $idkey 声明）', () => {
    const target = {
      items: [{ a: 1 }, { a: 2 }, { a: 3 }],
    }
    const source = {
      items: [{ $replace: true }, { a: 4 }, { a: 5 }],
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result.items).toEqual([{ a: 4 }, { a: 5 }])
    warnSpy.mockRestore()
  })

  test('纯 {$replace: true} 标记后无其他元素 → 空数组', () => {
    const target = {
      items: Object.assign([{ path: '/a' }, { path: '/b' }], {
        $idkey: 'path',
      }),
    }
    const source = { items: [{ $replace: true }] }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result.items).toEqual([])
    warnSpy.mockRestore()
  })

  test('纯 {$replace: true} 标记在数组中间位置也生效', () => {
    const target = {
      items: Object.assign(
        [
          { path: '/a', title: 'A' },
          { path: '/b', title: 'B' },
        ],
        { $idkey: 'path' },
      ),
    }
    // 标记在中间 → 清除整个默认数组，保留标记前后的 source 元素
    const source = {
      items: [
        { path: '/pre', title: 'Pre' },
        { $replace: true },
        { path: '/post', title: 'Post' },
      ],
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result.items).toEqual([
      { path: '/pre', title: 'Pre' },
      { path: '/post', title: 'Post' },
    ])
    warnSpy.mockRestore()
  })

  test('旧语法 {replace: true} 纯标记也清除整个数组（迁移后）', () => {
    const target = {
      footer: {
        linkSections: Object.assign(
          [{ name: '默认', links: [{ name: 'X', href: '/x' }] }],
          { $idkey: 'name' },
        ),
      },
    }
    const source = {
      footer: {
        linkSections: [
          { replace: true },
          { name: '自定义', links: [{ name: 'Y', href: '/y' }] },
        ],
      },
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result.footer.linkSections).toEqual([
      { name: '自定义', links: [{ name: 'Y', href: '/y' }] },
    ])
    // 应同时出现 deprecated warn 和 clearing warn
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Deprecated "replace"'),
    )
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('clearing entire default array'),
    )
    warnSpy.mockRestore()
  })
})

describe('deepMerge explicit idKey', () => {
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

  test('显式 idKey 覆盖默认模板 $idkey', () => {
    const target = {
      items: Object.assign(
        [
          { path: '/a', title: 'A' },
          { path: '/b', title: 'B' },
        ],
        { $idkey: 'path' },
      ),
    }
    // 显式传 title → 覆盖 $idkey: 'path'，按 title 合并
    const source = { items: [{ title: 'A', icon: 'new-icon' }] }
    const result = deepMerge(target, source, 'title')
    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toEqual({
      path: '/a',
      title: 'A',
      icon: 'new-icon',
    })
  })

  test('显式 idKey：source 项缺少 idKey 字段时走深比较去重', () => {
    const target = {
      items: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ],
    }
    // source 项没有 id → 无法按 idKey 匹配 → 走深比较去重
    const source = { items: [{ name: 'C' }] }
    expect(deepMerge(target, source, { idKey: 'id' })).toEqual({
      items: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { name: 'C' }],
    })
  })

  test('显式 idKey：idKey 值为 null/undefined 时不匹配', () => {
    const target = {
      items: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ],
    }
    // id 为 null → 不走 idKey 匹配 → 走深比较去重
    const source = { items: [{ id: null, name: 'A' }] }
    expect(deepMerge(target, source, { idKey: 'id' })).toEqual({
      items: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: null, name: 'A' },
      ],
    })
  })

  test('显式 idKey：匹配项递归合并嵌套对象', () => {
    const target = {
      items: [
        { id: 1, meta: { x: 1, y: 2 }, tags: ['a'] },
        { id: 2, meta: { x: 3 } },
      ],
    }
    const source = {
      items: [{ id: 1, meta: { y: 99, z: 3 }, tags: ['b'] }],
    }
    expect(deepMerge(target, source, { idKey: 'id' })).toEqual({
      items: [
        // meta 是对象 → 递归合并；tags 是标量数组 → 深比较去重合并
        { id: 1, meta: { x: 1, y: 99, z: 3 }, tags: ['a', 'b'] },
        { id: 2, meta: { x: 3 } },
      ],
    })
  })
})

describe('deepMerge deprecated meta migration', () => {
  test('旧语法 replace: true 自动迁移为 $replace 并 warn', () => {
    const target = { a: { x: 1, y: 2 } }
    const source = { a: { replace: true, m: 0 } }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { m: 0 } })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Deprecated "replace"'),
    )
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Auto-migrating'),
    )
    warnSpy.mockRestore()
  })

  test('旧语法 replace 嵌套递归迁移', () => {
    const target = {
      module: {
        nav: { items: [{ path: '/a' }, { path: '/b' }], title: 'Default' },
      },
    }
    const source = {
      module: {
        nav: { replace: true, items: [{ path: '/c' }] },
      },
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result.module.nav).toEqual({ items: [{ path: '/c' }] })
    // 嵌套路径在 warn 消息中体现
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('"module.nav"'),
    )
    warnSpy.mockRestore()
  })

  test('旧语法 replace 与 $replace 同时存在：$replace 优先，丢弃 replace', () => {
    const target = { a: { x: 1 } }
    const source = { a: { replace: false, $replace: true, m: 0 } }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    // $replace: true 生效 → 清除 x 后合并 m
    expect(result).toEqual({ a: { m: 0 } })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('conflicts with "$replace"'),
    )
    warnSpy.mockRestore()
  })

  test('旧语法 replace: false 也迁移为 $replace: false', () => {
    const target = { a: { x: 1 } }
    const source = { a: { replace: false, y: 2 } }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    // $replace: false → 正常合并
    expect(result).toEqual({ a: { x: 1, y: 2 } })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Deprecated "replace"'),
    )
    warnSpy.mockRestore()
  })

  test('旧语法 idkey 自动迁移为 $idkey 并 warn', () => {
    const target = {
      items: Object.assign(
        [
          { path: '/a', title: 'A' },
          { path: '/b', title: 'B' },
        ],
        // 模拟旧语法：用户在 source 中用 idkey 而非 $idkey
        {},
      ),
    }
    // 用户 source 用旧语法 idkey 声明在数组上
    const source = {
      items: Object.assign([{ path: '/a', title: 'A Updated' }], {
        idkey: 'path',
      }),
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // 注意：source 上的 idkey 不会被 extractMetaKeys 识别（extractMetaKeys 只扫描 target）
    // 但迁移后 source 数组上的 $idkey 也不会被 mergeArrays 使用（idKeys 来自 target）
    // 此测试仅验证迁移 warn 发生且不崩溃
    const result = deepMerge(target, source)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Deprecated "idkey"'),
    )
    // target 没有 $idkey 声明 → 走深比较去重 → {path:'/a',title:'A Updated'} 与 target 项不等 → 追加
    expect(result.items).toHaveLength(3)
    warnSpy.mockRestore()
  })

  test('旧语法 replace 在数组元素上迁移', () => {
    const target = {
      items: Object.assign(
        [
          {
            path: '/a',
            title: 'A',
            subMenu: [{ path: '/a1' }, { path: '/a2' }],
          },
          { path: '/b', title: 'B' },
        ],
        { $idkey: 'path' },
      ),
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
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toEqual({
      path: '/a',
      title: 'A Replaced',
      subMenu: [{ path: '/new' }],
    })
    expect(result.items[1]).toEqual({ path: '/b', title: 'B' })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Deprecated "replace"'),
    )
    warnSpy.mockRestore()
  })

  test('旧语法 replace 迁移后不影响兄弟 key', () => {
    const target = { a: { x: 1 }, b: { y: 2 } }
    const source = { a: { replace: true, m: 0 }, b: { z: 3 } }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { m: 0 }, b: { y: 2, z: 3 } })
    warnSpy.mockRestore()
  })

  test('旧语法 replace 在根级对象上迁移', () => {
    const target = { x: 1, y: 2 }
    const source = { replace: true, z: 3 }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = deepMerge(target, source)
    expect(result).toEqual({ z: 3 })
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"<root>"'))
    warnSpy.mockRestore()
  })
})
