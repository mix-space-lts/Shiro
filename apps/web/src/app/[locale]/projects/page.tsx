'use client'

import { useQuery } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { GitHubBrandIcon } from '~/components/icons/platform/GitHubBrandIcon'
import { ProjectList } from '~/components/modules/project/ProjectList'
import { NothingFound } from '~/components/modules/shared/NothingFound'
import { Loading } from '~/components/ui/loading'
import { BottomToUpTransitionView } from '~/components/ui/transition'
import { apiClient } from '~/lib/request'
import {
  useAggregationSelector,
  useAppConfigSelector,
} from '~/providers/root/aggregation-data-provider'

export default function Page() {
  const t = useTranslations('projects')
  const tCommon = useTranslations('common')
  const projectsEnabled = useAppConfigSelector(
    (config) => config.module?.projects?.enable ?? true,
  )
  const navItems = useAppConfigSelector((config) => config.module?.nav?.items)
  if (projectsEnabled === false && !navItems?.length) notFound()
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const data = await apiClient.project.getAll()
      return data.data
    },
  })

  const githubUsername = useAggregationSelector(
    (state) => state.user?.socialIds?.github,
  )

  if (isLoading) {
    return <Loading useDefaultLoadingText />
  }

  return (
    <div className="mt-10">
      <header className="prose my-12 flex items-center">
        <h1 className="flex items-center">
          {t('page_title')}{' '}
          {githubUsername && (
            <a
              href={`https://github.com/${githubUsername}`}
              className="ml-2 inline-flex text-inherit!"
              target="_blank"
              aria-label={tCommon('aria_view_on_github')}
              rel="noopener noreferrer"
            >
              <GitHubBrandIcon />
            </a>
          )}
        </h1>
      </header>
      <main>
        {!data?.length ? (
          <NothingFound />
        ) : (
          <BottomToUpTransitionView>
            <ProjectList projects={data} />
          </BottomToUpTransitionView>
        )}
      </main>
    </div>
  )
}
