import test from 'node:test';
import assert from 'node:assert/strict';
import questionnaire from '../questionnaire.json' with {type:'json'};
import worker from '../relay/worker.mjs';
import {SCHEMA,normalizeSubmission,issueFor,parseIssue,groupRecords,toCSV} from '../intake.mjs';

const env={GITHUB_TOKEN:'unit-test-token',GITHUB_REPO:'gordon310/petsCOM',ALLOWED_ORIGIN:'https://gordon310.github.io',FORM_KEY:'test-key'};
const base='https://petscom-relay.zoubeacon.com';
const payload=(n=1)=>({schema:SCHEMA,submissionId:`12345678-1234-4234-8234-${String(n).padStart(12,'0')}`,meta:{respondent:'运营甲',organization:'测试平台',role:'客服'},answers:{S02:{selected:['上门喂猫及猫砂清洁','上门遛狗'],text:'按现场情况确认。\n补资料后复核。'}},consentPublic:true,isTest:true});
const request=(data,extra={})=>new Request(base+'/responses',{method:'POST',headers:{Origin:env.ALLOWED_ORIGIN,'Content-Type':'application/json','x-form-key':'test-key',...extra},body:JSON.stringify(data)});
function github(records=[]) {
  const store=[...records],calls=[];
  return {store,calls,fetch:async(url,options={})=>{
    calls.push({url:String(url),options});
    assert.ok(String(url).startsWith('https://api.github.com/repos/gordon310/petsCOM/'));
    if (options.method==='POST') {
      const input=JSON.parse(options.body),number=store.length+1;
      const issue={...input,number,created_at:new Date().toISOString(),state:'open',html_url:`https://github.com/gordon310/petsCOM/issues/${number}`};store.push(issue);
      return Response.json(issue,{status:201});
    }
    const match=String(url).match(/\/issues\/(\d+)$/);
    if (match) {const issue=store.find(r=>r.number===Number(match[1]));return issue?Response.json(issue):Response.json({}, {status:404});}
    return Response.json([...store].reverse());
  }};
}
const originalFetch=globalThis.fetch;
test.afterEach(()=>{globalThis.fetch=originalFetch});

test('round trip preserves Chinese text, choices, identity, and answered count',()=>{
  const p=normalizeSubmission(payload(),questionnaire),issue=issueFor(p,questionnaire);
  const record=parseIssue({...issue,number:1,created_at:'2026-10-17T00:00:00Z',state:'open'});
  assert.equal(record.meta.respondent,'运营甲');assert.equal(record.answeredCount,1);assert.equal(record.questionCount,38);
  assert.deepEqual(record.answers.S02,p.answers.S02);assert.equal(record.isTest,true);
  assert.match(issue.title,/联调测试/);assert.deepEqual(issue.labels,['business-feedback','test-response']);
});
test('requires publication consent, identity, a known question, and a real answer',()=>{
  for (const edit of [p=>p.consentPublic=false,p=>p.meta.respondent='',p=>p.meta.organization='',p=>p.answers={},p=>p.answers.INVALID={selected:[],text:'x'},p=>p.answers.S02.selected=['非法选项'],p=>p.answers.S02.text='字'.repeat(2001)]) {
    const p=payload();edit(p);assert.throws(()=>normalizeSubmission(p,questionnaire));
  }
  const p=payload();p.answers.S01={selected:questionnaire.questions.find(q=>q.id==='S01').options.slice(0,2),text:''};
  assert.throws(()=>normalizeSubmission(p,questionnaire),/可选项数/);
});
test('canonical form survives different entry order without generating a changed signature',()=>{
  const a=payload(),b=payload();a.answers.S01={selected:[],text:'先审核'};
  b.answers={S01:{selected:[],text:'先审核'},S02:{selected:[...a.answers.S02.selected].reverse(),text:a.answers.S02.text}};
  assert.equal(JSON.stringify(normalizeSubmission(a,questionnaire)),JSON.stringify(normalizeSubmission(b,questionnaire)));
});
test('every participant and revision has its own record, same request is reused',async()=>{
  const mock=github();globalThis.fetch=mock.fetch;
  const p1=payload(1),p2=payload(2);p2.meta.respondent='运营乙';
  const revision=payload(3);revision.answers.S02.text='修订：增加值班联络。';
  for (const p of [p1,p2,revision]) {const r=await worker.fetch(request(p),env);assert.equal(r.status,201);assert.equal((await r.json()).verified,true);}
  assert.equal(mock.store.length,3);
  const repeat=await worker.fetch(request(p1),env);const body=await repeat.json();assert.equal(body.number,1);assert.equal(body.duplicate,true);assert.equal(mock.store.length,3);
  const pChanged=payload(1);pChanged.answers.S02.text='不能覆盖原答卷';
  assert.equal((await worker.fetch(request(pChanged),env)).status,409);assert.equal(mock.store.length,3);
  const rows=mock.store.map(parseIssue),groups=groupRecords(rows);
  assert.equal(groups.length,2);assert.equal(groups.find(g=>g.respondent==='运营甲').count,2);assert.equal(groups.find(g=>g.respondent==='运营甲').latest.number,3);
});
test('incorrect origin, entry key, missing server token, and malformed JSON never create records',async()=>{
  const mock=github();globalThis.fetch=mock.fetch;
  assert.equal((await worker.fetch(request(payload(),{Origin:'https://unrelated.invalid'}),env)).status,403);
  assert.equal((await worker.fetch(request(payload(),{'x-form-key':'wrong'}),env)).status,401);
  assert.equal((await worker.fetch(request(payload()),{...env,GITHUB_TOKEN:''})).status,503);
  assert.equal((await worker.fetch(request(payload()),{...env,GITHUB_REPO:'gordon310/pamfb'})).status,503);
  const r=new Request(base+'/responses',{method:'POST',headers:{Origin:env.ALLOWED_ORIGIN,'x-form-key':'test-key'},body:'invalid'});
  assert.equal((await worker.fetch(r,env)).status,400);assert.equal(mock.store.length,0);
});
test('retry and record reads do not depend on a delayed GitHub label index',async()=>{
  const mock=github();
  globalThis.fetch=async(url,options)=>new URL(url).searchParams.has('labels')?Response.json([]):mock.fetch(url,options);
  const p=payload(44);
  const first=await (await worker.fetch(request(p),env)).json();
  const retry=await (await worker.fetch(request(p),env)).json();
  assert.equal(retry.number,first.number);assert.equal(retry.duplicate,true);assert.equal(mock.store.length,1);
  const records=await (await worker.fetch(new Request(base+'/records'),env)).json();
  assert.equal(records.records.length,1);
  const reads=mock.calls.filter(c=>new URL(c.url).searchParams.has('per_page'));
  assert.ok(reads.every(c=>c.options.cache==='no-store' && c.options.headers['Cache-Control']==='no-cache'));
});
test('receipt is checked, and failed GitHub saving does not produce a success receipt',async()=>{
  const mock=github();globalThis.fetch=mock.fetch;
  const posted=await worker.fetch(request(payload()),env);const p=await posted.json();assert.equal(p.verified,true);
  const read=await worker.fetch(new Request(base+'/responses/1'),env);assert.equal((await read.json()).record.submissionId,p.submissionId);
  globalThis.fetch=async()=>Response.json({error:'unavailable'},{status:503});
  const failed=await worker.fetch(request(payload(2)),env);assert.equal(failed.status,502);assert.equal((await failed.json()).ok,undefined);
});
test('read-back failure is explicitly unverified rather than falsely successful',async()=>{
  const mock=github();globalThis.fetch=async(url,opt)=>String(url).endsWith('/issues/1')?Response.json({}, {status:503}):mock.fetch(url,opt);
  const r=await worker.fetch(request(payload()),env);assert.equal(r.status,201);assert.equal((await r.json()).verified,false);
});
test('record listing retains all revisions and distinguishes test records',async()=>{
  const mock=github();globalThis.fetch=mock.fetch;
  await worker.fetch(request(payload(1)),env);
  const real=payload(2);real.isTest=false;await worker.fetch(request(real),env);
  const response=await worker.fetch(new Request(base+'/records?page=1'),env),result=await response.json();
  assert.equal(result.records.length,2);assert.equal(result.records.filter(r=>!r.isTest).length,1);assert.equal(result.hasMore,false);
  assert.equal((await worker.fetch(new Request(base+'/records?page=-1'),env)).status,400);
});
test('CSV preserves punctuation and multiline answers while preventing spreadsheet formulas',()=>{
  const p=normalizeSubmission(payload(),questionnaire);p.meta.organization='=HYPERLINK("test")';
  const row=parseIssue({...issueFor(p,questionnaire),number:1,created_at:'2026-10-17T00:00:00Z',html_url:'https://github.com/gordon310/petsCOM/issues/1'});
  const csv=toCSV([row],questionnaire);assert.ok(csv.startsWith('\ufeff'));assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('补资料后复核'));assert.ok(csv.includes('S02 首期客户端开放哪些服务'));
});
test('unrelated and corrupt issues are not interpreted as questionnaire responses',()=>{
  assert.equal(parseIssue({body:'ordinary issue'}),null);assert.equal(parseIssue({body:'<!-- petscom-response-v1:invalid -->'}),null);
});

test('oversized streamed input is rejected before calling GitHub',async()=>{
  const mock=github();globalThis.fetch=mock.fetch;
  const r=new Request(base+'/responses',{method:'POST',headers:{Origin:env.ALLOWED_ORIGIN,'x-form-key':'test-key'},body:'x'.repeat(120001)});
  assert.equal((await worker.fetch(r,env)).status,413);assert.equal(mock.calls.length,0);
});
