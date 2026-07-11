'use client'

import type {
  ModelWithLiked,
  ModelWithTranslation,
  PostModel,
} from '@mix-space-lts/api-client'
import { createModelDataProvider } from 'jojoo/react'
import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { isClientSide, isDev } from '~/lib/env'

type PostWithTranslation = ModelWithLiked<ModelWithTranslation<PostModel>>

const {
  ModelDataAtomProvider,
  getGlobalModelData,
  setGlobalModelData,
  useSetModelData,
  useModelDataSelector,
} = createModelDataProvider<PostWithTranslation>()

/**
 * Safe wrapper that defers data setting to useEffect instead of render phase,
 * avoiding React's "Cannot update a component while rendering" warning.
 */
const SafeModelDataProvider: FC<
  PropsWithChildren<{ data: PostWithTranslation }>
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

declare global {
  interface Window {
    getModelPostData: typeof getGlobalModelData
  }
}
if (isDev && isClientSide) window.getModelPostData = getGlobalModelData

export {
  ModelDataAtomProvider as CurrentPostDataAtomProvider,
  SafeModelDataProvider as CurrentPostDataProvider,
  getGlobalModelData as getGlobalCurrentPostData,
  setGlobalModelData as setGlobalCurrentPostData,
  useModelDataSelector as useCurrentPostDataSelector,
  useSetModelData as useSetCurrentPostData,
}
