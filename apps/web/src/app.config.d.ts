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
    }
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
