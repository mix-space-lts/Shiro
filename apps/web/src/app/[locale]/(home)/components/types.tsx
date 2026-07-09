import type {
  RecentComment,
  RecentLike,
  RecentNote,
  RecentPost,
  RecentRecent,
} from '@mix-space-lts/api-client'

export type ReactActivityType =
  | ({
      bizType: 'comment'
    } & RecentComment)
  | ({
      bizType: 'note'
    } & RecentNote)
  | ({
      bizType: 'post'
    } & RecentPost)
  | ({
      bizType: 'recent'
    } & RecentRecent)
  | ({
      bizType: 'like'
    } & RecentLike)
