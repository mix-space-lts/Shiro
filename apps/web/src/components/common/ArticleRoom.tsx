'use client'

import type { FC } from 'react'

import { useArticleRoom } from '~/hooks/biz/use-article-room'

export const ArticleRoom: FC<{ id: string }> = ({ id }) => {
  useArticleRoom(id)

  return null
}
