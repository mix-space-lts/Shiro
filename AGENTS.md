# Shiro LTS 维护计划

## 项目背景
- Shiro 已进入维护模式，不再添加新功能
- 后续不开放获取，分支到 https://github.com/mix-space-lts 做长期维护

## 已完成
- [x] 撤销不必要修改（.npmrc, pnpm-lock.yaml）
- [x] 所有 .npmrc 添加镜像源 + node-linker=hoisted
- [x] .npmrc 加入 .gitignore
- [x] README 版本限制改为 >= 10.x
- [x] docker.yml 镜像改为 ghcr.io/mix-space-lts/shiro
- [x] 添加 CI workflow (ci.yml)
- [x] 删除不必要 workflows (comment-pr, nextjs_bundle_analysis)

## 待办

### API 兼容性
- Shiro 用 @mx-space/api-client@2.3.0，Core 用 4.4.0
- 可能需要更新客户端版本并适配 API 变更

### 测试验证
- 本地 dev 能启动
- build 能通过
- Actions 能成功

## 版本
- Shiro: node >= 20, pnpm@10.27.0
- Core: node >= 22, pnpm@11.1.2
