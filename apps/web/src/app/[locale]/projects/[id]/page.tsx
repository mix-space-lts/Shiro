'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

import { NothingFound } from '~/components/modules/shared/NothingFound'
import { Loading } from '~/components/ui/loading'
import { useRouter } from '~/i18n/navigation'
import { apiClient } from '~/lib/request'

export default function Page() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: [id, 'project'],
    queryFn: async ({ queryKey }) => {
      const [id] = queryKey
      return apiClient.project.getById(id as string)
    },
  })
  const router = useRouter()
  useEffect(() => {
    if (data?.projectUrl) {
      window.open(data.projectUrl)
      router.back()
    }
  }, [data?.projectUrl])

  if (isLoading) {
    return <Loading useDefaultLoadingText />
  }

  if (!data) {
    return <NothingFound />
  }

  return null
}
