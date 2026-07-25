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
          {
            type: 'span',
            class:
              'inline-block w-[1px] h-8 -bottom-2 relative bg-zinc-800/80 dark:bg-zinc-200/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:animation-blink',
          },
        ],
      },
      description: 'A personal space for writing and sharing.',
      hitokoto: {
        random: true,
        custom: undefined,
      },
    },
    color: Object.assign(
      [
        { light: '#33A6B8', dark: '#F596AA' },
        { light: '#FF6666', dark: '#A0A7D4' },
        { light: '#26A69A', dark: '#ff7b7b' },
      ],
      { $idkey: 'light' },
    ),
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
      nav: {
        items: Object.assign(
          [
            {
              titleKey: 'nav_home',
              path: '/',
              icon: 'home',
              injectPages: true,
              subMenu: [],
            },
            {
              titleKey: 'nav_posts',
              path: '/posts',
              icon: 'posts',
              injectCategories: true,
              subMenu: [],
            },
            {
              titleKey: 'nav_notes',
              path: '/notes',
              icon: 'notes',
              exclude: ['/notes/series'],
              subMenu: Object.assign(
                [{ titleKey: 'nav_topics', path: '/notes/series' }],
                { $idkey: 'path' },
              ),
            },
            {
              titleKey: 'nav_timeline',
              path: '/timeline',
              icon: 'timeline',
              subMenu: Object.assign(
                [
                  {
                    titleKey: 'nav_posts',
                    path: '/timeline?type=post',
                    icon: 'timeline-post',
                  },
                  {
                    titleKey: 'nav_notes',
                    path: '/timeline?type=note',
                    icon: 'timeline-note',
                  },
                  {
                    titleKey: 'nav_memories',
                    path: '/timeline?memory=1',
                    icon: 'memories',
                  },
                ],
                { $idkey: 'path' },
              ),
            },
            { titleKey: 'nav_thinking', path: '/thinking', icon: 'thinking' },
            { titleKey: 'nav_says', path: '/says', icon: 'says' },
            {
              titleKey: 'nav_more',
              path: '#',
              icon: 'more',
              subMenu: Object.assign(
                [
                  {
                    titleKey: 'nav_projects',
                    path: '/projects',
                    icon: 'projects',
                  },
                  {
                    titleKey: 'nav_friends',
                    path: '/friends',
                    icon: 'friends',
                  },
                  {
                    titleKey: 'nav_travel',
                    path: 'https://travel.moe/go.html',
                    icon: 'travel',
                  },
                ],
                { $idkey: 'path' },
              ),
            },
          ],
          { $idkey: 'path' },
        ),
      },
      windsock: {
        items: Object.assign(
          [
            { titleKey: 'windsock_posts', path: '/posts', icon: 'posts' },
            { titleKey: 'windsock_notes', path: '/notes', icon: 'notes' },
            {
              titleKey: 'windsock_timeline',
              path: '/timeline',
              icon: 'timeline',
            },
            { titleKey: 'windsock_says', path: '/says', icon: 'says' },
            {
              titleKey: 'windsock_thinking',
              path: '/thinking',
              icon: 'thinking',
            },
            {
              titleKey: 'windsock_projects',
              path: '/projects',
              icon: 'projects',
            },
            {
              titleKey: 'windsock_topics',
              path: '/notes/series',
              icon: 'topics',
            },
            {
              titleKey: 'windsock_memories',
              path: '/timeline?memory=1',
              icon: 'memories',
            },
            { titleKey: 'windsock_friends', path: '/friends', icon: 'friends' },
            {
              titleKey: 'windsock_travel',
              path: 'https://travel.moe/go.html',
              icon: 'travel',
            },
          ],
          { $idkey: 'path' },
        ),
      },
    },
  },
  footer: {
    linkSections: Object.assign(
      [
        {
          name: '更多',
          links: Object.assign(
            [
              { name: '时间线', href: '/timeline', external: false },
              { name: '友链', href: '/friends', external: false },
            ],
            { $idkey: 'name' },
          ),
        },
        {
          name: '联系',
          links: Object.assign(
            [
              { name: '写留言', href: '/message', external: false },
              { name: '发邮件', href: 'mailto:me@example.com', external: true },
              {
                name: 'GitHub',
                href: 'https://github.com/you',
                external: true,
              },
            ],
            { $idkey: 'name' },
          ),
        },
      ],
      { $idkey: 'name' },
    ),
    otherInfo: {
      date: '1970-{{now}}',
      motto: 'Stay hungry. Stay foolish.',
      icp: undefined,
    },
  },
}
