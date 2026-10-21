import test from 'node:test';
import assert from 'node:assert/strict';
import {seed,act,visibleOrders,eligibleWorkers,menus,requirements,save,load,STORAGE_KEY} from '../prototype/model.mjs';
import {mobile} from '../prototype/mobile.mjs';
import {desktop} from '../prototype/desktop.mjs';

test('four-role service lifecycle requires review, owner payment, assigned worker and key return',()=>{
 const d=seed(),ctx={site:'A',worker:'W01'};
 const n=act(d,'customer','book',{pet:'团团',service:'cat',date:'2026-10-24',site:'A',entry:'主人交钥匙',photoConsent:false},ctx).order;
 assert.equal(n.status,'pending_review');
 assert.throws(()=>act(d,'customer','pay',{id:n.id},ctx),/等待审核/);
 assert.throws(()=>act(d,'station','review',{id:n.id,decision:'approve'},ctx),/总部/);
 act(d,'hq','review',{id:n.id,decision:'approve'},ctx);act(d,'customer','pay',{id:n.id},ctx);
 assert.throws(()=>act(d,'hq','dispatch',{id:n.id,worker:'W03',reason:'跨社区'},ctx),/同社区/);
 assert.throws(()=>act(d,'hq','dispatch',{id:n.id,worker:'W04',reason:'未审核'},ctx),/资质/);
 act(d,'hq','dispatch',{id:n.id,worker:'W01',reason:'同社区资质及排班核对'},ctx);
 assert.throws(()=>act(d,'worker','accept',{id:n.id},{worker:'W02'}),/无权/);
 act(d,'worker','accept',{id:n.id},ctx);
 assert.throws(()=>act(d,'worker','arrive',{id:n.id,contacted:true},ctx),/入户授权/);
 act(d,'worker','arrive',{id:n.id,contacted:true,authorized:true,matched:true},ctx);
 assert.throws(()=>act(d,'worker','record_media',{id:n.id},ctx),/尚未授权/);
 act(d,'customer','authorize',{id:n.id,photo:true,live:false},ctx);act(d,'worker','record_media',{id:n.id},ctx);
 assert.throws(()=>act(d,'worker','finish',{id:n.id,petSafe:true,doorSafe:true,notified:true,keyReturned:true,report:'完成'},ctx),/清单/);
 act(d,'worker','check',{id:n.id,checks:['核对宠物状态与喂食要求','按约定喂食、换水','清洁猫砂与用品','记录宠物状态并检查门窗']},ctx);
 assert.throws(()=>act(d,'worker','finish',{id:n.id,petSafe:true,doorSafe:true,notified:true,report:'完成'},ctx),/钥匙归还/);
 act(d,'worker','finish',{id:n.id,petSafe:true,doorSafe:true,notified:true,keyReturned:true,report:'完成喂养清洁，状态正常。'},ctx);
 assert.equal(n.status,'awaiting_confirmation');
 assert.throws(()=>act(d,'hq','confirm_report',{id:n.id},ctx),/本人确认/);
 act(d,'customer','confirm_report',{id:n.id},ctx);assert.equal(n.status,'completed');assert.ok(n.history.length>=7);
 act(d,'hq','spotcheck',{id:n.id,decision:'return',reason:'补充状态说明'},ctx);assert.equal(n.status,'completed');
 act(d,'worker','revise_report',{id:n.id,report:'状态正常，饮水良好。'},ctx);assert.equal(n.reportStatus,'resubmitted');
});
test('station and worker scopes exclude unrelated community or unassigned orders',()=>{
 const d=seed();assert.ok(visibleOrders(d,'station',{site:'A'}).every(o=>o.site==='A'));
 assert.ok(visibleOrders(d,'worker',{worker:'W01'}).every(o=>o.worker==='W01'));
 assert.ok(visibleOrders(d,'customer').every(o=>o.owner==='C01'));
 assert.throws(()=>act(d,'station','incident',{id:'ML102308',text:'本站不可访问'},{site:'A'}),/无权/);
 const before=d.orders.length;assert.throws(()=>act(d,'customer','book',{pet:'团团',service:'cat',site:'B',date:'2026-10-24'}));assert.equal(d.orders.length,before);
});
test('time collision, onboarding and service skill are checked before dispatch',()=>{
 const d=seed(),o=d.orders.find(x=>x.id==='ML102303');o.time='14:00–14:30';
 const ids=eligibleWorkers(d,o).map(w=>w.id);assert.ok(!ids.includes('W01'));assert.ok(ids.includes('W02'));assert.ok(!ids.includes('W04'));
 act(d,'hq','staff_review',{worker:'W04',decision:'approve',reason:'培训核对通过'});assert.ok(eligibleWorkers(d,o).some(w=>w.id==='W04'));
});
test('proxy booking waits for owner confirmation; returns need reasons and resubmission',()=>{
 const d=seed(),n=act(d,'station','book',{pet:'团团',service:'cat',date:'2026-10-24',site:'A'},{site:'A'}).order;
 assert.equal(n.status,'pending_customer');assert.throws(()=>act(d,'station','confirm_proxy',{id:n.id}));assert.equal(n.status,'pending_customer');
 act(d,'customer','confirm_proxy',{id:n.id});assert.equal(n.status,'pending_review');
 assert.throws(()=>act(d,'hq','review',{id:n.id,decision:'return'}),/退回原因/);
 act(d,'hq','review',{id:n.id,decision:'return',reason:'补充照护要求'});assert.equal(n.status,'returned');
 act(d,'customer','resubmit',{id:n.id,note:'定量喂食'});assert.equal(n.status,'pending_review');
});
test('incident pauses service; extra services require the owner and keep unpaid balances separate',()=>{
 const d=seed(),id='ML102305';
 assert.throws(()=>act(d,'worker','extra_order',{id},{worker:'W01'}),/主人/);
 act(d,'worker','extra_invite',{id},{worker:'W01'});assert.equal(d.fees.length,0);
 act(d,'customer','extra_order',{id});assert.equal(d.fees[0].status,'unpaid');assert.equal(d.orders.find(o=>o.id===id).status,'in_service');
 act(d,'customer','fee_pay',{fee:d.fees[0].id});assert.equal(d.fees[0].status,'paid');
 assert.throws(()=>act(d,'customer','fee_pay',{fee:d.fees[0].id}),/重复/);
 act(d,'worker','incident',{id,kind:'无法继续',text:'停止操作并联系主人与总部'},{worker:'W01'});
 assert.equal(d.orders.find(o=>o.id===id).status,'paused');assert.equal(d.incidents[0].status,'待跟进');
 assert.throws(()=>act(d,'worker','record_media',{id},{worker:'W01'}),/不可记录/);
});
test('all 50 documented pages render and retired task details redact access information',()=>{
 const d=seed();let count=0;
 for(const [role,list] of Object.entries(menus))for(const [page] of list){const orders=visibleOrders(d,role,{site:'A',worker:'W01'});const html=(['customer','worker'].includes(role)?mobile:desktop)({data:d,role,page,orders,order:orders[0],site:'A',worker:'W01',service:'cat',bookingStep:1});assert.ok(html.length>200,role+'/'+page);assert.ok(!html.includes('undefined'),role+'/'+page);assert.ok(!html.includes('${'),role+'/'+page);count++;}
 assert.equal(count,50);assert.equal(requirements.length,38);assert.equal(requirements.filter(r=>r.status==='pending').length,1);
 const o=d.orders.find(x=>x.id==='ML102306');
 const html=mobile({data:d,role:'worker',page:'task',orders:[o],order:o,worker:'W01'});assert.ok(html.includes('入户资料已收回'));
});
test('demo progress and review notes persist without modifying questionnaire storage',()=>{
 const values=new Map([['petscom-business-flow-questionnaire-v04','original questionnaire draft']]);
 const store={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};const d=seed();
 act(d,'hq','feedback',{page:'reviews',decision:'需修改',text:'请明确审核岗位'});save(store,d);
 assert.equal(load(store).reviewFeedback[0].text,'请明确审核岗位');assert.ok(values.has(STORAGE_KEY));assert.equal(values.get('petscom-business-flow-questionnaire-v04'),'original questionnaire draft');
});

test('multiple visits have independent records and community B proxy belongs to its owner',()=>{
 const d=seed(),n=act(d,'station','book',{pet:'麻薯',service:'cat',date:'2026-10-24',site:'B',repeat:3},{site:'B'}).order;
 const visits=d.orders.filter(o=>o.series===n.id);assert.equal(visits.length,3);assert.equal(visits[2].date,'2026-10-26');assert.ok(visits.every(o=>o.owner==='C02'&&o.status==='pending_customer'));
 assert.throws(()=>act(d,'customer','confirm_proxy',{id:n.id},{customer:'C01'}),/无权/);
 act(d,'customer','confirm_proxy',{id:n.id,photoConsent:false,liveConsent:true},{customer:'C02'});assert.equal(n.status,'pending_review');assert.equal(visits[1].status,'pending_customer');assert.equal(n.liveConsent,true);
 const orders=visibleOrders(d,'station',{site:'B'}),html=desktop({data:d,role:'station',page:'customers',orders,site:'B'});assert.ok(html.includes('李先生'));assert.ok(html.includes('麻薯'));assert.ok(!html.includes('陈女士'));
});
test('activity registration respects publication, site, capacity and duplicate safeguards',()=>{
 const d=seed();assert.throws(()=>act(d,'customer','register',{event:'E02'}),/未发布/);assert.throws(()=>act(d,'customer','register',{event:'E01'},{customer:'C02'}),/所属社区/);
 act(d,'customer','register',{event:'E01'});assert.equal(d.registrations.length,1);assert.throws(()=>act(d,'customer','register',{event:'E01'}),/重复/);
 const hidden=mobile({data:d,role:'customer',page:'activity',orders:[],customer:'C02',event:'E01'});assert.ok(hidden.includes('不属于本社区'));assert.ok(!hidden.includes('确认演示费用并报名'));
});
test('aftersales approval and execution are distinct; cancellation preserves completed visits',()=>{
 const d=seed(),ticket=d.incidents[0];
 assert.throws(()=>act(d,'hq','resolve_ticket',{ticket:ticket.id,operation:'execute',result:'尝试跳过审批'}),/先审批/);
 assert.throws(()=>act(d,'hq','resolve_ticket',{ticket:ticket.id,operation:'approve',amount:10,result:'审批',close:true}),/尚未执行/);assert.equal(ticket.approval,undefined);
 act(d,'hq','resolve_ticket',{ticket:ticket.id,operation:'approve',amount:10,result:'同意演示调整方案'});assert.equal(ticket.approval,'已审批待执行');
 act(d,'hq','resolve_ticket',{ticket:ticket.id,operation:'execute',result:'执行并回访',close:true});assert.equal(ticket.status,'已闭环');assert.equal(ticket.approval,'已模拟执行');
 const n=act(d,'customer','book',{site:'A',pet:'团团',service:'cat',date:'2026-10-25',repeat:3}).order,visits=d.orders.filter(o=>o.series===n.id);visits[0].status='completed';
 act(d,'customer','incident',{id:n.id,kind:'取消剩余服务',text:'请核对已履约并取消后两次'});const t=d.incidents[0];
 act(d,'hq','resolve_ticket',{ticket:t.id,operation:'cancel',result:'确认剩余两次未履约，费用交审批核对',close:true});assert.equal(visits[0].status,'completed');assert.ok(visits.slice(1).every(o=>o.status==='cancelled'));
});
