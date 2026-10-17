#!/bin/bash
# Run by the account owner in a local terminal. Never paste credentials in chat.
set +x
set -euo pipefail
cd "$(dirname "$0")/.."
export WRANGLER_SEND_METRICS=false
export WRANGLER_LOG_SANITIZE=true
export WRANGLER_LOG_PATH="${TMPDIR:-/private/tmp}/petscom-wrangler.log"
wrangler=./node_modules/.bin/wrangler
if [ ! -x "$wrangler" ]; then
  echo '请先在项目目录运行 npm ci --ignore-scripts。'
  exit 1
fi
authorization_status=$("$wrangler" whoami 2>&1 || true)
if [[ "$authorization_status" != *'workers_scripts (write)'* ]]; then
  printf '请使用 PAMFB 所在的 Cloudflare 账号完成浏览器授权。\n'
  "$wrangler" login --use-keyring --scopes account:read user:read workers:write workers_scripts:write workers_routes:write zone:read
fi
unset authorization_status
"$wrangler" deploy --config relay/wrangler.toml
printf '\n请准备 GitHub Fine-grained token：仅选择 gordon310/petsCOM，Issues: Read and write。\n'
printf '创建入口：https://github.com/settings/personal-access-tokens/new\n'
printf '凭据只从本机输入传给 Worker secret，不写入本地文件或网页。\n'
read -r -s -p '粘贴仅限 petsCOM 的 token（输入不显示）：' petscom_github_token
printf '\n'
trap 'unset petscom_github_token' EXIT
case "$petscom_github_token" in
  github_pat_*) ;;
  *) printf '请使用仅限该仓库的 Fine-grained token，不能使用通用 gh 登录令牌。\n'; exit 1 ;;
esac
printf '%s' "$petscom_github_token" | "$wrangler" secret put GITHUB_TOKEN --config relay/wrangler.toml
unset petscom_github_token
node --input-type=module <<'JS'
import {readFile,writeFile} from 'node:fs/promises';
import {SCHEMA} from './intake.mjs';
const config=JSON.parse(await readFile('intake-config.json','utf8'));
const health=await fetch(new URL('health',config.relayUrl),{signal:AbortSignal.timeout(20000)});
if (!health.ok || (await health.json()).ready!==true) throw Error('服务尚未就绪，网页仍保持未启用。');
const read=await fetch(new URL('records',config.relayUrl),{signal:AbortSignal.timeout(20000)});
if (!read.ok || !Array.isArray((await read.json()).records)) throw Error('GitHub 读取未通过，网页仍保持未启用。');
const submission={schema:SCHEMA,submissionId:crypto.randomUUID(),meta:{respondent:'部署验收联调',organization:'petsCOM联调',role:'部署测试'},answers:{S01:{selected:[],text:'仅用于核实线上保存与回执，不代表任何业务决定。'}},consentPublic:true,isTest:true};
const saved=await fetch(new URL('responses',config.relayUrl),{method:'POST',headers:{'Content-Type':'application/json','x-form-key':config.formKey},body:JSON.stringify(submission),signal:AbortSignal.timeout(30000)});
const receipt=await saved.json();
if (!saved.ok || receipt.ok!==true || receipt.verified!==true || !Number.isSafeInteger(receipt.number)) throw Error('线上测试保存未核实，网页仍保持未启用。');
const listed=await (await fetch(new URL('records',config.relayUrl))).json();
if (!listed.records?.some(r=>r.submissionId===submission.submissionId)) throw Error('测试记录尚未进入集中记录页，网页仍保持未启用。');
console.log('线上测试记录 #'+receipt.number+' 已保存并回查；标记为测试，不计正式回收。');
config.enabled=true;await writeFile('intake-config.json',JSON.stringify(config,null,2)+'\n');
console.log('服务已配置，intake-config.json 已本地启用。请回到聊天，让 Codex 完成真实提交验收和 GitHub Pages 发布。');
JS
