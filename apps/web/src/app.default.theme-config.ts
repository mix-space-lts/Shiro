/**
 * Shiro 主题默认配置
 *
 * ⚠️ 此文件是 deepMerge 的 schema 基准：
 *   - 后端返回的键若在此文件中不存在，dev 模式下会 console.warn 告警（见 lib/lodash.ts）
 *   - 所有合法键（含可选字段）都应在此定义，值用 undefined 表示"不设默认、不强制 write"
 *
 * ⚠️ 新增配置字段时，需同步改以下文件：
 *   1. app.config.d.ts —— TypeScript 类型
 *   2. docs/shiro-theme-config.example.yaml —— 用户配置示例
 *   3. 消费该配置的组件代码
 */
export const defaultThemeConfig: AppThemeConfig = {
  config: {
    site: {
      favicon: '/favicon.ico',
      faviconDark: '/favicon.ico',
    },
    hero: {
      title: {
        template: [
          { type: 'h1', text: "Hi, I'm ", class: 'font-light text-4xl' },
          { type: 'h1', text: 'Your Name', class: 'font-medium mx-2 text-4xl' },
          { type: 'br' },
          { type: 'h1', text: 'A Full Stack ', class: 'font-light text-4xl' },
          {
            type: 'code',
            text: '<Developer />',
            class:
              'font-medium mx-2 text-3xl rounded p-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-900 transition-colors duration-200',
          },
        ],
      },
      description: 'A personal space for writing and sharing.',
      hitokoto: {
        random: true,
        custom: undefined,
      },
    },
    color: {
      light: ['#33A6B8', '#FF6666', '#26A69A'],
      dark: ['#F596AA', '#A0A7D4', '#ff7b7b'],
    },
    custom: undefined,
    poweredBy: {
      vercel: false,
    },
    module: {
      subscription: {
        tg: undefined,
      },
      og: {
        avatar: undefined,
      },
      donate: {
        enable: false,
        link: '',
        qrcode: [],
      },
      bilibili: {
        liveId: 0,
      },
      rss: {
        custom_elements: [],
        noRSS: false,
      },
      signature: {
        svg: '',
        animated: true,
      },
      posts: {
        mode: 'loose',
        outdated_days: 60,
      },
      travel: {
        enable: true,
      },
      friends: {
        enable: true,
      },
      projects: {
        enable: true,
      },
      says: {
        enable: true,
      },
      thinking: {
        enable: true,
      },
      notes: {
        enable: true,
      },
      timeline: {
        enable: true,
      },
      noteTopics: {
        enable: true,
      },
    },
  },
  footer: {
    linkSections: [
      {
        name: '更多',
        links: [
          { name: '时间线', href: '/timeline' },
          { name: '友链', href: '/friends' },
        ],
      },
      {
        name: '联系',
        links: [
          { name: '写留言', href: '/message' },
          { name: '发邮件', href: 'mailto:me@example.com', external: true },
          { name: 'GitHub', href: 'https://github.com/you', external: true },
        ],
      },
    ],
    otherInfo: {
      date: '1970-{{now}}',
      motto: 'Stay hungry. Stay foolish.',
      icp: undefined,
    },
  },
}
