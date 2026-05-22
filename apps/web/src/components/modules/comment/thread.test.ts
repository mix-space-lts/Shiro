import type {
  CollectionRefTypes,
  CommentModel,
  CommentRefSummary,
  CommentThreadItem,
} from '@mx-space/api-client'
import { describe, expect, it } from 'vitest'

import type { CommentThreadInfiniteData } from './thread'
import { buildCommentTreeItem, mergeThreadRepliesIntoPages } from './thread'

const makeComment = (
  id: string,
  createdAt: string,
  overrides: Partial<CommentModel> = {},
): CommentModel => ({
  id,
  createdAt,
  refType: 'posts' as CollectionRefTypes,
  refId: 'post-id',
  ref: {
    id: 'post-id',
    type: 'posts' as CollectionRefTypes,
  } as CommentRefSummary,
  state: 1,
  author: `author-${id}`,
  text: `text-${id}`,
  avatar: '',
  url: null,
  ip: null,
  agent: null,
  pin: false,
  parentCommentId: null,
  rootCommentId: null,
  replyCount: 0,
  latestReplyAt: null,
  isDeleted: false,
  deletedAt: null,
  isWhispers: false,
  location: null,
  authProvider: null,
  readerId: null,
  editedAt: null,
  anchor: null,
  ...overrides,
})

describe('comment thread helpers', () => {
  it('rebuilds nested children from flat replies using parentCommentId', () => {
    const root: CommentThreadItem = {
      ...makeComment('root', '2026-03-14T10:00:00.000Z', {
        parentCommentId: null,
        rootCommentId: null,
      }),
      replies: [
        makeComment('child-2', '2026-03-14T10:03:00.000Z', {
          parentCommentId: 'child-1',
          rootCommentId: 'root',
        }),
        makeComment('child-1', '2026-03-14T10:01:00.000Z', {
          parentCommentId: 'root',
          rootCommentId: 'root',
        }),
        makeComment('orphan', '2026-03-14T10:02:00.000Z', {
          parentCommentId: 'missing-parent',
          rootCommentId: 'root',
        }),
      ],
      replyWindow: {
        total: 3,
        returned: 3,
        threshold: 20,
        hasHidden: false,
        hiddenCount: 0,
      },
    }

    const tree = buildCommentTreeItem(root)

    expect(tree.children.map((comment) => comment.id)).toEqual([
      'child-1',
      'orphan',
    ])
    expect(tree.children[0]?.children.map((comment) => comment.id)).toEqual([
      'child-2',
    ])
  })

  it('merges loaded middle replies back into paginated thread data', () => {
    const root: CommentThreadItem = {
      ...makeComment('root', '2026-03-14T10:00:00.000Z', {
        parentCommentId: null,
        rootCommentId: null,
      }),
      ref: {
        id: 'post-id',
        type: 'posts' as CollectionRefTypes,
      } as CommentRefSummary,
      replies: [
        makeComment('child-1', '2026-03-14T10:01:00.000Z', {
          parentCommentId: 'root',
          rootCommentId: 'root',
        }),
        makeComment('child-3', '2026-03-14T10:03:00.000Z', {
          parentCommentId: 'root',
          rootCommentId: 'root',
        }),
      ],
      replyWindow: {
        total: 3,
        returned: 2,
        threshold: 20,
        hasHidden: true,
        hiddenCount: 1,
        nextCursor: 'cursor-1',
      },
    }

    const data = {
      pageParams: [1],
      pages: [
        {
          data: [root],
          pagination: {
            currentPage: 1,
            totalPage: 1,
            hasPrevPage: false,
            hasNextPage: false,
            size: 10,
            total: 1,
          },
          readers: {},
        },
      ],
    } satisfies CommentThreadInfiniteData

    const next = mergeThreadRepliesIntoPages(data, {
      rootCommentId: 'root',
      replies: [
        makeComment('child-2', '2026-03-14T10:02:00.000Z', {
          parentCommentId: 'child-1',
          rootCommentId: 'root',
        }),
      ],
      replyWindow: {
        total: 3,
        returned: 3,
        threshold: 20,
        hasHidden: false,
        hiddenCount: 0,
      },
    })

    expect(
      next.pages[0]?.data[0]?.replies.map((comment) => comment.id),
    ).toEqual(['child-1', 'child-2', 'child-3'])
    expect(next.pages[0]?.data[0]?.replyWindow.hasHidden).toBe(false)
  })
})
