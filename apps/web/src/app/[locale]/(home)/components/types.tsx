import type {
  RecentComment,
  RecentLike,
  RecentNote,
  RecentPost,
  RecentRecent,
} from '@mix-space-lts/api-client'

// 后端已返回 categorySlug 用于拼接正确的文章链接，
// 但已发布的 api-client 类型尚未包含该字段，这里做本地扩展。
type WithCategorySlug = {
  categorySlug?: string
}

export type ReactActivityType =
  | ({
      bizType: 'comment'
    } & RecentComment &
      WithCategorySlug)
  | ({
      bizType: 'note'
    } & RecentNote)
  | ({
      bizType: 'post'
    } & RecentPost &
      WithCategorySlug)
  | ({
      bizType: 'recent'
    } & RecentRecent)
  | ({
      bizType: 'like'
    } & RecentLike &
      WithCategorySlug)
