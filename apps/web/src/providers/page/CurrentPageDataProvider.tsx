'use client'

import type { PageModel } from '@mix-space-lts/api-client'
import { createModelDataProvider } from 'jojoo/react'
import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { isClientSide, isDev } from '~/lib/env'

const {
  getGlobalModelData: getModelData,
  setGlobalModelData: setModelData,
  useModelDataSelector,
  useSetModelData,
  ModelDataAtomProvider,
} = createModelDataProvider<PageModel>()

/**
 * Safe wrapper that defers data setting to useEffect instead of render phase,
 * avoiding React's "Cannot update a component while rendering" warning.
 */
const SafeModelDataProvider: FC<PropsWithChildren<{ data: PageModel }>> = ({
  data,
  children,
}) => {
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
    getCurrentPageData: typeof getModelData
  }
}

if (isDev && isClientSide) window.getCurrentPageData = getModelData

export {
  ModelDataAtomProvider as CurrentPageDataAtomProvider,
  SafeModelDataProvider as CurrentPageDataProvider,
  getModelData as getCurrentPageData,
  setModelData as setCurrentPageData,
  useModelDataSelector as useCurrentPageDataSelector,
}
