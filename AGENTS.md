# Shiro LTS 维护计划

## 项目背景
- Shiro 已进入维护模式，不再添加新功能
- 后续不开放获取，分支到 https://github.com/mix-space-lts 做长期维护
- 开发目录：`C:\Projects\mix-space\Shiro`（迁移自网络映射盘）
- 工作状态追踪：`C:\Projects\mix-space\SUMMARY.md`

## 已完成
- [x] 撤销不必要修改（.npmrc, pnpm-lock.yaml）
- [x] 所有 .npmrc 添加镜像源 + node-linker=hoisted
- [x] .npmrc 加入 .gitignore
- [x] README 版本限制改为 >= 10.x
- [x] docker.yml 镜像改为 ghcr.io/mix-space-lts/shiro
- [x] 添加 CI workflow (ci.yml)
- [x] 删除不必要 workflows (comment-pr, nextjs_bundle_analysis)
- [x] 项目从网络映射盘移到 `C:\Projects\mix-space\`
- [x] `@mx-space/api-client` 2.3.0 → 4.4.0 breaking changes 全部修复（67 files）
  - `.created`→`.createdAt`, `.modified`→`.modifiedAt`（27 files）
  - `.count.read`→`.readCount`, `.count.like`→`.likeCount`（5 files）
  - `allowComment` 从 PostModel/NoteModel/PageModel 移除 → 硬编码 `true`
  - `pageMeta` 从 AggregateRoot 移除 → `(d as any).pageMeta`
  - `pin`(boolean) → `pinAt`(string|null)
  - Comment 系统：移除冲突的 `CommentWithAnchor`, `source`→`authProvider`, `comment()`/`reply()`→`guestComment()`/`guestReply()`
  - 修复 `createdAtAt` typo
- [x] `tsc --noEmit` 通过，0 错误
- [x] CSS 构建修复：`::highlight()` → `.__noop_highlight`（sed in Dockerfile）
- [x] `next build` 成功
- [x] Docker 镜像 `shiro:latest` 构建成功
- [x] 定位空白页根因：`generateMetadata` 中 `fetchAggregationData()` 没有 `.catch()`
- [x] 修复 `generateMetadata`：加 `.catch(() => null)` + fallback 返回 `{}`

## 待办

### 验证
- [ ] 推分支到 GitHub，CI 自动验证 build（`ci/migrate`）
- [ ] 本地 Docker 重跑验证错误页面正常显示
- [ ] 依赖清理：移除赞助版功能（Shiroi）相关代码

## 已知问题
- Windows Docker Desktop 构建 OOM（`cannot allocate memory`），优先用 CI
- 空白页修复后，没后端时会显示"初始数据的获取失败"提示页，不再白屏
- Tailwind CSS v4 使用 CSS-based config（`@import "tailwindcss"`）
- api-client 4.4.0 源码位置：`core/packages/api-client/`

## 版本
- Shiro: node >= 20, pnpm@10.27.0
- Core: node >= 22, pnpm@11.1.2
- CI: Node 22, pnpm 10, ubuntu-latest
