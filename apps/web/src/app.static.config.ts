const getEnvNumber = (
  key: string,
  fallback: number,
): number => {
  const value = process.env[key]
  if (value === undefined) return fallback
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const appStaticConfig = {
  cache: {
    enabled: true,

    ttl: {
      // 聚合配置（theme/seo/owner 等）缓存 TTL（秒）
      // 可通过环境变量 NEXT_PUBLIC_AGGREGATION_CACHE_TTL 覆盖
      // 默认 3600 秒，开发环境建议设为 60
      aggregation: getEnvNumber(
        'NEXT_PUBLIC_AGGREGATION_CACHE_TTL',
        3600,
      ),
    },
  },

  revalidate: 1000 * 10, // 10s
}

export const CDN_HOST = 'cdn.innei.ren'
export const TENCENT_CDN_DOMAIN = CDN_HOST
