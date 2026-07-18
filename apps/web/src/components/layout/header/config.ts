import type { ReactNode } from 'react'
import { createElement } from 'react'

import {
  FaSolidCircle,
  FaSolidCircleNotch,
  FaSolidComments,
  FaSolidDotCircle,
  FaSolidFeatherAlt,
  FaSolidHashtag,
  FaSolidHistory,
  FaSolidUserFriends,
  IcTwotoneSignpost,
  IonBook,
  MdiFlask,
  MdiLightbulbOn20,
  RMixPlanet,
} from '~/components/icons/menu-collection'

/** 共享图标映射（navbar + windsock 共用） */
export const NAV_ICON_MAP = {
  home: FaSolidDotCircle,
  posts: IcTwotoneSignpost,
  notes: FaSolidFeatherAlt,
  timeline: FaSolidHistory,
  'timeline-post': IonBook,
  'timeline-note': FaSolidFeatherAlt,
  memories: FaSolidCircle,
  thinking: MdiLightbulbOn20,
  says: FaSolidComments,
  more: FaSolidCircleNotch,
  projects: MdiFlask,
  topics: FaSolidHashtag,
  friends: FaSolidUserFriends,
  travel: RMixPlanet,
} as const

export type NavIconKey = keyof typeof NAV_ICON_MAP

function isImageSrc(s: string) {
  return s.startsWith('data:') || s.startsWith('http')
}

/**
 * 将 icon 字符串解析为 React 元素。
 * 优先级：内置 key → base64/外链 → 原样文本（兜底）。
 */
export function resolveNavIcon(icon: string): ReactNode {
  if (icon in NAV_ICON_MAP) {
    return createElement(NAV_ICON_MAP[icon as NavIconKey])
  }
  if (isImageSrc(icon)) {
    return createElement('img', {
      src: icon,
      alt: '',
      className: 'size-4',
    })
  }
  return icon
}

export interface IHeaderMenu {
  title: string
  titleKey?: string
  path: string
  type?: string
  icon?: ReactNode
  subMenu?: Omit<IHeaderMenu, 'exclude'>[]
  exclude?: string[]
  search?: Record<string, string>
  do?: () => void
  /** 将分类列表注入到此项的子菜单（合并），默认 false */
  injectCategories?: boolean
  /** 将独立页列表注入到此项的子菜单（合并），默认 false */
  injectPages?: boolean
}
