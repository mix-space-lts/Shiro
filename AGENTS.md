# Shiro LTS 维护计划

## 项目背景
- Shiro 已进入维护模式，不再添加新功能
- 后续不开放获取，分支到 https://github.com/mix-space-lts 做长期维护

## 核心目标
1. 清理不必要依赖
2. 确保 Actions 能跑通
3. 让 Shiro 与最新 core 兼容

## 已完成
- [x] 撤销不必要修改（.npmrc, pnpm-lock.yaml）
- [x] 更新 .npmrc 镜像源为 npmmirror.com
- [x] 添加 node-linker=hoisted 配置
- [x] 更新 README 版本限制 (>= 10.x)
- [x] 更新 docker.yml 镜像目标为 ghcr.io/mix-space-lts/shiro

## 待办任务

### 1. 依赖清理
- [ ] 移除赞助版功能相关依赖（白色 Shiroi 相关）
- [ ] 移除不必要的 devDependencies
- [ ] 更新 pnpm 版本要求

### 2. Actions 工作流
- [x] docker.yml - 已更新镜像
- [ ] 评估 nextjs_bundle_analysis.workflow - 可能不需要
- [ ] 评估 comment-pr.workflow - 可能不需要
- [ ] 添加基本的 CI workflow（lint、build）

### 3. 与 Core 兼容
- [ ] 对比 @mx-space/api-client 版本 (当前 2.3.0, core 最新 4.4.0)
- [ ] 如 API 有 breaking changes，进行适配

### 4. 测试验证
- [ ] 确保本地 dev 能正常启动
- [ ] 确保 build 能通过
- [ ] 确保 Actions 能成功运行

## 版本信息（当前）
- Shiro: node >= 20, pnpm@10.27.0
- Core: node >= 22, pnpm@11.1.2
- @mx-space/api-client: Shiro 用 2.3.0, Core 用 4.4.0
