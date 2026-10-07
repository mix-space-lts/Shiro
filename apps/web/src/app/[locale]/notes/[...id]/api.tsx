import type { NoteWrappedWithLikedAndTranslationPayload } from '@mix-space-lts/api-client'

import { attachServerFetch } from '~/lib/attach-fetch'
import { getQueryClient } from '~/lib/query-client.server'
import { requestErrorHandler } from '~/lib/request.server'
import { queries } from '~/queries/definition'

export interface NoteParams extends LocaleParams {
  /** catch-all："123"（nid 式）或 ["2026","10","5","<slug|nid>"]（日期式） */
  id: string | string[]
  password?: string | string[] | null
  lang?: string
}

export interface NoteDataResult {
  note: NoteWrappedWithLikedAndTranslationPayload
}

const getNoteData = async (params: NoteParams, lang?: string) => {
  await attachServerFetch()

  const { id } = params
  const password = Array.isArray(params.password)
    ? params.password[0]
    : (params.password ?? undefined)

  const idOrPath = Array.isArray(id) ? id.join('/') : id
  const query = queries.note.byId(idOrPath, password, lang)

  const data = await getQueryClient()
    .fetchQuery({
      ...query,
      staleTime: 0,
    })
    .catch(requestErrorHandler)
  return data as NoteWrappedWithLikedAndTranslationPayload
}

export const getData = async (params: NoteParams): Promise<NoteDataResult> => {
  // 如果指定了 lang=original，不传 lang 参数
  if (params.lang === 'original') {
    const note = await getNoteData(params, 'original')
    return { note }
  }

  const preferredLang = params.lang || params.locale
  const note = await getNoteData(params, preferredLang || undefined)

  return { note }
}
