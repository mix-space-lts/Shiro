/**
 * Shiro 主题配置类型定义
 *
 * ⚠️ 新增/修改/删除配置字段时，需同步改以下文件：
 *   1. app.default.theme-config.ts  —— 默认值（也是 deepMerge 做未知键告警的 schema）
 *   2. docs/shiro-theme-config.example.yaml —— 用户配置示例文档
 *   3. 消费该配置的组件代码
 */
import type { ScriptProps } from 'next/script'

declare global {
  export interface AppThemeConfig {
    config: AppConfig
    footer: FooterConfig
  }

  export interface AccentColor {
    light: string[]
    dark: string[]
  }

  export interface AppConfig {
    site: Site
    hero: Hero
    module: Module
    color?: AccentColor

    custom?: Custom

    poweredBy?: {
      vercel?: boolean
    }
  }

  export interface LinkSection {
    name: string
    links: {
      name: string
      href: string
      external?: boolean
    }[]
  }

  export interface OtherInfo {
    date: string
    motto?: string
    icp?: {
      text: string
      link: string
    }
  }

  export interface Custom {
    css: string[]
    js: string[]
    styles: string[]
    scripts: ScriptProps[]
  }

  export interface Site {
    favicon: string
    faviconDark?: string
  }
  export interface Hero {
    title: Title
    description: string
    hitokoto?: {
      random?: boolean
      custom?: string
    }
  }
  export interface Title {
    template: TemplateItem[]
  }
  export interface TemplateItem {
    type: string
    text?: string
    class?: string
  }

  type RSSCustomElements = Array<Record<string, RSSCustomElements | string>>
  export interface Module {
    subscription: {
      tg?: string
    }
    og: {
      avatar?: string
    }
    donate: Donate
    bilibili: Bilibili
    rss: {
      custom_elements: RSSCustomElements
      noRSS?: boolean
    }

    signature: Signature

    posts: {
      mode: 'loose' | 'compact'
      /** 文章过期提示阈值（天），超过此天数显示 "这篇文章上次修改于 xxx" 警告。默认 60，填 0 永不显示。 */
      outdated_days?: number
    }

    /** 跃迁导航（博客聚合跳转），默认显示 */
    travel?: {
      enable?: boolean
    }

    /** 友链页面，默认显示 */
    friends?: {
      enable?: boolean
    }

    /** 项目页面，默认显示 */
    projects?: {
      enable?: boolean
    }

    /** 一言页面，默认显示 */
    says?: {
      enable?: boolean
    }

    /** 思考页面，默认显示 */
    thinking?: {
      enable?: boolean
    }

    /** 手记板块，默认显示 */
    notes?: {
      enable?: boolean
    }

    /** 时光（时间线）页面，默认显示 */
    timeline?: {
      enable?: boolean
    }

    /** 专栏（笔记系列），默认显示 */
    noteTopics?: {
      enable?: boolean
    }

    /** 自定义导航栏。设置 items 后直接替换默认 list（deepMerge 对数组天然替换） */
    nav?: {
      /** 完全自定义的导航项列表。未设置时使用内置默认 nav */
      items?: NavItemConfig[]
    }

    /** 首页风向标。不设置则使用内置默认（有自定义 nav 时自动从 nav 顶级项生成） */
    windsock?: {
      /** 手动指定风向标项。未设置则自动从 nav 或内置默认生成 */
      items?: WindsockItemConfig[]
    }
  }

  /** 自定义导航项 */
  export interface NavItemConfig {
    /** i18n key，优先于 title */
    titleKey?: string
    /** 硬编码标题 */
    title?: string
    path: string
    /** 预留标识 */
    type?: string
    /** 图标 key / base64 / 外链 */
    icon?: string
    /** 路由排除列表 */
    exclude?: string[]
    /** 搜索参数 */
    search?: Record<string, string>
    /** 将分类列表注入到此项的子菜单（与已有 subMenu 合并） */
    injectCategories?: boolean
    /** 将独立页列表注入到此项的子菜单（与已有 subMenu 合并） */
    injectPages?: boolean
    subMenu?: NavItemConfig[]
  }

  /** 风向标项。
   * 文本优先级：titleKey（i18n key，翻译缺失时原样显示 key）→ title（硬编码）→ path（兜底）
   */
  export interface WindsockItemConfig {
    /** i18n key，如 "windsock_posts"。找不到翻译时原样显示 key */
    titleKey?: string
    /** 硬编码文本，如 "My Blog"。titleKey 不为空时忽略 */
    title?: string
    /** 图标：内置 key（posts/notes/timeline/says/thinking/projects/topics/memories/friends/travel）
     *  或 base64 data URI（"data:image/svg+xml;base64,..."）
     *  或外链 URL（"https://..."） */
    icon?: string
    path: string
  }
  export interface Donate {
    enable: boolean
    link: string
    qrcode: string[]
  }
  export interface Bilibili {
    liveId: number
  }

  export interface Signature {
    svg: string
    animated?: boolean
  }
}
