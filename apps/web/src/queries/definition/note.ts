import type { NoteWrappedWithLikedAndTranslationPayload } from '@mix-space-lts/api-client'

import { apiClient } from '~/lib/request'

import { defineQuery } from '../helper'

const LATEST_KEY = 'latest'

// 日期式路径片段：月/日不补零（兼容补零），末段可为 slug 或 nid
const NOTE_PATH_RE = /^(\d{1,4})\/(\d{1,2})\/(\d{1,2})\/([^/]+)$/

/**
 * 解析日期式 note 路径片段。
 *
 * - "123" → null（按 nid 处理）
 * - "2026/10/5/render-benchmark" → { year, month, day, slug }
 * - "2026/10/5/123" → 末段是 nid 也照常解析，由后端 tracker 兜底
 */
export function parseNotePath(raw: string) {
  const match = NOTE_PATH_RE.exec(raw)
  if (!match) return null
  const [, y, m, d, slug] = match
  return {
    year: Number.parseInt(y, 10),
    month: Number.parseInt(m, 10),
    day: Number.parseInt(d, 10),
    slug: decodeURIComponent(slug),
  }
}

export const note = {
  byNid: (nid: string, password?: string | null, lang?: string) =>
    defineQuery({
      queryKey: ['note', nid, lang],

      queryFn: async ({ queryKey }) => {
        const [, id, lang] = queryKey as [string, string, string | undefined]

        if (id === LATEST_KEY) {
          return (await apiClient.note.getLatest()).$serialized
        }
        const data = await apiClient.note.getNoteByNid(Number(id), {
          password: password || undefined,
          lang: lang || undefined,
          prefer: 'lexical',
        })

        return data.$serialized as NoteWrappedWithLikedAndTranslationPayload
      },
    }),

  /**
   * 双形态取数：数字 nid 走 getNoteByNid；日期式路径走
   * getNoteBySlugDate（core 端 tracker 对末段做 slug/nid 双解析）。
   */
  byId: (idOrPath: string, password?: string | null, lang?: string) =>
    defineQuery({
      queryKey: ['note', idOrPath, lang],

      queryFn: async ({ queryKey }) => {
        const [, id, lang] = queryKey as [string, string, string | undefined]

        if (id === LATEST_KEY) {
          return (await apiClient.note.getLatest()).$serialized
        }

        const parsed = parseNotePath(id)

        const data = parsed
          ? await apiClient.note.getNoteBySlugDate(
              parsed.year,
              parsed.month,
              parsed.day,
              parsed.slug,
              {
                password: password || undefined,
                lang: lang || undefined,
                prefer: 'lexical',
              },
            )
          : await apiClient.note.getNoteByNid(Number(id), {
              password: password || undefined,
              lang: lang || undefined,
              prefer: 'lexical',
            })

        return data.$serialized as NoteWrappedWithLikedAndTranslationPayload
      },
    }),
}
