const getEnvNumber = (key: string, fallback: number): number => {
  const value = process.env[key]
  if (value === undefined) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const getEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = process.env[key]
  if (value === undefined) return fallback
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return fallback
}

export const appStaticConfig = {
  cache: {
    enabled: true,

    ttl: {
      // 聚合配置（theme/seo/owner 等）缓存 TTL（秒）
      // 可通过环境变量 NEXT_PUBLIC_AGGREGATION_CACHE_TTL 覆盖
      // 默认 300 秒（5 分钟），过期后先用旧缓存返回，异步触发更新
      aggregation: getEnvNumber('NEXT_PUBLIC_AGGREGATION_CACHE_TTL', 300),
    },
  },

  // 客户端 aggregation 数据刷新策略
  // 可通过环境变量覆盖，控制 SPA 导航时 navbar 等数据的新鲜度
  aggregationRefresh: {
    staleTime: getEnvNumber('NEXT_PUBLIC_AGGREGATION_STALE_TIME', 30) * 1000,
    refetchOnMount: getEnvBoolean(
      'NEXT_PUBLIC_AGGREGATION_REFRESH_ON_MOUNT',
      true,
    ),
    refetchOnWindowFocus: getEnvBoolean(
      'NEXT_PUBLIC_AGGREGATION_REFRESH_ON_FOCUS',
      true,
    ),
  },

  revalidate: 1000 * 10, // 10s
}

export const CDN_HOST = process.env.NEXT_PUBLIC_CDN_HOST || 'cdn.innei.ren'
export const TENCENT_CDN_DOMAIN = CDN_HOST
