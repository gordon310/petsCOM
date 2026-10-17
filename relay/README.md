# petsCOM 问卷线上收集

沿用 PAMFB 的流程：网页提交 → 独立 Cloudflare Worker → 每份答卷一个 GitHub Issue → 回查核实 → 成功回执。记录页按平台和填写人汇总，保留所有修订，支持筛选、明细及 CSV。

## 目标配置

- 填写页：`https://gordon310.github.io/petsCOM/`
- 记录页：`https://gordon310.github.io/petsCOM/records.html`
- 独立收集服务：`https://petscom-relay.zoubeacon.com/`
- 答卷仓库：`gordon310/petsCOM`，标签 `business-feedback`。
- 测试提交加 `test-response` 标签，记录页默认排除测试。

`intake-config.json` 的 `enabled` 是启用开关。服务未配置完成时必须保留为 `false`，不能把已保存本机草稿当成已收到线上答复。原 V0.4 的浏览器草稿继续沿用，旧 V0.3 导出功能继续保留。

## 当前状态

服务和仓库限定的 GITHUB_TOKEN 已配置，线上提交已启用。2026-10-17 已实际保存并回查两名填写人及一份修订（测试回执 #8、#9、#10），重试返回原记录号，测试记录不计正式回收。已有配置不需要重新授权或重新输入令牌。

凭据由账户所有者在 Cloudflare 的 petscom-relay → Settings → Runtime variables and secrets 保存为 Secret，名称 GITHUB_TOKEN，仅允许目标仓库 Issues 读写。不要读取或在文档中保存其值。

## 重新部署时的本机授权和启用（可选）

账户所有者在本机终端运行：

```bash
cd /Volumes/DEV/petsCOM
bash scripts/activate-online-collection.sh
```

脚本检查已有 Cloudflare 授权；缺少脚本发布权限 `workers_scripts:write` 时才重新授权，使用 PAMFB 所在账号。然后部署 `petscom-relay`，从隐藏的本机终端输入读取 GitHub Fine-grained token 并直接写入 Worker secret。请仅选 `gordon310/petsCOM`，权限仅需 Issues 读写（Metadata 为 GitHub 必需权限）；不要使用通用 `gh` 登录令牌。token 不进入聊天、命令参数、网页或仓库。

凭据配置完成后，脚本检查服务健康和 GitHub 读取能力，并创建一份带测试标记的答卷、回查和确认记录页可检索，再本地设置 `enabled=true`。Codex 随后完成带测试标记的实际提交、回查、多人/修订记录验收和前端发布。健康检查和单元测试不能代替真实线上提交验收。

## 接口与边界

- `GET /health`：是否已配置；不返回密钥。
- `POST /responses`：校验字段、公开留档同意、题号和选项；创建后回查。
- `GET /responses/:number`：核实一份答卷回执。
- `GET /records?page=1`：分页读取答卷。
- 仓库固定为 petsCOM；不接收用户传入的仓库或任意 Markdown 正文。
- 前台 `formKey` 是公开入口标记，不是身份认证；与 PAMFB 一样属于无需 GitHub 登录的公开需求收集。
- 答卷公开留档，提交前需勾选说明；不收集电话、门锁密码、病历、商业秘密等内容。
- 同一待提交内容重试使用相同提交编号；后端在最近 100 条仓库 Issue 内查重。规模扩大时再改用持久化的幂等存储。
- 列表可能比单份回执晚几秒更新；回执按已经持久化的单条记录核实。列表直接读取仓库并识别答卷标记，避免新记录的标签索引延迟影响查重。
- 本功能不提供永久删除按钮；记录保留和筛选避免误删。

## 验证

```bash
npm test
WRANGLER_LOG_PATH=/private/tmp/petscom-wrangler.log npm run deploy:relay -- --dry-run --outdir /private/tmp/petscom-relay-build
node scripts/preview-intake.mjs
```

最后一个命令是本机内存模拟。打开 `http://127.0.0.1:8765/?mode=test` 可测试多人提交、成功回执、记录详情和 CSV；不会向 GitHub 写入答卷，不构成线上回收验收。
