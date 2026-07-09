export const defaultThemeConfig: AppThemeConfig = {
  config: {
    site: {
      favicon: '/favicon.ico',
      faviconDark: '/favicon.ico',
    },
    hero: {
      title: {
        template: [],
      },
      description: '',
    },
    module: {
      subscription: {},
      og: {},
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
    },
  },
  footer: {
    linkSections: [],
    otherInfo: {
      date: '',
      motto: 'Stay hungry. Stay foolish.',
    },
  },
}
