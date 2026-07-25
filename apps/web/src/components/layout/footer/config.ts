export const defaultLinkSections: LinkSection[] = [
  {
    name: '关于',
    links: [
      {
        name: '关于本站',
        href: '/about-site',
        external: false,
      },
      {
        name: '关于我',
        href: '/about-me',
        external: false,
      },
      {
        name: '关于此项目',
        href: 'https://github.com/mix-space-lts/Shiro',
        external: true,
      },
    ],
  },
  {
    name: '更多',
    links: [
      {
        name: '时间线',
        href: '/timeline',
        external: false,
      },
      {
        name: '友链',
        href: '/friends',
        external: false,
      },
      {
        name: '监控',
        href: 'https://status.shizuri.net/status/main',
        external: true,
      },
    ],
  },
  {
    name: '联系',
    links: [
      {
        name: '写留言',
        href: '/message',
        external: false,
      },
      {
        name: '发邮件',
        href: 'mailto:i@innei.in',
        external: true,
      },
      {
        name: 'GitHub',
        href: 'https://github.com/innei',
        external: true,
      },
    ],
  },
]
