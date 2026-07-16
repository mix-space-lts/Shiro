#!/usr/bin/env node

/**
 * dev:warmup — 预热 Next.js dev server 的所有路由
 *
 * 用法: node scripts/dev-warmup.mjs [port] [baseUrl]
 * 默认: port=2323, baseUrl=http://localhost
 *
 * 环境变量:
 *   WARMUP_SERIAL=0    并行预热（默认串行，避免 Turbopack 并发编译竞态）
 *
 * 等 server 就绪后请求主要路由，触发编译缓存。
 */

const PORT = Number.parseInt(process.argv[2] || '2323', 10)
const BASE = process.argv[3] || `http://localhost:${PORT}`
const SERIAL = process.env.WARMUP_SERIAL !== '0'

const ROUTES = [
  '/',
  '/posts',
  '/notes',
  '/notes/series',
  '/timeline',
  '/timeline?type=post',
  '/timeline?type=note',
  '/timeline?memory=1',
  '/thinking',
  '/says',
  '/projects',
  '/friends',
  '/feed',
  // 假设使用默认测试数据
  '/posts/tech',
  '/posts/tech/docker-deployment-best-practices',
  '/notes/5',
  '/notes/series/dev-log',
]

/**
 * 轮询等待 dev server 启动
 */
async function waitForServer(timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(3000) })
      if (res.ok || res.status < 500) return true
    } catch {
      // server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  console.warn('[warmup] server not ready after %ds, skipping', timeoutMs / 1000)
  return false
}

async function warmup() {
  console.log(`[warmup] waiting for server on ${BASE} …`)
  const ready = await waitForServer()
  if (!ready) return

  const mode = SERIAL ? 'serial' : 'parallel'
  console.log(`[warmup] server ready, warming ${ROUTES.length} routes (${mode}) …`)

  const okCount = { value: 0 }

  if (SERIAL) {
    for (const path of ROUTES) {
      const started = Date.now()
      const url = `${BASE}${path}`
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
        const ms = Date.now() - started
        const bad = res.status >= 500
        console.log(
          `[warmup] %s %s %dms${bad ? ' ⚠️' : ''}`,
          res.status, path, ms,
        )
        if (!bad) okCount.value++
      } catch (err) {
        const ms = Date.now() - started
        console.warn(`[warmup] ERR %s %dms: %s`, path, ms, err.message)
      }
    }
  } else {
    const results = await Promise.allSettled(
      ROUTES.map(async (path) => {
        const started = Date.now()
        const url = `${BASE}${path}`
        const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
        const ms = Date.now() - started
        const bad = res.status >= 500
        console.log(
          `[warmup] %s %s %dms${bad ? ' ⚠️' : ''}`,
          res.status, path, ms,
        )
        return { ok: !bad, path }
      }),
    )
    okCount.value = results.filter(
      (r) => r.status === 'fulfilled' && r.value?.ok,
    ).length
  }

  const ok = okCount.value
  const fail = ROUTES.length - ok
  const emoji = fail ? '⚠️' : '✅'
  const line = '═'.repeat(42)
  console.log(`\n\x1b[1;32m  ${line}\n  ║  ${emoji}  warmup done: ${ok} ok, ${fail} failed  ║\n  ${line}\x1b[0m\n`)
}

warmup()
