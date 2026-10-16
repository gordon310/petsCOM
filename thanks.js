const $=id=>document.getElementById(id);
(async()=>{
  try {
    const params=new URLSearchParams(location.search),number=Number(params.get('no')),id=params.get('id');
    if (!Number.isSafeInteger(number) || number<1 || !id) throw Error('没有有效提交回执，请返回填写页确认。');
    const config=await (await fetch('intake-config.json',{cache:'no-cache'})).json();
    if (!config.enabled) throw Error('收集服务尚未启用。');
    const response=await fetch(new URL('responses/'+number,config.relayUrl),{signal:AbortSignal.timeout(20000)});
    const result=await response.json();
    if (!response.ok || result.record?.submissionId!==id) throw Error('尚未核实该提交，请保留草稿，稍后刷新本页或联系发起人。');
    const r=result.record;
    $('receipt-title').textContent='提交成功，谢谢！';
    $('receipt-status').textContent='答卷已在线保存并核实，无需另行回传文件。'+(r.isTest?'本份为联调测试，不计入正式回收。':'');
    $('receipt-info').textContent=`记录号 #${number} · ${r.meta.organization} / ${r.meta.respondent} · 已回答 ${r.answeredCount}/${r.questionCount} 题`;
  } catch(error) { $('receipt-title').textContent='暂未确认提交完成';$('receipt-status').textContent=error.message; }
})();
