export const SCHEMA = 'petscom-business-v0.4';
export const LABEL = 'business-feedback';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MARKER = /<!-- petscom-response-v1:([A-Za-z0-9+/=]+) -->/;
export function normalizeSubmission(input, questionnaire) {
  if (!object(input) || input.schema !== SCHEMA || !uuid.test(input.submissionId || '')) throw Error('答卷格式不正确，请刷新页面后重试。');
  if (input.consentPublic !== true) throw Error('请先确认答卷公开留档说明。');
  const meta = {};
  for (const field of ['respondent','organization','role']) {
    const value = input.meta?.[field];
    if (typeof value !== 'string' || value.length > 120 || /[\r\n\u0000]/.test(value)) throw Error('填写人、平台及岗位信息格式不正确。');
    meta[field] = value.trim();
  }
  if (!meta.respondent || !meta.organization) throw Error('请填写姓名或称呼，以及平台公司/团队名称。');
  if (!object(input.answers)) throw Error('答卷内容格式不正确。');
  const questions = new Map(questionnaire.questions.map(q=>[q.id,q]));
  const answers = {};
  if (Object.keys(input.answers).some(id=>!questions.has(id))) throw Error('存在不属于本问卷的答案。');
  for (const [id,q] of questions) {
    if (!Object.hasOwn(input.answers,id)) continue;
    const answer=input.answers[id];
    if (!q || !object(answer) || !Array.isArray(answer.selected) || typeof answer.text !== 'string') throw Error('存在不属于本问卷的答案或错误格式。');
    if (answer.text.length > 2000 || answer.selected.some(v=>typeof v !== 'string' || !q.options.includes(v))) throw Error(`${id} 的选项或补充说明无效（每题最多 2000 字）。`);
    const selected = q.options.filter(option=>answer.selected.includes(option));
    if ((q.single && selected.length>1) || (q.maxChoices && selected.length>q.maxChoices)) throw Error(`${id} 超过可选项数。`);
    const text = answer.text.trim();
    if (selected.length || text) answers[id] = {selected,text};
  }
  if (!Object.keys(answers).length) throw Error('请至少回答一道问题；可以分次提交修订版。');
  const result = {schema:SCHEMA,version:questionnaire.version,submissionId:input.submissionId,meta,answers,consentPublic:true,isTest:input.isTest===true};
  if (new TextEncoder().encode(JSON.stringify(result)).length > 24000) throw Error('答复内容较长，请精简补充说明后提交；完整内容仍可导出备份。');
  return result;
}
export function encodePayload(value) {
  return btoa(Array.from(new TextEncoder().encode(JSON.stringify(value)),b=>String.fromCharCode(b)).join(''));
}
export function decodePayload(value) {
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value),c=>c.charCodeAt(0))));
}
export function issueFor(payload, questionnaire, now = new Date().toISOString()) {
  const value = {...payload,submittedAt:now,answeredCount:Object.keys(payload.answers).length,questionCount:questionnaire.questions.length};
  const displayDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
  const title = `[${value.isTest?'联调测试':'宠物运营需求答卷'}] ${value.meta.organization} / ${value.meta.respondent} / ${displayDate}`.slice(0,200);
  const body = ['# 小程序运营业务流程答卷 V'+value.version,'',...(value.isTest?['**联调测试答卷，不计入正式回收。**','']:[]),`- 填写人：${value.meta.respondent}`,`- 平台公司/团队：${value.meta.organization}`,`- 岗位：${value.meta.role || '未填写'}`,`- 提交时间：${now}`,`- 已回答：${value.answeredCount}/${value.questionCount}`,`- 提交编号：${value.submissionId}`,'',...questionnaire.confirmedFacts.map(f=>'- '+f),''];
  for (const q of questionnaire.questions) {
    const a=value.answers[q.id];
    body.push(`## ${q.id} ${q.title}`,'',`选择：${a?.selected.length?a.selected.join('；'):'未选择'}`,`说明：${a?.text || '未填写'}`,'');
  }
  body.push('<!-- petscom-response-v1:'+encodePayload(value)+' -->');
  if (body.join('\n').length>60000) throw Error('答卷过长，请精简后再提交。');
  return {title,body:body.join('\n'),labels:[LABEL,...(value.isTest?['test-response']:[])]};
}
export function parseIssue(issue) {
  if (issue.pull_request) return null;
  const match=String(issue.body || '').match(MARKER);
  if (!match) return null;
  try {
    const p=decodePayload(match[1]);
    if (p.schema!==SCHEMA || !uuid.test(p.submissionId || '') || !object(p.meta) || !object(p.answers)) return null;
    if (!Number.isSafeInteger(issue.number) || issue.number<1 || !['respondent','organization','role'].every(k=>typeof p.meta[k]==='string') || !p.meta.respondent.trim() || !p.meta.organization.trim()) return null;
    if (!Object.entries(p.answers).every(([id,a])=>/^[SCWBRX]\d{2}$/.test(id) && object(a) && Array.isArray(a.selected) && a.selected.every(v=>typeof v==='string') && typeof a.text==='string')) return null;
    return {...p,answeredCount:Object.keys(p.answers).length,number:issue.number,url:issue.html_url,createdAt:issue.created_at,state:issue.state};
  } catch { return null; }
}
export function groupRecords(records) {
  const groups=new Map();
  for (const r of [...records].sort((a,b)=>b.number-a.number)) {
    const key=JSON.stringify([r.meta.organization.trim(),r.meta.respondent.trim()]);
    if (!groups.has(key)) groups.set(key,{organization:r.meta.organization,respondent:r.meta.respondent,count:0,latest:r});
    groups.get(key).count++;
  }
  return [...groups.values()];
}
export function toCSV(records, questionnaire) {
  const cell=value=>{
    let s=String(value ?? '');
    if (/^[\s]*[=+@-]/.test(s)) s="'"+s;
    return '"'+s.replaceAll('"','""')+'"';
  };
  const rows=[['记录号','提交时间','平台','填写人','岗位','已答题数','总题数','测试记录','记录链接',...questionnaire.questions.map(q=>q.id+' '+q.title)]];
  for (const r of records) rows.push([r.number,r.createdAt,r.meta.organization,r.meta.respondent,r.meta.role,r.answeredCount,r.questionCount,r.isTest?'是':'否',r.url,...questionnaire.questions.map(q=>{const a=r.answers[q.id];return a?[a.selected.join('；'),a.text].filter(Boolean).join('\n'):'';})]);
  return '\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
