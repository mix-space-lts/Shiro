'use client'

import type { NoteWrappedWithLikedAndTranslationPayload } from '@mix-space-lts/api-client'
import { useQuery } from '@tanstack/react-query'
import { createModelDataProvider } from 'jojoo/react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { queries } from '~/queries/definition'

const {
  ModelDataAtomProvider,
  getGlobalModelData: getModelData,
  setGlobalModelData: setModelData,
  useModelDataSelector,
  useSetModelData,
} = createModelDataProvider<NoteWrappedWithLikedAndTranslationPayload>()

/**
 * Safe wrapper that defers data setting to useEffect instead of render phase,
 * avoiding React's "Cannot update a component while rendering" warning.
 */
const SafeModelDataProvider: FC<
  PropsWithChildren<{ data: NoteWrappedWithLikedAndTranslationPayload }>
> = ({ data, children }) => {
  const setData = useSetModelData()
  useEffect(() => {
    setData(data)
    return () => {
      setData(null)
    }
  }, [data, setData])
  return <>{children}</>
}

export {
  ModelDataAtomProvider as CurrentNoteDataAtomProvider,
  SafeModelDataProvider as CurrentNoteDataProvider,
  getModelData as getCurrentNoteData,
  setModelData as setCurrentNoteData,
  useModelDataSelector as useCurrentNoteDataSelector,
  useSetModelData as useSetCurrentNoteData,
}

export const SyncNoteDataAfterLoggedIn = () => {
  const nid = useModelDataSelector((data) => data?.data.nid)
  const password = useSearchParams().get('password')
  const locale = useLocale()
  const { data } = useQuery({
    ...queries.note.byNid(nid?.toString() || '', password, locale),
    enabled: !!nid,
  })

  useEffect(() => {
    if (data) {
      const noteData = data as NoteWrappedWithLikedAndTranslationPayload
      setModelData((draft) => {
        draft.data = noteData.data
      })
    }
  }, [data])

  return null
}
