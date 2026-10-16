import {groupRecords,toCSV} from './intake.mjs';
const $=id=>document.getElementById(id);
const esc=v=>String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let records=[],questionnaire,config,loaded=false;
const date=v=>new Date(v).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});
function filtered() { return records.filter(r=>($('include-tests').checked || !r.isTest) && r.meta.organization.toLowerCase().includes($('filter-company').value.trim().toLowerCase()) && r.meta.respondent.toLowerCase().includes($('filter-name').value.trim().toLowerCase())); }
function render() {
  const view=filtered(),groups=groupRecords(view);
  $('totals').textContent=`当前筛选：${view.length} 份答卷，${groups.length} 个填写人组（平台＋姓名）；测试记录 ${records.filter(r=>r.isTest).length} 份${$('include-tests').checked?'已纳入':'未纳入'}。`;
  $('summary-body').innerHTML=groups.map(g=>`<tr><td>${esc(g.organization)}</td><td>${esc(g.respondent)}</td><td>${g.count}</td><td>${esc(date(g.latest.createdAt))}</td><td>${g.latest.answeredCount}/${g.latest.questionCount}</td></tr>`).join('') || '<tr><td colspan="5">当前筛选没有答卷。</td></tr>';
  $('records-body').innerHTML=view.map(r=>`<tr><td>#${r.number}${r.isTest?'（测试）':''}</td><td>${esc(r.meta.organization)}<br>${esc(r.meta.respondent)} / ${esc(r.meta.role)}</td><td>${esc(date(r.createdAt))}</td><td>${r.answeredCount}/${r.questionCount}</td><td><button type="button" class="secondary" data-number="${r.number}">查看答卷</button></td></tr>`).join('') || '<tr><td colspan="5">暂无提交记录。</td></tr>';
  $('export-csv').disabled=!loaded || !view.length;
}
async function load() {
  $('refresh').disabled=true;$('records-status').textContent='正在读取线上答卷…';
  try {
    [config,questionnaire]=await Promise.all(['intake-config.json','questionnaire.json'].map(async path=>{const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw Error('页面配置加载失败。');return r.json();}));
    if (!config.enabled) throw Error('线上收集服务尚未启用。');
    const result=[];let page=1,more=true;
    while(more) {
      const url=new URL('records',config.relayUrl);url.searchParams.set('page',page++);
      const response=await fetch(url,{cache:'no-cache',signal:AbortSignal.timeout(20000)});
      const body=await response.json();
      if (!response.ok || !Array.isArray(body.records)) throw Error(body.error || '记录读取失败。');
      result.push(...body.records);more=body.hasMore===true;
    }
    records=result.sort((a,b)=>b.number-a.number);loaded=true;render();
    $('records-status').textContent=`已从线上读取 ${records.length} 份记录（含测试）；时间显示为北京时间。`;
  } catch(error) { $('records-status').textContent='无法确认回收数量：'+error.message+(loaded?' 上次已加载的记录仍保留。':''); }
  finally { $('refresh').disabled=false; }
}
for (const id of ['filter-company','filter-name','include-tests']) $(id).addEventListener('input',render);
$('refresh').addEventListener('click',load);
$('records-body').addEventListener('click',event=>{
  const button=event.target.closest('[data-number]');if(!button)return;
  const record=records.find(r=>r.number===Number(button.dataset.number));if(!record)return;
  $('answer-detail').hidden=false;
  $('answer-detail').innerHTML=`<h2>答卷 #${record.number} · ${esc(record.meta.organization)} / ${esc(record.meta.respondent)}</h2><p>${esc(date(record.createdAt))} · ${record.answeredCount}/${record.questionCount} 题${record.isTest?' · 联调测试':''}</p>`+questionnaire.questions.map(q=>{const a=record.answers[q.id];return `<details><summary>${q.id} ${esc(q.title)}</summary><p>选择：${esc(a?.selected.join('；') || '未选择')}</p><p class="prompt">说明：${esc(a?.text || '未填写')}</p></details>`;}).join('');
  $('answer-detail').scrollIntoView({behavior:'smooth',block:'start'});
});
$('export-csv').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([toCSV(filtered(),questionnaire)],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='petsCOM-运营需求答卷.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
});
load();
