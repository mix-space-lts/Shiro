'use client'

import type { AggregateRoot } from '@mix-space-lts/api-client'
import { atom, useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import type { FC, PropsWithChildren } from 'react'
import { useCallback, useEffect, useRef } from 'react'

import { setWebUrl } from '~/atoms'
import { useBeforeMounted } from '~/hooks/common/use-before-mounted'
import { isDev } from '~/lib/env'
import { jotaiStore } from '~/lib/store'
import { useAggregationQuery } from '~/queries/aggregation'

export type { AggregateRoot }

export const aggregationDataAtom = atom<null | AggregateRoot>(null)
const appConfigAtom = atom<AppConfig | null>(null)

export const AggregationProvider: FC<
  PropsWithChildren<{
    aggregationData: AggregateRoot
    appConfig: AppConfig
  }>
> = ({ children, aggregationData, appConfig }) => {
  // 客户端侧查询，保持数据新鲜度（refetchOnMount / refetchOnWindowFocus）
  const { data: clientData } = useAggregationQuery()
  const prevClientRef = useRef<AggregateRoot | null>(null)

  useBeforeMounted(() => {
    if (!aggregationData) return
    jotaiStore.set(aggregationDataAtom, aggregationData)
    setWebUrl(aggregationData.url.webUrl)
  })
  useBeforeMounted(() => {
    if (!appConfig) return
    jotaiStore.set(appConfigAtom, appConfig)
  })
  // useHydrateAtoms(
  //   [
  //     [aggregationDataAtom, aggregationData],
  //     [appConfigAtom, appConfig],
  //   ],
  //   {
  //     dangerouslyForceHydrate: true,
  //   },
  // )

  useEffect(() => {
    if (!appConfig) return
    jotaiStore.set(appConfigAtom, appConfig)
  }, [appConfig])

  useEffect(() => {
    if (!aggregationData) return
    jotaiStore.set(aggregationDataAtom, aggregationData)
    setWebUrl(aggregationData.url.webUrl)
  }, [aggregationData])

  // 客户端 query 返回更新 → 覆盖 atom（跳过首次与 props 相同的数据）
  useEffect(() => {
    if (!clientData) return
    if (prevClientRef.current === clientData) return
    prevClientRef.current = clientData

    jotaiStore.set(aggregationDataAtom, clientData)

    if (clientData.theme?.config) {
      jotaiStore.set(appConfigAtom, clientData.theme.config)
    }
  }, [clientData])

  const callOnceRef = useRef(false)

  useEffect(() => {
    if (callOnceRef.current) return
    if (!aggregationData?.user) return
    callOnceRef.current = true
  }, [aggregationData?.user])

  return children
}

export const useAggregationSelector = <T,>(
  selector: (atomValue: AggregateRoot) => T,
  deps: any[] = [],
): T | null =>
  useAtomValue(
    // @ts-ignore
    selectAtom(
      aggregationDataAtom,
      useCallback(
        (atomValue) => (!atomValue ? null : selector(atomValue)),
        deps,
      ),
    ),
  )

export const useAppConfigSelector = <T,>(
  selector: (atomValue: AppConfig) => T,
  deps: any[] = [],
): T | null =>
  useAtomValue(
    // @ts-ignore
    selectAtom(
      appConfigAtom,
      useCallback(
        (atomValue) =>
          !atomValue ? null : noThrowFnWrapper(selector)(atomValue),
        deps,
      ),
    ),
  )

export const getAggregationData = () => jotaiStore.get(aggregationDataAtom)

export const getAppConfig = () => jotaiStore.get(appConfigAtom)

const noThrowFnWrapper = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args)
    } catch (e: any) {
      if (isDev) {
        console.error(e)
      }
      return null
    }
  }) as T
}
