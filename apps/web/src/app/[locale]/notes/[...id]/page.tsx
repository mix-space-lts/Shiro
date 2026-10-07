import './page.css'

import type {
  ModelWithLiked,
  ModelWithTranslation,
  NoteModel,
} from '@mix-space-lts/api-client'
import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { AckRead } from '~/components/common/AckRead'
import { ArticleRoom } from '~/components/common/ArticleRoom'
import { ClientOnly } from '~/components/common/ClientOnly'
import { CommentAreaRootLazy } from '~/components/modules/comment'
import {
  NoteActionAside,
  NoteBottomBarAction,
  NoteBottomTopic,
  NoteFooterNavigationBarForMobile,
  NoteMetaBar,
  NotePasswordForm,
} from '~/components/modules/note'
import {
  NoteBanner,
  NoteRootBanner,
} from '~/components/modules/note/NoteBanner'
import { NoteFontSettingFab } from '~/components/modules/note/NoteFontFab'
import { NoteMainContainer } from '~/components/modules/note/NoteMainContainer'
import { BanCopyWrapper } from '~/components/modules/shared/BanCopyWrapper'
import { ReadIndicatorForMobile } from '~/components/modules/shared/ReadIndicator'
import { TocFAB } from '~/components/modules/toc/TocFAB'
import { TocHeadingStrategyProvider } from '~/components/modules/toc/TocHeadingStrategy'
import { BottomToUpSoftScaleTransitionView } from '~/components/ui/transition'
import { OnlyMobile } from '~/components/ui/viewport/OnlyMobile'
import { getOgUrl } from '~/lib/helper.server'
import { getSummaryFromMd } from '~/lib/markdown'
import { definePrerenderPage } from '~/lib/request.server'
import {
  buildLanguageAlternates,
  buildLocalePrefixedPath,
  getSupportedLocalesFromTranslations,
} from '~/lib/seo/hreflang'
import { buildNoteHref } from '~/lib/url-builder'
import {
  CurrentNoteDataProvider,
  SyncNoteDataAfterLoggedIn,
} from '~/providers/note/CurrentNoteDataProvider'
import { CurrentNoteNidProvider } from '~/providers/note/CurrentNoteIdProvider'
import { LayoutRightSidePortal } from '~/providers/shared/LayoutRightSideProvider'
import { WrappedElementProvider } from '~/providers/shared/WrappedElementProvider'

import { Paper } from '../../../../components/layout/container/Paper'
import { NoteHeadCover } from '../../../../components/modules/note/NoteHeadCover'
import { NoteHideIfSecret } from '../../../../components/modules/note/NoteHideIfSecret'
import type { NoteDataResult } from './api'
import { getData } from './api'
import { NoteContent } from './NoteContent'
import {
  IndentArticleContainer,
  MarkdownSelection,
  NoteDataReValidate,
  NoteHeaderDate,
  NoteMarkdownImageRecordProvider,
  NoteTitle,
} from './pageExtra'
import { Transition } from './Transition'

type NoteWithTranslation = ModelWithLiked<ModelWithTranslation<NoteModel>>

export const dynamic = 'force-dynamic'

function PageInner({
  data,
  privateLoginOnlyMessage,
}: {
  data: NoteWithTranslation
  privateLoginOnlyMessage: string
}) {
  return (
    <>
      <AckRead id={data.id} type="note" />
      <ArticleRoom id={data.id} />

      <NoteHeadCover image={data.meta?.cover} />

      <div>
        <NoteTitle />
        <span className="flex flex-wrap items-center text-sm text-neutral/60">
          <NoteHeaderDate />

          <NoteMetaBar />
        </span>

        <NoteRootBanner />
        {!!data.password && (
          <NoteBanner type="warning" message={privateLoginOnlyMessage} />
        )}
      </div>

      <NoteHideIfSecret>
        <WrappedElementProvider eoaDetect>
          <ReadIndicatorForMobile />
          <NoteMarkdownImageRecordProvider>
            <BanCopyWrapper>
              <MarkdownSelection>
                <IndentArticleContainer
                  prose={data.contentFormat !== 'lexical'}
                >
                  <header className="sr-only">
                    <NoteTitle />
                  </header>
                  <NoteContent contentFormat={data.contentFormat} />
                </IndentArticleContainer>
              </MarkdownSelection>
            </BanCopyWrapper>
          </NoteMarkdownImageRecordProvider>

          <LayoutRightSidePortal>
            <NoteActionAside />
          </LayoutRightSidePortal>
        </WrappedElementProvider>
      </NoteHideIfSecret>
      {/* <SubscribeBell defaultType="note_c" /> */}
      <ClientOnly>
        <div className="mt-8" data-hide-print />
        <NoteBottomBarAction />
        <NoteBottomTopic />
        <NoteFooterNavigationBarForMobile />
      </ClientOnly>
    </>
  )
}

type NoteDetailPageParams = LocaleParams & {
  // catch-all："123"（nid 式）或 "2026/10/5/<slug|nid>"（日期式，join 后）
  id: string | string[]
  password?: string
}
export const generateMetadata = async (props: {
  params: Promise<NoteDetailPageParams>
  searchParams?: Promise<{
    password?: string | string[]
    lang?: string
  }>
}): Promise<Metadata> => {
  const params = await props.params
  const searchParams = (await props.searchParams) ?? {}
  const password = Array.isArray(searchParams.password)
    ? searchParams.password[0]
    : searchParams.password
  try {
    const { note: res } = await getData({
      ...params,
      password,
      lang: searchParams.lang,
    })

    const { data } = res
    const description = getSummaryFromMd(data.text ?? '')

    // og 路由按数字 nid 取数（getNoteByNid(+nid)），必须传真实 nid
    const ogUrl = await getOgUrl(
      'note',
      {
        nid: data.nid,
      },
      params.locale,
    )

    // 规范链接与访问形态解耦：有 slug 的笔记无论从哪种形态进来，canonical 都指向日期式
    const canonicalPathNoLocale = buildNoteHref(data)
    const canonicalPath = buildLocalePrefixedPath(
      params.locale as any,
      canonicalPathNoLocale,
    )
    const supportedLocales = getSupportedLocalesFromTranslations({
      sourceLang: (data as any).translationMeta?.sourceLang,
      availableTranslations: (data as any).availableTranslations,
    })

    return {
      title: data.title,
      description,
      openGraph: {
        title: data.title,
        description,
        images: ogUrl,
        type: 'article',
      },
      twitter: {
        images: ogUrl,
        title: data.title,
        description,
        card: 'summary_large_image',
      },
      alternates: {
        canonical: canonicalPath,
        languages: {
          ...buildLanguageAlternates(canonicalPathNoLocale, supportedLocales),
          'x-default': canonicalPathNoLocale,
        },
      },
    } satisfies Metadata
  } catch {
    return {}
  }
}

export default definePrerenderPage<NoteDetailPageParams>()<NoteDataResult>({
  fetcher: async (params) => {
    const res = await getData(params)

    // 有 slug 的笔记：非规范入口（nid 式、日期式末段为 nid）→ 永久重定向到日期式。
    // 无 slug 的笔记：nid 式 / 日期式两种形态都直接服务，不重定向。
    const noteData = res.note.data
    if (noteData?.slug && noteData?.created) {
      const canonical = buildNoteHref(noteData)
      const current = `/notes/${
        Array.isArray(params.id) ? params.id.join('/') : params.id
      }`
      if (current !== canonical) {
        permanentRedirect(
          buildLocalePrefixedPath(params.locale as any, canonical),
        )
      }
    }

    return res
  },
  requestErrorRenderer(_error, parsed, { id }) {
    const { status } = parsed

    // catch-all 下 id 是路径段数组；provider 需要字符串
    const nidForProvider =
      typeof id === 'string' ? id : id.length === 1 ? id[0] : id.join('/')

    if (status === 403) {
      return (
        <Paper>
          <NotePasswordForm />
          <CurrentNoteNidProvider nid={nidForProvider} />
        </Paper>
      )
    }
  },
  async Component({ data: fetchedData, params: { locale }, fetchedAt }) {
    const { note: data } = fetchedData
    // 真实数字 nid（日期式 URL 的 params.id 是路径段数组，不能当 nid 用）
    const nid = String(data.data.nid)
    const t = await getTranslations({
      namespace: 'note',
      locale,
    })

    return (
      <TocHeadingStrategyProvider
        contentFormat={data.data.contentFormat}
        hasContent={!!data.data.content}
      >
        <CurrentNoteNidProvider nid={nid} />
        <CurrentNoteDataProvider data={data} />
        <NoteDataReValidate fetchedAt={fetchedAt} />
        <SyncNoteDataAfterLoggedIn />
        <Transition className="min-w-0" lcpOptimization>
          <Paper key={nid} as={NoteMainContainer}>
            <PageInner
              data={data.data}
              privateLoginOnlyMessage={t('private_login_only')}
            />
          </Paper>
          <BottomToUpSoftScaleTransitionView delay={500}>
            <CommentAreaRootLazy
              refId={data.data.id}
              allowComment={data.data.allowComment}
            />
          </BottomToUpSoftScaleTransitionView>
        </Transition>

        <NoteFontSettingFab />

        <OnlyMobile>
          <TocFAB />
        </OnlyMobile>
      </TocHeadingStrategyProvider>
    )
  },
})
