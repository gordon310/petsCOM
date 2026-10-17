import questionnaire from '../questionnaire.json' with {type:'json'};
import {normalizeSubmission,issueFor,parseIssue} from '../intake.mjs';

export default {
  async fetch(request,env) {
    const origin=request.headers.get('Origin');
    const allowed=env.ALLOWED_ORIGIN || 'https://gordon310.github.io';
    const cors={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, x-form-key','Vary':'Origin'};
    const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
    if (origin && origin!==allowed) return reply({error:'来源未获允许。'},403);
    const path=new URL(request.url).pathname.replace(/\/$/,'');
    if (request.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
    if (request.method==='GET' && path==='/health') return reply({ready:Boolean(env.GITHUB_TOKEN && env.GITHUB_REPO==='gordon310/petsCOM'),repository:env.GITHUB_REPO || null},env.GITHUB_TOKEN?200:503);
    if (!['GET','POST'].includes(request.method)) return reply({error:'不支持的请求。'},405);
    if (!env.GITHUB_TOKEN || env.GITHUB_REPO!=='gordon310/petsCOM') return reply({error:'收集服务尚未配置完成，请联系问卷发起人。'},503);
    const headers={Authorization:'Bearer '+env.GITHUB_TOKEN,Accept:'application/vnd.github+json','User-Agent':'petscom-questionnaire','Cache-Control':'no-cache'};
    const base='https://api.github.com/repos/'+env.GITHUB_REPO;
    async function list(page=1) {
      // Read repository issues directly: label-filtered results can lag a newly created answer.
      const response=await fetch(`${base}/issues?state=all&sort=created&direction=desc&per_page=100&page=${page}`,{headers,cache:'no-store'});
      if (!response.ok) throw Error('无法读取已收集记录。');
      const issues=await response.json();
      return {issues,hasMore: /rel="next"/.test(response.headers.get('Link') || '')};
    }
    try {
      if (request.method==='GET' && path==='/records') {
        const page=Number(new URL(request.url).searchParams.get('page') || '1');
        if (!Number.isInteger(page) || page<1 || page>10000) return reply({error:'页码无效。'},400);
        const {issues,hasMore}=await list(page);
        return reply({records:issues.map(parseIssue).filter(Boolean),hasMore});
      }
      const found=path.match(/^\/responses\/(\d+)$/);
      if (request.method==='GET' && found) {
        const response=await fetch(base+'/issues/'+found[1],{headers});
        if (!response.ok) return reply({error:'未找到提交记录。'},response.status===404?404:502);
        const record=parseIssue(await response.json());
        return record?reply({record}):reply({error:'不是本问卷的答卷。'},404);
      }
      if (request.method!=='POST' || path!=='/responses') return reply({error:'入口不存在。'},404);
      if (request.headers.get('x-form-key')!==env.FORM_KEY) return reply({error:'问卷入口已更新，请刷新页面后重试。'},401);
      if (Number(request.headers.get('Content-Length'))>120000) return reply({error:'答卷过长。'},413);
      const reader=request.body?.getReader();
      if (!reader) return reply({error:'缺少答卷内容。'},400);
      const chunks=[];let size=0;
      while(true) {
        const {done,value}=await reader.read();if(done)break;
        size+=value.byteLength;
        if(size>120000){await reader.cancel();return reply({error:'答卷过长。'},413);}
        chunks.push(value);
      }
      const bytes=new Uint8Array(size);let offset=0;
      for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
      const raw=new TextDecoder().decode(bytes);
      let payload;
      try { payload=normalizeSubmission(JSON.parse(raw),questionnaire); } catch(error) { return reply({error:error.message},400); }
      // shortcut: retry de-duplication checks the latest 100 repository issues; use durable storage for high-volume collection.
      const {issues}=await list();
      const existing=issues.map(parseIssue).find(r=>r?.submissionId===payload.submissionId);
      if (existing) {
        const compare=p=>JSON.stringify({meta:p.meta,answers:p.answers,isTest:p.isTest});
        if (compare(existing)!==compare(payload)) return reply({error:'提交编号与已有答卷内容不一致，请联系问卷发起人。'},409);
        return reply({ok:true,verified:true,number:existing.number,submissionId:payload.submissionId,duplicate:true});
      }
      const issue=issueFor(payload,questionnaire);
      const response=await fetch(base+'/issues',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(issue)});
      if (!response.ok) return reply({error:'线上保存未成功，请保留草稿并重试。'},502);
      const created=await response.json();
      if (!Number.isSafeInteger(created.number) || created.number<1) return reply({error:'服务未返回有效记录号，请保留草稿并联系发起人。'},502);
      const check=await fetch(base+'/issues/'+created.number,{headers});
      const record=check.ok?parseIssue(await check.json()):null;
      const verified=record?.submissionId===payload.submissionId;
      return reply({ok:true,verified,number:created.number,submissionId:payload.submissionId},201);
    } catch { return reply({error:'收集服务暂时无法确认结果。请保留草稿，稍后使用同一答卷重试。'},502); }
  }
};
