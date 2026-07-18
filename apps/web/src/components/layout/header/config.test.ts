import { createElement } from 'react'
import { describe, expect, test } from 'vitest'

import { NAV_ICON_MAP, resolveNavIcon } from './config'

describe('resolveNavIcon', () => {
  test('内置 key → React 元素', () => {
    const result = resolveNavIcon('posts')
    expect(result).not.toBe('posts')
    expect(typeof result).toBe('object')
  })

  test('所有 NAV_ICON_MAP key 均能解析', () => {
    for (const key of Object.keys(NAV_ICON_MAP)) {
      const result = resolveNavIcon(key)
      expect(result).not.toBe(key)
      expect(typeof result).toBe('object')
    }
  })

  test('base64 data URI → <img> 元素', () => {
    const result = resolveNavIcon('data:image/svg+xml;base64,PHN2Zy8+')
    // <img> element
    expect(result).toEqual(
      createElement('img', {
        src: 'data:image/svg+xml;base64,PHN2Zy8+',
        alt: '',
        className: 'size-4',
      }),
    )
  })

  test('外链 http URL → <img> 元素', () => {
    const result = resolveNavIcon('https://cdn.example.com/icon.svg')
    expect(result).toEqual(
      createElement('img', {
        src: 'https://cdn.example.com/icon.svg',
        alt: '',
        className: 'size-4',
      }),
    )
  })

  test('未知字符串 → 原样返回', () => {
    const result = resolveNavIcon('random-text')
    expect(result).toBe('random-text')
  })
})
