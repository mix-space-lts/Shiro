import { useEffect } from 'react'

import { useSocketIsConnect } from '~/atoms/hooks/socket'
import { socketWorker } from '~/socket/worker-client'
import { SocketEmitEnum } from '~/types/events'

/**
 * Join an article room on mount (so the server can track active readers),
 * and leave on unmount.
 *
 * Room name format matches server's `buildArticleRoomName`: `article-{id}`
 */
export const useArticleRoom = (articleId: string) => {
  const socketIsConnected = useSocketIsConnect()

  useEffect(() => {
    if (!socketIsConnected) return

    const roomName = `article-${articleId}`
    socketWorker.emit(SocketEmitEnum.Join, { roomName })

    return () => {
      socketWorker.emit(SocketEmitEnum.Leave, { roomName })
    }
  }, [articleId, socketIsConnected])
}
