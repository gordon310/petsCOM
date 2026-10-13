'use strict';
// shortcut: answers stay in this browser and are returned as a file; add a private collection service if central submission is required.
(async function () {
  const key = 'petscom-questionnaire-v02';
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sections = {A:['项目方基础调查','请先填写已有事实与候选方案。尚未确定的事项填写「待讨论」。'],B:['社区合作方','两个社区请分别填写一份，明确场地、费用和就业安排。'],C:['目标居民','请根据真实照护经历回答，价格需与具体服务内容和币种一起填写。'],D:['拟聘人员','请填写你的岗位意愿、时间和培训条件。'],G:['Grill-me 追问','由负责人逐轮确认。先答 G01—G05；后续只讨论前置规则已确认的题。已填写不代表已获决策批准。']};
  let data, state = {meta:{},answers:{},section:'A'}, storageReady = true;
  try {
    const response = await fetch('questionnaire.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('无法加载题目');
    data = await response.json();
    if (data.version !== '0.2' || data.questions.length !== 82) throw new Error('题目版本不匹配');
  } catch (error) {
    $('status').className = 'error';
    $('status').textContent = '问卷未能加载，请刷新重试。仍无法打开时，请联系项目负责人。';
    return;
  }
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const draft = JSON.parse(stored);
      if (draft.version !== data.version || !draft.answers || typeof draft.answers !== 'object' || Array.isArray(draft.answers)) throw new Error('草稿格式不匹配');
      for (const field of ['respondent','role','organization']) {
        if (typeof draft.meta?.[field] === 'string') state.meta[field] = draft.meta[field];
      }
      if (!Object.hasOwn(sections, state.meta.role || 'A')) state.meta.role = '';
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
  $('sections').innerHTML = Object.entries(sections).map(([section,[label]]) => `<button type="button" data-section="${section}" aria-pressed="false">${escape(label)}<small>${fields.filter(q=>q.section===section).length}</small></button>`).join('');
  $('panels').innerHTML = Object.entries(sections).map(([section,[label,description]]) => `<section data-panel="${section}" hidden><div class="section-intro"><h2>${escape(label)}</h2><p>${escape(description)}</p></div>${fields.filter(q=>q.section===section).map(q=>{
    const a = answer(q);
    const deps = (q.dependencies || []).map(id=>`<a href="#q-${id}" data-dependency="${id}">${id}</a>`).join('');
    return `<details class="question" id="q-${q.id}"><summary><span class="qid">${q.id}</span><span class="q-title">${escape(q.title)}${q.required===true?' <small>★</small>':''}</span><span class="answered" id="badge-${q.id}"></span><span class="chevron" aria-hidden="true">⌄</span></summary><div class="q-content">${deps?`<div class="deps">前置问题：${deps}<span>（请先由负责人确认）</span></div>`:''}${q.prompt?`<p class="prompt">${escape(q.prompt)}</p>`:''}${q.recommended?`<div class="callout"><strong>推荐方案</strong>${escape(q.recommended)}</div><div class="callout challenge"><strong>Grill-me 场景追问</strong>${escape(q.challenge)}</div><p class="impact"><strong>范围与排期影响：</strong>${escape(q.impact)}</p>`:''}${q.options.length?`<fieldset><legend>${q.section==='G'?'你的答复':q.single?'选择一项':q.maxChoices?`最多选择 ${q.maxChoices} 项`:'选择适用项（可多选）'}</legend>${q.options.map((option,i)=>`<label class="option"><input type="${q.single?'radio':'checkbox'}" name="choice-${q.id}" value="${i}" data-question="${q.id}" data-option="${i}" ${a.selected.includes(option)?'checked':''}><span>${escape(option)}</span></label>`).join('')}</fieldset>`:''}<label for="text-${q.id}">${q.section==='G'?'追问答复、参数及决策依据':'补充说明 / 填写空白处'}<textarea id="text-${q.id}" data-question="${q.id}" data-text rows="3" placeholder="${escape(q.section==='G'?q.required:'请写明选项中的空白内容、数值、币种、日期或理由；不适用可注明。')}">${escape(a.text)}</textarea></label>${q.section==='G'?`<p class="small">需补齐：${escape(q.required)}<br>请同时写明决策人、依据，以及待补材料的负责人和日期。</p>`:''}</div></details>`;
  }).join('')}</section>`).join('');
  for (const field of ['respondent','role','organization']) $(field).value = state.meta[field] || '';
  function updateProgress() {
    const count = fields.filter(hasAnswer).length;
    const group = fields.filter(q=>q.section===state.section);
    $('progress-text').textContent = `本组已填写 ${group.filter(hasAnswer).length} / ${group.length} 题 · 全部 ${count} / ${fields.length}`;
    $('progress').value = count;
    for (const q of fields) $('badge-'+q.id).textContent = hasAnswer(q)?'已填写':'';
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
      event.preventDefault();show('G');
      const details = $('q-'+target.dataset.dependency);details.open=true;details.scrollIntoView({behavior:'smooth',block:'start'});save();
    }
  });
  $('survey').addEventListener('submit',event=>event.preventDefault());
  $('survey').addEventListener('input', event=>{
    const target = event.target;
    if (['respondent','role','organization'].includes(target.id)) {
      state.meta[target.id] = target.value;
      if (target.id==='role' && target.value) show(target.value);
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
    const lines = ['# 社区宠物到家需求确认答复 V0.2','',`导出时间：${time}（日本时间）`,`填写人：${state.meta.respondent || '未填写'}`,`身份：${sections[state.meta.role]?.[0] || '未填写'}`,`社区或单位：${state.meta.organization || '未填写'}`,'','本文件由填写人导出，需回传给项目负责人。填写不等于负责人批准，未回答不视为同意。',''];
    for (const [section,[title]] of Object.entries(sections)) {
      lines.push(`## ${title}`,'');
      for (const q of fields.filter(q=>q.section===section)) {
        const a = answer(q);
        lines.push(`### ${q.id} ${q.title}`,'');
        if (q.section==='G') lines.push(`推荐方案：${q.recommended}`,`场景追问：${q.challenge}`,'');
        lines.push(`选择：${a.selected.length?a.selected.join('；'):'未选择'}`,`说明：${a.text.trim() || '未填写'}`,`填写状态：${hasAnswer(q)?'有答复（参数完整性待核对）':'未回答'}`,'');
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
      $('export-status').textContent='答复文件已生成。请在浏览器下载列表中找到文件，并回传给项目负责人。也可复制文字回传。';
    } catch (error) {
      $('export-status').textContent='文件导出失败，请点击「复制答复文字」保存。';
    }
  }
  $('download').addEventListener('click',download);
  $('download-sticky').addEventListener('click',download);
  $('copy').addEventListener('click',async()=>{
    const content=report();
    try {
      await navigator.clipboard.writeText(content);
      $('export-status').textContent='答复文字已复制，请粘贴到文档或消息中回传给项目负责人。';
    } catch (error) {
      $('copy-fallback').hidden=false;$('copy-fallback').value=content;$('copy-fallback').focus();$('copy-fallback').select();
      $('export-status').textContent='自动复制不可用。请全选下方文字并复制，再回传给项目负责人。';
    }
  });
  show(state.section);
  $('survey').hidden=false;$('action-bar').hidden=false;
  if (storageReady) {
    $('status').textContent='问卷已加载。请选择身份开始填写，已有本机草稿已恢复。';
    $('save-state').textContent='本机自动保存 · 导出后回传';
  } else $('save-state').textContent='自动保存不可用，请导出备份';
})();
