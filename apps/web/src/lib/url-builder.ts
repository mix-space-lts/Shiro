import type {
  CategoryModel,
  NoteModel,
  PageModel,
  PostModel,
} from '@mix-space-lts/api-client'

import { isDev } from '~/lib/env'
import { getAggregationData } from '~/providers/root/aggregation-data-provider'

export function urlBuilder(path = '') {
  if (isDev) return new URL(path, 'http://localhost:2323')
  return new URL(path, getAggregationData()?.url.webUrl)
}

export function isPostModel(model: any): model is PostModel {
  return (
    isDefined(model.title) &&
    isDefined(model.slug) &&
    isDefined(model.category) &&
    !isDefined(model.order)
  )
}

export function isPageModel(model: any): model is PageModel {
  return (
    isDefined(model.title) && isDefined(model.slug) && isDefined(model.order)
  )
}

export function isNoteModel(model: any): model is NoteModel {
  return isDefined(model.title) && isDefined(model.nid)
}

/**
 * 生成 note 的规范链接。
 *
 * 有 created + slug 时用日期式 `/notes/yyyy/m/d/<slug>`，与后端
 * NoteService.buildSeoPath 完全一致（UTC、月/日不补零）；否则回退
 * nid 式 `/notes/<nid>`。
 */
export function buildNoteHref(
  note: Pick<NoteModel, 'nid' | 'slug' | 'created'>,
) {
  const {created} = note
  if (created && note.slug) {
    const d = new Date(created)
    if (!Number.isNaN(d.getTime())) {
      const y = d.getUTCFullYear()
      const m = d.getUTCMonth() + 1
      const day = d.getUTCDate()
      return `/notes/${y}/${m}/${day}/${encodeURIComponent(note.slug)}`
    }
  }
  return `/notes/${note.nid}`
}

function buildUrl(model: PostModel | NoteModel | PageModel) {
  if (isPostModel(model)) {
    // TODO
    if (!model.category) {
      console.error('PostModel.category is missing!!!!!')
      return '#'
    }
    return `/posts/${
      (model.category as CategoryModel).slug
    }/${encodeURIComponent(model.slug)}`
  } else if (isPageModel(model)) {
    return `/${model.slug}`
  } else if (isNoteModel(model)) {
    return buildNoteHref(model)
  }

  return '/'
}

function isDefined(data: any) {
  return data !== undefined && data !== null
}

urlBuilder.build = buildUrl
