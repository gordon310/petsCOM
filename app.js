import {SCHEMA,normalizeSubmission} from './intake.mjs';
(async function () {
  const testMode=new URLSearchParams(location.search).get('mode')==='test';
  const key = 'petscom-business-flow-questionnaire-v04'+(testMode?'-test':'');
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let sections;
  let intakeConfig;
  let data, state = {meta:{},answers:{},section:'S'}, storageReady = true;
  try {
    const response = await fetch('questionnaire.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('无法加载题目');
    data = await response.json();
    if (data.version !== '0.4' || data.questions.length !== 38) throw new Error('题目版本不匹配');
  } catch (error) {
    $('status').className = 'error';
    $('status').textContent = '问卷未能加载，请刷新重试。仍无法打开时，请联系项目负责人。';
    return;
  }
  sections = Object.fromEntries(data.sections.map(([id,title,description])=>[id,[title,description]]));
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const draft = JSON.parse(stored);
      if (draft.version !== data.version || !draft.answers || typeof draft.answers !== 'object' || Array.isArray(draft.answers)) throw new Error('草稿格式不匹配');
      for (const field of ['respondent','role','organization']) {
        if (typeof draft.meta?.[field] === 'string') state.meta[field] = draft.meta[field];
      }

      if (draft.online && typeof draft.online==='object') state.online=draft.online;
      if (Object.hasOwn(sections,draft.section)) state.section = draft.section;
      for (const q of data.questions) {
        const saved = draft.answers[q.id];
        if (saved && Array.isArray(saved.selected) && typeof saved.text === 'string') {
          state.answers[q.id] = {selected:saved.selected.filter(v => q.options.includes(v)),text:saved.text};
        }
      }
    }
  } catch (error) {
    storageReady = false;
    $('status').className = 'error';
    $('status').textContent = '本机草稿无法读取或自动保存不可用。现有草稿不会被覆盖；请导出本次答复后离开页面。';
  }
  const answer = q => state.answers[q.id] || {selected:[],text:''};
  const hasAnswer = q => answer(q).selected.length > 0 || answer(q).text.trim().length > 0;
  const fields = data.questions;
  $('confirmed-facts').innerHTML = data.confirmedFacts.map(fact=>`<li>${escape(fact)}</li>`).join('');
  $('sections').innerHTML = Object.entries(sections).map(([section,[label]]) => `<button type="button" data-section="${section}" aria-pressed="false">${escape(label)}<small>${fields.filter(q=>q.section===section).length}</small></button>`).join('');
  $('panels').innerHTML = Object.entries(sections).map(([section,[label,description]]) => `<section data-panel="${section}" hidden><div class="section-intro"><h2>${escape(label)}</h2><p>${escape(description)}</p></div>${fields.filter(q=>q.section===section).map(q=>{
    const a = answer(q);
    const deps = (q.dependencies || []).map(id=>`<a href="#q-${id}" data-dependency="${id}">${id}</a>`).join('');
    return `<details class="question" id="q-${q.id}"><summary><span class="qid">${q.id}</span><span class="q-title">${escape(q.title)}${q.required===true?' <small>★</small>':''}</span><span class="answered" id="badge-${q.id}"></span><span class="chevron" aria-hidden="true">⌄</span></summary><div class="q-content">${deps?`<div class="deps">前置问题：${deps}<span>（请先由负责人确认）</span></div>`:''}${q.prompt?`<p class="prompt">${escape(q.prompt)}</p>`:''}${q.recommended?`<div class="callout"><strong>推荐业务流程</strong>${escape(q.recommended)}</div><div class="callout challenge"><strong>场景追问 · Grill-me</strong>${escape(q.challenge)}</div>`:''}${q.options.length?`<fieldset><legend>${q.single?'选择一种安排':'选择适用项（可多选）'}</legend>${q.options.map((option,i)=>`<label class="option"><input type="${q.single?'radio':'checkbox'}" name="choice-${q.id}" value="${i}" data-question="${q.id}" data-option="${i}" ${a.selected.includes(option)?'checked':''}><span>${escape(option)}</span></label>`).join('')}</fieldset>`:''}<label for="text-${q.id}">补充业务步骤与责任岗位<textarea id="text-${q.id}" data-question="${q.id}" data-text rows="3" placeholder="${escape(q.required)}">${escape(a.text)}</textarea></label><p class="small">需说明：${escape(q.required)}<br>请写业务岗位、操作步骤、处理时间和退回/异常的下一步；未定事项写跟进人及日期。</p></div></details>`;
  }).join('')}</section>`).join('');
  for (const field of ['respondent','role','organization']) $(field).value = state.meta[field] || '';
  function updateProgress() {
    const count = fields.filter(hasAnswer).length;
    const group = fields.filter(q=>q.section===state.section);
    $('progress-text').textContent = `本组已记录 ${group.filter(hasAnswer).length} / ${group.length} 题 · 全部 ${count} / ${fields.length}`;
    $('progress').value = count;
    for (const q of fields) $('badge-'+q.id).textContent = hasAnswer(q)?'已记录':'';
  }
  function save() {
    if (storageReady) {
      try {
        localStorage.setItem(key, JSON.stringify({...state,version:data.version,updatedAt:new Date().toISOString()}));
        $('save-state').textContent = '草稿已保存到当前浏览器';
      } catch (error) {
        storageReady = false;
        $('save-state').textContent = '自动保存失败，请立即导出备份';
        $('status').className = 'error';
        $('status').textContent = '浏览器无法保存草稿。请点击导出答复保存文件，避免离开后丢失。';
      }
    } else $('save-state').textContent = '自动保存不可用，请导出备份';
    updateProgress();
  }
  function show(section) {
    if (!Object.hasOwn(sections,section)) return;
    state.section = section;
    document.querySelectorAll('[data-panel]').forEach(el=>el.hidden=el.dataset.panel!==section);
    document.querySelectorAll('[data-section]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.section===section)));
    const panel = document.querySelector(`[data-panel="${section}"]`);
    if (!panel.querySelector('details[open]')) panel.querySelector('details').open = true;
    updateProgress();
  }
  $('sections').addEventListener('click', event=>{
    const target = event.target.closest('[data-section]');
    if (target) {show(target.dataset.section);save();}
  });
  $('panels').addEventListener('click', event=>{
    const target = event.target.closest('[data-dependency]');
    if (target) {
      event.preventDefault();show(target.dataset.dependency.charAt(0));
      const details = $('q-'+target.dataset.dependency);details.open=true;details.scrollIntoView({behavior:'smooth',block:'start'});save();
    }
  });
  $('survey').addEventListener('submit',event=>event.preventDefault());
  $('survey').addEventListener('input', event=>{
    const target = event.target;
    if (['respondent','role','organization'].includes(target.id)) {
      state.meta[target.id] = target.value;

      save();return;
    }
    const q = fields.find(q=>q.id===target.dataset.question);
    if (!q) return;
    const a = state.answers[q.id] ||= {selected:[],text:''};
    if (target.hasAttribute('data-text')) a.text = target.value;
    else {
      const checked = [...document.querySelectorAll(`[data-question="${q.id}"][data-option]:checked`)];
      if (q.maxChoices && checked.length > q.maxChoices) {
        target.checked=false;
        $('status').textContent=`${q.id} 最多选择 ${q.maxChoices} 项，请取消一项后再选择。`;
        return;
      }
      a.selected=checked.map(el=>q.options[Number(el.dataset.option)]);
    }
    save();
  });
  function report() {
    const time = new Date().toLocaleString('zh-CN', {timeZone:'Asia/Tokyo',hour12:false});
    const lines = ['# 社区宠物到家小程序运营业务流程需求答复 V0.4','',`导出时间：${time}（日本时间）`,`填写人：${state.meta.respondent || '未填写'}`,`填写人岗位：${state.meta.role || '未填写'}`,`平台运营主体：${state.meta.organization || '未填写'}`,'','此文件为答卷本地备份；线上提交记录请查看答卷记录页。填写不等于负责人批准，未回答不视为同意。',''];
    lines.push('## 已确认试点条件','',...data.confirmedFacts.map(fact=>'- '+fact),'');
    for (const [section,[title]] of Object.entries(sections)) {
      lines.push(`## ${title}`,'');
      for (const q of fields.filter(q=>q.section===section)) {
        const a = answer(q);
        lines.push(`### ${q.id} ${q.title}`,'');
        lines.push(`业务问题：${q.prompt}`,`推荐业务流程：${q.recommended}`,`场景追问：${q.challenge}`,'');
        lines.push(`选择：${a.selected.length?a.selected.join('；'):'未选择'}`,`说明：${a.text.trim() || '未填写'}`,`填写状态：${hasAnswer(q)?'有答复（流程完整性待核对）':'未回答'}`,'');
      }
    }
    return lines.join('\n');
  }
  function download() {
    try {
      const content = report();
      const url = URL.createObjectURL(new Blob([content],{type:'text/markdown;charset=utf-8'}));
      const link = document.createElement('a');
      link.href=url;link.download=`社区宠物到家_问卷答复_${new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}.md`;
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
      $('export-status').textContent='答复备份文件已生成，可在浏览器下载列表中找到。备份不代表线上提交；请点击「提交答卷」并核实成功回执。';
    } catch (error) {
      $('export-status').textContent='文件导出失败，请点击「复制答复文字」保存。';
    }
  }
  $('download').addEventListener('click',download);

  $('copy').addEventListener('click',async()=>{
    const content=report();
    try {
      await navigator.clipboard.writeText(content);
      $('export-status').textContent='答复文字已复制，可另存备份。线上回收请点击「提交答卷」并核实成功回执。';
    } catch (error) {
      $('copy-fallback').hidden=false;$('copy-fallback').value=content;$('copy-fallback').focus();$('copy-fallback').select();
      $('export-status').textContent='自动复制不可用。请全选下方文字复制并另存备份；线上回收仍需点击「提交答卷」。';
    }
  });
  try {
    const response=await fetch('intake-config.json',{cache:'no-cache'});
    if (!response.ok) throw Error('missing configuration');
    intakeConfig=await response.json();
    if (!intakeConfig.enabled) throw Error('not enabled');
    const relay=new URL(intakeConfig.relayUrl);
    if (relay.protocol!=='https:' && !['127.0.0.1','localhost'].includes(relay.hostname)) throw Error('invalid relay');
    $('submit-answer').disabled=false;$('submit-sticky').disabled=false;
  } catch {
    $('submit-status').textContent='线上收集服务尚未启用；草稿和导出备份仍可使用。';
  }
  if (testMode) { $('test-notice').hidden=false; }
  async function submitAnswer() {
    let payload;
    try {
      if (!intakeConfig?.enabled) throw Error('线上收集服务尚未启用。');
      if (!$('public-consent').checked) throw Error('请先阅读并勾选答卷公开留档说明。');
      const candidate={schema:SCHEMA,submissionId:crypto.randomUUID(),meta:state.meta,answers:state.answers,consentPublic:true,isTest:testMode};
      // Missing optional role is an empty string rather than an absent field.
      candidate.meta={respondent:state.meta.respondent || '',organization:state.meta.organization || '',role:state.meta.role || ''};
      payload=normalizeSubmission(candidate,data);
      const signature=JSON.stringify({meta:payload.meta,answers:payload.answers,isTest:payload.isTest});
      if (state.online?.signature===signature && state.online.id) payload.submissionId=state.online.id;
      state.online={id:payload.submissionId,signature};save();
    } catch(error) { $('submit-status').textContent=error.message;return; }
    for (const id of ['submit-answer','submit-sticky']) $(id).disabled=true;
    $('submit-status').textContent='正在提交并核实线上记录，请稍候…';
    try {
      const base=new URL(intakeConfig.relayUrl);
      const response=await fetch(new URL('responses',base),{method:'POST',headers:{'Content-Type':'application/json','x-form-key':intakeConfig.formKey},body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)});
      const result=await response.json();
      if (!response.ok || result.ok!==true || !Number.isSafeInteger(result.number) || result.submissionId!==payload.submissionId) throw Error(result.error || '服务未返回有效记录。');
      let verified=result.verified===true;
      if (!verified) {
        const check=await fetch(new URL('responses/'+result.number,base),{signal:AbortSignal.timeout(15000)});
        const body=check.ok?await check.json():{};
        verified=body.record?.submissionId===payload.submissionId;
      }
      if (!verified) throw Error('记录已接收，但尚未核实；请保留草稿后用同一答卷重试。');
      state.online.receipt=result.number;save();
      location.href='thanks.html?no='+result.number+'&id='+encodeURIComponent(payload.submissionId);
    } catch(error) {
      $('submit-status').textContent='未能确认提交结果：'+error.message+' 草稿仍保留，请稍后重试；同一答卷将使用相同提交编号。';
      for (const id of ['submit-answer','submit-sticky']) $(id).disabled=false;
    }
  }
  $('submit-answer').addEventListener('click',submitAnswer);
  $('submit-sticky').addEventListener('click',()=>{
    if (!$('public-consent').checked) { $('submit-answer').scrollIntoView({behavior:'smooth',block:'center'});$('public-consent').focus();$('submit-status').textContent='请先确认答卷公开留档说明，再提交。'; }
    else submitAnswer();
  });
  let previousDraft;
  try {
    const raw = localStorage.getItem('petscom-operator-questionnaire-v03');
    if (raw) {
      const draft = JSON.parse(raw);
      if (draft.version === '0.3' && draft.answers && Object.values(draft.answers).some(a=>a && ((typeof a.text==='string' && a.text.trim()) || (Array.isArray(a.selected) && a.selected.length)))) previousDraft=draft;
    }
  } catch (error) { /* The old storage key is left unchanged. */ }
  if (previousDraft) {
    $('old-draft').hidden=false;
    $('download-previous').addEventListener('click',async()=>{
      try {
        const response=await fetch('archive/questionnaire-v03.json');
        if (!response.ok) throw new Error('old version unavailable');
        const prior=await response.json();
        const lines=['# 旧版平台运营方需求答复 V0.3','',`填写人：${previousDraft.meta?.respondent || '未填写'}`,`岗位：${previousDraft.meta?.role || '未填写'}`,`平台：${previousDraft.meta?.organization || '未填写'}`,'','此文件保留旧版题意，不能直接作为新版业务流程答复。',''];
        for (const q of prior.questions) {
          const a=previousDraft.answers[q.id] || {};
          lines.push(`## ${q.id} ${q.title}`,`选择：${Array.isArray(a.selected)?a.selected.join('；'):'未选择'}`,`说明：${typeof a.text==='string'?a.text:'未填写'}`,'');
        }
        if (previousDraft.archivedAnswers) lines.push('## 更早的保留答复','',JSON.stringify(previousDraft.archivedAnswers,null,2));
        const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download='社区宠物到家_旧版问卷答复_V0.3.md';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
        $('old-export-status').textContent='旧版答复已生成，请保留作为参考。';
      } catch (error) { $('old-export-status').textContent='旧版导出未成功，旧草稿仍保留，请重试或联系问卷发起人。'; }
    });
  }
  show(state.section);
  $('survey').hidden=false;$('action-bar').hidden=false;
  if (storageReady) {
    $('status').textContent='问卷已加载。请平台运营方开始填写，已有本机草稿已恢复。';
    $('save-state').textContent='本机自动保存 · 点击提交后线上留档';
  } else $('save-state').textContent='自动保存不可用，请导出备份';
})();
