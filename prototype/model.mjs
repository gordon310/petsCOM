export const VERSION='1.0';
export const STORAGE_KEY='petscom-prototype-v1';
export const customerFor=id=>id==='C02'?{id:'C02',name:'李先生',site:'B',phone:'139 **** 6512',initial:'李'}:{id:'C01',name:'陈女士',site:'A',phone:'138 **** 2036',initial:'陈'};
export const roles={customer:{name:'用户端',subtitle:'微信小程序',icon:'paw'},worker:{name:'接单小哥',subtitle:'微信小程序',icon:'bag'},station:{name:'服务站点',subtitle:'PC 操作平台',icon:'store'},hq:{name:'总部管理',subtitle:'PC 管理平台',icon:'grid'}};
export const menus={
 customer:[['home','首页','home'],['services','服务目录','grid'],['booking','预约服务','calendar'],['orders','我的订单','bag'],['order','订单详情','file'],['progress','服务过程','play'],['report','服务报告','check'],['activities','社区活动','spark'],['activity','活动详情','calendar'],['referral','综合体预约','store'],['support','客服与售后','chat'],['pets','宠物档案','paw'],['addresses','地址与社区','pin'],['bills','待付账单','wallet'],['profile','我的','user']],
 worker:[['tasks','任务工作台','bag'],['task','任务详情','file'],['arrival','到场与入户','pin'],['execution','服务执行','check'],['departure','离场与报告','file'],['incident','异常上报','alert'],['schedule','报班与请假','calendar'],['earnings','服务与报酬','wallet'],['profile','上岗档案','user']],
 station:[['dashboard','站点工作台','grid'],['orders','本站订单','bag'],['order','订单受理','file'],['proxy','辅助预约','plus'],['customers','居民与宠物','paw'],['staff','人员与排班','user'],['referrals','综合体转介','store'],['activities','社区活动','spark'],['support','客服与异常','chat'],['handover','站务交接','check']],
 hq:[['dashboard','运营总览','grid'],['orders','全部订单','bag'],['order','订单详情','file'],['reviews','审核中心','check'],['dispatch','派单调度','calendar'],['sites','社区站点','store'],['staff','人员资质','user'],['catalog','服务与价格','tag'],['quality','报告与质量','file'],['support','客服与售后','chat'],['referrals','综合体转介','paw'],['activities','活动管理','spark'],['finance','收款与结算','wallet'],['reports','经营分析','chart'],['permissions','角色与权限','lock'],['logs','操作记录','clock']]
};
export const statuses={
 pending_customer:'订单已代填待客户确认预约信息',
 pending_review:'订单已提交待平台审核预约',
 returned:'订单资料已退回待客户补充',
 awaiting_payment:'订单审核已通过待客户确认费用并付款',
 awaiting_dispatch:'订单已付款待平台安排服务小哥',
 assigned:'订单已生成待小哥接单',
 accepted:'小哥已接单待按预约时间上门服务',
 in_service:'小哥已到场正在提供预约服务',
 paused:'订单服务已暂停待平台处理异常',
 awaiting_confirmation:'订单结束待客户确认',
 completed:'客户已确认订单服务完成',
 cancelled:'订单已取消本次服务不再执行',
};
export const reportStatuses={
 none:'小哥尚未提交本次服务报告',
 submitted:'服务报告已提交待客户确认订单',
 confirmed:'客户已确认服务报告订单已完成',
 checked:'平台已完成服务报告抽查',
 returned:'服务报告已退回待小哥补充',
 resubmitted:'小哥已补交服务报告待平台复核',
};
export const services=[
 {id:'cat',name:'上门喂猫',category:'home',icon:'cat',caption:'喂食换水 · 猫砂清洁 · 状态照看',price:39,duration:'30 分钟',items:['核对宠物状态与喂食要求','按约定喂食、换水','清洁猫砂与用品','记录宠物状态并检查门窗']},
 {id:'dog',name:'上门照看',category:'home',icon:'dog',caption:'基础照护 · 陪伴互动 · 饮食记录',price:49,duration:'30 分钟',items:['核对宠物及照护要求','按约定喂食、换水','完成基础陪伴照看','检查用品、宠物与门窗']},
 {id:'walk',name:'上门遛狗',category:'home',icon:'walk',caption:'牵引检查 · 安全遛行 · 清洁归家',price:49,duration:'30 分钟',items:['核对宠物状态与出行授权','检查牵引装备及佩戴','按约定路线遛行并清理','确认宠物归家与门窗安全']},
 {id:'wash-home',name:'上门洗护',category:'home',icon:'drop',caption:'先核对场地及宠物情况，再审核受理',price:99,duration:'按报价',items:['核对宠物与洗护条件','确认用品及操作范围','按授权完成洗护','整理现场并说明注意事项']},
 {id:'transport',name:'宠物接送',category:'home',icon:'car',caption:'明确交接人 · 宠物核对 · 到达确认',price:69,duration:'按报价',items:['核对宠物、目的地与交接人','确认安全运输条件','按约定完成接送','记录到达和交接确认']},
 {id:'salon',name:'到店洗护',category:'facility',icon:'drop',caption:'综合体洗护部确认时间与费用',price:129},
 {id:'clinic',name:'诊所预约',category:'facility',icon:'heart',caption:'提交预约意向，由专业部门联系确认',price:null},
 {id:'hotel',name:'酒店寄养',category:'facility',icon:'home',caption:'先核对空位、宠物资料与寄养条件',price:null},
 {id:'training',name:'训犬预约',category:'facility',icon:'flag',caption:'专业评估后确认课程与安排',price:null},
 {id:'park',name:'公园活动',category:'facility',icon:'leaf',caption:'人宠友好空间，预约后由专人联系',price:null}
];
export const requirements=[
 {id:'S01',title:'社区接待与总部统筹分工',status:'adopted',detail:'按已采用流程组织接待、调度、客服及专业部门；具体人名、社区名仍待补充。',pages:['station.dashboard','hq.sites','hq.permissions']},
 {id:'S02',title:'上门、到店、接送与社区活动',status:'adopted',detail:'包含答卷勾选的全部服务；新增群主活动发布、小程序报名收费。',pages:['customer.services','customer.activities','station.activities','hq.catalog']},
 {id:'S03',title:'不提供跨社区服务',status:'adopted',detail:'地址匹配所属社区；站点及人员按所属社区受理，不提供跨社区下单入口。',pages:['customer.addresses','station.orders','hq.dispatch']},
 {id:'S04',title:'服务明细、收费与追加账单',status:'adopted',detail:'展示明细与附加项；允许后续产生未支付的追加服务账单，禁止工作人员擅自扣费。',pages:['customer.services','customer.bills','worker.execution','hq.finance']},
 {id:'S05',title:'可约时段与预约截止规则',status:'pending',detail:'唯一未回答题。营业时间、提前预约、夜间节假日、满额规则均未确认，界面时间仅作示例。',pages:['customer.booking','worker.schedule','hq.sites']},
 {id:'C01',title:'按登录地址匹配社区',status:'adopted',detail:'已有地址匹配本站；未覆盖地址登记意向，用于后续社区拓展判断。',pages:['customer.home','customer.addresses','hq.sites']},
 {id:'C02',title:'宠物资料与号码保护',status:'adopted',detail:'按服务收集必要资料；特殊上门情况联系主人，界面仅显示脱敏号码。',pages:['customer.pets','worker.task','station.customers']},
 {id:'C03',title:'单次、多次与客服取消',status:'adopted',detail:'每次有独立任务和报告；可申请取消剩余服务，已履约费用核对扣除，由客服操作。',pages:['customer.booking','customer.support','hq.support']},
 {id:'C04',title:'平台派人、客户申请换人',status:'adopted',detail:'平台指派，客户查看人员信息并可发起换人申请，由调度处理。',pages:['customer.order','hq.dispatch']},
 {id:'C05',title:'先审核，再确认费用付款',status:'adopted',detail:'全部预约先核对资料及可服务性，审核通过才进入付款、派单。',pages:['customer.order','station.order','hq.reviews']},
 {id:'C06',title:'订单进度与改单入口',status:'adopted',detail:'每阶段显示下一步，改时间、地址或宠物须重新确认影响。',pages:['customer.orders','customer.order','hq.order']},
 {id:'C07',title:'拍照、直播先授权',status:'adopted',detail:'客户事先独立授权拍照和直播；未授权不能启用，失败时说明并联系客服。',pages:['customer.booking','customer.progress','worker.execution']},
 {id:'C08',title:'报告确认、评价与再次预约',status:'adopted',detail:'报告提交不等于完成；客户确认或提出问题，再预约需重新确认日期等信息。',pages:['customer.report','customer.profile']},
 {id:'W01',title:'站点辅助预约须本人确认',status:'adopted',detail:'站点代填，居民本人确认服务、费用及授权后交运营审核。',pages:['station.proxy','customer.order']},
 {id:'W02',title:'站点不做钥匙或宠物实物交接',status:'adopted',detail:'站点只咨询及辅助预约；服务人员离场时必须完成钥匙归还记录。',pages:['station.handover','worker.departure']},
 {id:'W03',title:'报班、接单、拒单与替补',status:'adopted',detail:'按可工作时间与技能接收已派任务；拒单需理由，交回调度改派。',pages:['worker.schedule','worker.task','hq.dispatch']},
 {id:'W04',title:'到场、联系、确认入户再开始',status:'adopted',detail:'每一步分开确认，现场不符或无法进门则暂停并报备。',pages:['worker.arrival','worker.incident']},
 {id:'W05',title:'分类服务清单与主人加单',status:'adopted',detail:'按各服务清单执行，临时增项由主人确认下单，工作人员不能直接加价扣款。',pages:['worker.execution','customer.bills']},
 {id:'W06',title:'逐次服务报告及补交',status:'adopted',detail:'记录到场、离场、完成项、宠物状态及异常；多次服务每次各有报告。',pages:['worker.departure','customer.report','hq.quality']},
 {id:'W07',title:'离场安全检查与钥匙归还',status:'adopted',detail:'检查宠物、门窗和用品，告知主人；涉及钥匙的任务必须确认归还。',pages:['worker.departure']},
 {id:'W08',title:'仅看任务必要资料与报酬核对',status:'adopted',detail:'人员只查看已分配任务，结束或改派后停止访问入户资料；报酬结合服务与售后核对。',pages:['worker.tasks','worker.earnings','hq.permissions']},
 {id:'B01',title:'日常清单与责任人',status:'adopted',detail:'按社区及合计呈现受理、派单、异常、回访与交班工作。',pages:['station.dashboard','hq.dashboard']},
 {id:'B02',title:'资格、时间和社区匹配派单',status:'adopted',detail:'派单前核对资格与排班；改派记录原因、交接、新人确认及客户通知。不开放跨社区服务。',pages:['hq.dispatch','station.staff']},
 {id:'B03',title:'企业微信群客服跟进',status:'adopted',detail:'将企业微信群作为跟进渠道，记录建联、提醒、回访和负责人。原型只演示，不实际建群或发消息。',pages:['customer.support','station.support','hq.support']},
 {id:'B04',title:'服务、价格和营业安排变更',status:'adopted',detail:'变更有提出、批准、生效与通知记录；已确认订单沿用约定，不自动跟随新价格。',pages:['hq.catalog','hq.sites']},
 {id:'B05',title:'站点、人员变动需业务交接',status:'adopted',detail:'交接未完任务、客服、转介和后续联系人，处理离岗权限。',pages:['station.handover','hq.staff','hq.sites']},
 {id:'B06',title:'专业部门闭环受理转介',status:'adopted',detail:'洗护、诊所、酒店、训犬和公园有独立受理人与进度，结果反馈客户及站点。',pages:['customer.referral','station.referrals','hq.referrals']},
 {id:'R01',title:'申请、核验、培训、上岗审核',status:'adopted',detail:'通过后才可派单，退回显示原因及重新提交入口，停岗人员不能再接新任务。',pages:['worker.profile','hq.staff','hq.reviews']},
 {id:'R02',title:'所有预约先审核',status:'adopted',detail:'全部预约均进入审核队列，支持通过、补资料和拒绝的理由及通知。',pages:['station.order','hq.reviews']},
 {id:'R03',title:'客户先确认，平台抽查',status:'adopted',detail:'客户确认服务报告可完成订单；总部另行抽查，有异议进入售后，不设每单总部先批的完成门槛。',pages:['customer.report','hq.quality']},
 {id:'R04',title:'改单、退款、赔付分权审批',status:'adopted',detail:'申请、审批与执行分开；具体授权岗位和金额阈值尚未补充，原型将总部审批作为待确认方案。',pages:['station.support','hq.reviews','hq.finance']},
 {id:'R05',title:'退回、补充、复核闭环',status:'adopted',detail:'申请、预约、报告和售后可查看原因、补充并重新交原审核岗位。',pages:['customer.order','worker.departure','hq.reviews']},
 {id:'X01',title:'无法进门或现场不符',status:'adopted',detail:'暂停、联系主人和客服，不把未服务任务记为完成；等待及费用标准待确认。',pages:['worker.incident','hq.support']},
 {id:'X02',title:'迟到、缺勤、无人接单',status:'adopted',detail:'报告调度、安排替补并通知客户；具体响应时限及补偿标准待确认。',pages:['worker.incident','hq.dispatch','hq.support']},
 {id:'X03',title:'事故停止、接管与救助',status:'adopted',detail:'独立紧急入口，暂停现场操作并升级总部，记录客户授权与专业部门联系，不让服务人员自行诊断。',pages:['worker.incident','hq.support']},
 {id:'X04',title:'投诉、退款、补服务闭环',status:'adopted',detail:'客户在订单内发起，客服跟进、审批、执行和回访分别留痕。',pages:['customer.support','station.support','hq.support']},
 {id:'X05',title:'付款、照片或直播失败',status:'adopted',detail:'先核对支付结果，避免重复付款；影像失败时说明并申请补证或暂停，不假装已有记录。',pages:['customer.bills','customer.progress','worker.incident']},
 {id:'X06',title:'多次订单逐次结算异常',status:'adopted',detail:'已履约、异常及未服务次数分别记录；取消剩余次数由客服核对费用和通知。',pages:['customer.order','hq.support']}
];
const makeOrder=(id,status,patch={})=>({id,customer:'陈女士（演示）',owner:'C01',pet:'团团',petType:'英短 · 2 岁',site:'A',service:'cat',date:'2026-10-23',time:'09:00–09:30',amount:39,worker:null,photoConsent:true,liveConsent:false,entry:'主人交钥匙',keyRequired:true,source:'用户自助',note:'按约定定量喂食，留意饮水。',status,created:'10-22 09:10',report:'',reportStatus:'none',checks:[],keyReturned:false,extra:[],history:[{time:'09:10',text:'客户已提交预约，等待平台核对资料并审核服务安排'}],...patch});
export function seed(){return {
 orders:[makeOrder('ML102301','pending_review'),makeOrder('ML102302','awaiting_payment',{pet:'可乐',service:'walk',amount:49,time:'10:00–10:30',keyRequired:false,entry:'主人在家'}),makeOrder('ML102303','awaiting_dispatch',{pet:'年糕',time:'11:00–11:30'}),makeOrder('ML102304','assigned',{worker:'W01',time:'14:00–14:30'}),makeOrder('ML102305','in_service',{worker:'W01',time:'15:00–15:30',checks:[],arrived:'15:01'}),makeOrder('ML102306','awaiting_confirmation',{worker:'W01',pet:'可乐',service:'walk',report:'已按约遛行，饮水正常，无异常；牵引装备已收回，门窗核对完毕。',reportStatus:'submitted',keyRequired:false,keyReturned:true,checks:['核对宠物状态与出行授权','检查牵引装备及佩戴','按约定路线遛行并清理','确认宠物归家与门窗安全'],arrived:'08:58',left:'09:31',date:'2026-10-22'}),makeOrder('ML102307','completed',{site:'B',owner:'C02',customer:'李先生（演示）',pet:'麻薯',worker:'W03',report:'喂食换水及猫砂清洁完成，宠物状态良好。',reportStatus:'confirmed',date:'2026-10-22'}),makeOrder('ML102308','pending_review',{site:'B',owner:'C02',customer:'李先生（演示）',pet:'麻薯'})],
 workers:[{id:'W01',name:'阿哲',site:'A',status:'active',skills:['cat','dog','walk','transport'],shift:'09:00–18:00',jobs:3,rating:'4.9'},{id:'W02',name:'小林',site:'A',status:'active',skills:['cat','dog','walk','wash-home'],shift:'09:00–18:00',jobs:1,rating:'4.9'},{id:'W03',name:'小周',site:'B',status:'active',skills:['cat','dog','walk'],shift:'09:00–18:00',jobs:2,rating:'4.8'},{id:'W04',name:'小何',site:'A',status:'training',skills:['cat','dog'],shift:'待排班',jobs:0,rating:'—'}],
 pets:[{id:'P01',owner:'C01',name:'团团',type:'猫',breed:'英短',age:'2 岁',note:'定量喂食，怕吸尘器。'},{id:'P02',owner:'C01',name:'可乐',type:'狗',breed:'柯基',age:'3 岁',note:'出门使用双扣牵引。'},{id:'P03',owner:'C02',name:'麻薯',type:'猫',breed:'布偶',age:'2 岁',note:'少量多餐，怕生。'}],
 activities:[{id:'E01',title:'一起散步吧 · 社区人宠日',site:'A',date:'10 月 25 日',time:'09:30–11:00',location:'社区共享绿地（示例）',organizer:'社区群主 · 小夏（演示）',fee:19.9,capacity:20,joined:12,status:'published'},{id:'E02',title:'科学养宠小课堂',site:'A',date:'10 月 27 日',time:'14:00–15:00',location:'接待站活动区（示例）',organizer:'社区群主 · 小夏（演示）',fee:0,capacity:15,joined:6,status:'draft'}],
 referrals:[{id:'RF001',site:'A',pet:'团团',service:'酒店寄养',department:'宠物酒店',status:'待联系',note:'希望咨询下月两晚寄养，时间及价格由专人确认。'}],
 incidents:[{id:'CS001',site:'A',order:'ML102304',type:'换人申请',status:'待跟进',owner:'总部调度',text:'主人希望安排熟悉的服务人员，请联系确认。',source:'customer'}],
 fees:[],logs:[{time:'09:10',role:'系统演示',text:'载入四端评审演示数据'}],registrations:[],availability:[],notes:[],catalogDrafts:[],handover:[],reviewFeedback:[],uncovered:[]
};}
export function load(storage){try{const x=JSON.parse(storage.getItem(STORAGE_KEY));if(x?.version===VERSION&&Array.isArray(x.data?.orders))return x.data;}catch{}return seed();}
export function save(storage,data){storage.setItem(STORAGE_KEY,JSON.stringify({version:VERSION,data}));}
export const serviceFor=id=>services.find(s=>s.id===id)||services[0];
export const workerFor=(data,id)=>data.workers.find(w=>w.id===id);
export const visibleOrders=(data,role,context={})=>data.orders.filter(o=>role==='hq'||(role==='station'?o.site===(context.site||'A'):role==='worker'?o.worker===(context.worker||'W01'):o.owner===(context.customer||'C01')));
const minutes=t=>{const m=String(t).match(/(\d{2}):(\d{2})/g)||[];return m.map(x=>Number(x.slice(0,2))*60+Number(x.slice(3)));};
export const eligibleWorkers=(data,o)=>data.workers.filter(w=>{
 if(w.site!==o.site||w.status!=='active'||!w.skills.includes(o.service))return false;
 const [start,end]=minutes(o.time);
 return !data.orders.some(other=>{if(other.id===o.id||other.worker!==w.id||other.date!==o.date||!['assigned','accepted','in_service'].includes(other.status))return false;const [a,b]=minutes(other.time);return start<b&&a<end;});
});
const now=()=>new Date().toLocaleTimeString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false,hour:'2-digit',minute:'2-digit'});
export function act(data,role,type,input={},context={}){
 const o=data.orders.find(x=>x.id===input.id),id=()=>String(Date.now()).slice(-7);
 const need=(condition,message)=>{if(!condition)throw Error(message);};
 const own=()=>need(o&&visibleOrders(data,role,context).some(x=>x.id===o.id),'当前身份无权操作此订单');
 const hq=()=>need(role==='hq','此操作需总部有权岗位处理');
 const log=text=>{data.logs.unshift({time:now(),role:roles[role]?.name||role,text});if(o)o.history.push({time:now(),text});};
 const incident=(type,text)=>{data.incidents.unshift({id:'CS'+id(),site:o?.site||context.site||'A',order:o?.id||'',type,status:'待跟进',owner:'总部客服',text,source:role});};
 if(type==='book'){
  need(['customer','station'].includes(role),'当前身份不能创建预约');need(input.pet&&input.date&&input.service,'请补齐宠物、日期和服务');need(services.some(s=>s.id===input.service&&s.category==='home'),'请选择可预约的上门服务；到店项目从专业转介提交');
  need(input.site===(role==='station'?(context.site||'A'):customerFor(context.customer).site),'当前地址不在所属社区服务范围，请登记服务意向');
  const status=role==='station'?'pending_customer':'pending_review';const n=makeOrder('ML'+id(),status,{owner:input.site==='B'?'C02':'C01',customer:customerFor(input.site==='B'?'C02':'C01').name+'（演示）',pet:input.pet,service:input.service,amount:serviceFor(input.service).price,date:input.date,time:input.time||'09:00–09:30',site:input.site,photoConsent:!!input.photoConsent,liveConsent:!!input.liveConsent,keyRequired:input.entry==='主人交钥匙',entry:input.entry||'主人在家',note:input.note||'',source:role==='station'?'站点辅助预约':'用户自助',repeat:input.repeat||1,history:[{time:now(),text:role==='station'?'站点已代填预约，等待客户本人确认预约信息与授权':'客户已提交预约，等待平台核对资料并审核服务安排'}]});
  const count=[1,3,7].includes(Number(input.repeat))?Number(input.repeat):1;n.repeat=count;const group=[n];if(count>1){n.series=n.id;n.visit=1;for(let i=1;i<count;i++){const day=new Date(n.date+'T12:00:00Z');day.setUTCDate(day.getUTCDate()+i);group.push(makeOrder(n.id+'-'+(i+1),status,{...n,id:n.id+'-'+(i+1),date:day.toISOString().slice(0,10),visit:i+1,history:[{time:now(),text:'多次预约第 '+(i+1)+' 次申请，由平台审核预约、小哥逐次履约并提交服务报告'}],checks:[],extra:[]}));}}data.orders.unshift(...group);log('创建预约 '+n.id+(count>1?'，共 '+count+' 次独立任务':''));return {message:role==='station'?'已生成本人确认单，不能替居民确认授权':'预约已提交，审核通过后再确认费用付款',order:n};
 }
 if(type==='confirm_proxy'){own();need(role==='customer'&&o.status==='pending_customer','当前预约无需再次由客户确认代填信息');o.photoConsent=!!input.photoConsent;o.liveConsent=!!input.liveConsent;o.status='pending_review';log('居民本人确认辅助预约，独立选择拍照及直播授权');}
 else if(type==='review'){hq();need(o?.status==='pending_review','仅已提交且等待平台审核的预约可进行审核');if(input.decision==='return'){need(input.reason?.trim(),'请填写退回原因');o.status='returned';o.returnReason=input.reason;log('预约退回补充：'+input.reason);}else{o.status='awaiting_payment';log('预约审核已通过，等待客户确认演示费用明细并付款');}}
 else if(type==='resubmit'){own();need(role==='customer'&&o.status==='returned','当前订单不在退回补充阶段');need(input.note?.trim(),'请填写补充资料');o.note+='；'+input.note;o.status='pending_review';log('客户补齐资料，重新提交复核');}
 else if(type==='pay'){own();need(role==='customer'&&o.status==='awaiting_payment','请等待审核和费用确认，勿重复付款');o.status='awaiting_dispatch';log('客户已确认演示费用并模拟付款，等待平台安排服务小哥');}
 else if(type==='dispatch'){hq();need(o&&['awaiting_dispatch','assigned','accepted'].includes(o.status),'当前状态不可派单或改派');const w=eligibleWorkers(data,o).find(w=>w.id===input.worker);need(w,'请选择同社区、资质通过且具备该项技能的人员');need(input.reason?.trim(),'请记录派单或改派说明');o.worker=w.id;o.status='assigned';o.reassignRequested=false;log('调度指派 '+w.name+'：'+input.reason+'；客户已收到人员安排通知，等待小哥确认接单');}
 else if(type==='accept'){own();need(role==='worker'&&o.status==='assigned','仅本人待接任务可确认');o.status='accepted';log('小哥已确认接单，等待按预约时间上门提供服务');}
 else if(type==='reject'){own();need(role==='worker'&&o.status==='assigned','仅待接任务可退回');need(input.reason?.trim(),'请填写拒单原因');o.worker=null;o.status='awaiting_dispatch';log('人员退回调度改派：'+input.reason);}
 else if(type==='arrive'){own();need(role==='worker'&&o.status==='accepted','请先确认接单');need(input.contacted&&input.authorized&&input.matched,'请完成到场联系、入户授权及现场资料核对');o.status='in_service';o.arrived=now();log('到场核对及主人入户授权已确认，开始服务');}
 else if(type==='check'){own();need(role==='worker'&&o.status==='in_service','只能在本人进行中的任务填写清单');o.checks=input.checks||[];}
 else if(type==='record_media'){own();need(role==='worker'&&o.status==='in_service','当前任务不可记录');need(o.photoConsent,'主人尚未授权拍照，请先联系确认');o.photoCount=(o.photoCount||0)+1;log('新增演示服务照片，未使用真实相机');}
 else if(type==='authorize'){own();need(role==='customer','只有主人本人可修改影像授权');o.photoConsent=!!input.photo;o.liveConsent=!!input.live;log('主人更新拍照/直播授权');}
 else if(type==='finish'){own();need(role==='worker'&&o.status==='in_service','当前任务不能提交离场报告');need(serviceFor(o.service).items.every(x=>o.checks.includes(x)),'请逐项完成服务清单');need(input.petSafe&&input.doorSafe&&input.notified,'请完成宠物、门窗与通知检查');need(!o.keyRequired||input.keyReturned,'钥匙归还为必需项，未完成不得提交');need(input.report?.trim(),'请填写本次服务报告');o.report=input.report;o.keyReturned=!!input.keyReturned;o.left=now();o.reportStatus='submitted';o.status='awaiting_confirmation';log('小哥已结束本次服务并提交报告，等待客户核对并确认订单完成');}
 else if(type==='confirm_report'){own();need(role==='customer'&&o.status==='awaiting_confirmation','仅小哥已提交报告且等待客户本人确认的订单可完成结单');o.status='completed';o.reportStatus='confirmed';log('客户已确认本次订单服务完成，平台可另行抽查服务质量');}
 else if(type==='rate'){own();need(role==='customer'&&o.status==='completed','请先确认服务完成再评价');need(Number(input.rating)>=1&&Number(input.rating)<=5&&input.comment?.trim(),'请选择星级并填写评价');o.review={rating:Number(input.rating),comment:input.comment};log('客户提交本次服务评价 '+input.rating+' 星');}
 else if(type==='spotcheck'){hq();need(o&&o.report,'暂无服务报告可抽查');if(input.decision==='return'){need(input.reason?.trim(),'请填写补交理由');o.reportStatus='returned';o.reportReturn=input.reason;log('平台抽查要求报告补交：'+input.reason);}else{o.reportStatus='checked';log('平台完成报告抽查；客户原确认记录保留');}}
 else if(type==='revise_report'){own();need(role==='worker'&&o.reportStatus==='returned','没有需要补交的报告');need(input.report?.trim(),'请补充报告');o.report+='\n补充：'+input.report;o.reportStatus='resubmitted';log('工作人员补交报告，交回平台复核');}
 else if(type==='reassign'){own();need(role==='customer'&&o.worker&&['assigned','accepted'].includes(o.status),'此阶段请联系客服协调');o.reassignRequested=true;incident('换人申请',input.reason||'主人申请更换人员，请调度联系确认。');log('客户发起换人申请，待调度处理');}
 else if(type==='incident'){own();need(input.text?.trim(),'请说明现场情况和已采取的措施');if(role==='worker'&&['accepted','in_service'].includes(o.status)){o.previousStatus=o.status;o.status='paused';}incident(input.kind||'服务异常',input.text);log((role==='worker'?'现场暂停并上报：':'提交客服工单：')+(input.kind||'服务异常'));}
 else if(type==='extra_invite'){own();need(role==='worker'&&o.status==='in_service','只能在服务中邀请主人加单');o.extraInvited=true;incident('追加服务确认','工作人员发现需要增项，请主人在小程序自行确认服务和费用。');log('已邀请主人确认追加服务，未扣款');}
 else if(type==='extra_order'){own();need(role==='customer','追加服务须主人本人下单');const fee={id:'F'+id(),order:o.id,site:o.site,name:input.name||'追加猫砂清洁',amount:19,status:'unpaid'};data.fees.unshift(fee);o.extra.push(fee.id);log('主人新增演示追加服务，形成独立待付账单');}
 else if(type==='fee_pay'){need(role==='customer','仅本人可确认账单');const fee=data.fees.find(f=>f.id===input.fee);need(fee&&data.orders.some(x=>x.id===fee.order&&x.owner===(context.customer||'C01')),'无权操作该账单');need(fee.status==='unpaid','账单已处理，请勿重复支付');fee.status='paid';log('主人模拟支付追加账单 '+fee.id);}
 else if(type==='resolve_ticket'){hq();const ticket=data.incidents.find(x=>x.id===input.ticket);need(ticket,'工单不存在');need(input.result?.trim(),'请填写审批依据和处理结果');const linked=data.orders.find(x=>x.id===ticket.order),op=input.operation||'follow';
  need(!(input.close&&(op==='approve'||(ticket.approval==='已审批待执行'&&!['execute','return'].includes(op)))),'费用调整尚未执行，不可直接结案');
  if(op==='approve'){need(input.amount!==''&&Number.isFinite(Number(input.amount))&&Number(input.amount)>=0,'请明确本次费用调整演示金额');ticket.approval='已审批待执行';ticket.amount=Number(input.amount);}
  if(op==='return')ticket.approval='退回补充';
  if(op==='execute'){need(ticket.approval==='已审批待执行','费用调整须先审批，不能直接执行');ticket.approval='已模拟执行';}
  if(op==='resume'){need(linked?.status==='paused','关联服务不在暂停状态');linked.status=linked.previousStatus||'accepted';linked.history.push({time:now(),text:'总部核实现场和主人授权后恢复服务：'+input.result});}
  if(op==='cancel'){need(linked,'请关联待取消订单');const remaining=data.orders.filter(x=>(x.id===linked.id||(linked.series&&x.series===linked.series))&&!['completed','awaiting_confirmation','in_service','cancelled'].includes(x.status));need(remaining.length,'当前没有可直接取消的未履约任务，请先核对履约记录');remaining.forEach(x=>{x.status='cancelled';x.worker=null;x.history.push({time:now(),text:'客服取消未履约任务；费用另行核对，不自动计算退款'});});}
  ticket.status=input.close?'已闭环':'处理中';ticket.owner='总部客服';ticket.result=input.result;log('客服处理 '+ticket.id+'：'+input.result);}
 else if(type==='availability'){need(role==='worker','仅工作人员可报班');need(input.date&&input.time,'请选择日期和时段');data.availability.unshift({worker:context.worker||'W01',date:input.date,time:input.time,note:input.note||'报班'});log('提交报班/请假安排，等待调度确认');}
 else if(type==='staff_review'){hq();const w=workerFor(data,input.worker);need(w,'人员不存在');w.status=input.decision==='approve'?'active':'returned';w.reviewNote=input.reason||'资料及培训核对通过';log('人员审核 '+w.name+'：'+w.reviewNote);}
 else if(type==='activity_create'){need(['station','hq'].includes(role),'当前身份不能发布活动');need(input.title?.trim(),'请填写活动名称');data.activities.unshift({id:'E'+id(),title:input.title,site:context.site||'A',date:input.date||'待排期',time:'时段待确认',location:'社区活动场地（示例）',organizer:'群主/站点组织人（演示）',fee:19.9,capacity:20,joined:0,status:'draft'});log('新建社区活动草稿，待发布确认');}
 else if(type==='activity_publish'){hq();const event=data.activities.find(x=>x.id===input.event);need(event,'活动不存在');event.status='published';log('确认并发布活动 '+event.title+'（发布权限方案待业务确认）');}
 else if(type==='register'){need(role==='customer','请使用本人用户身份报名');const event=data.activities.find(x=>x.id===input.event&&x.status==='published'&&x.site===customerFor(context.customer).site);need(event,'活动未发布或不在所属社区');need(event.joined<event.capacity,'当前活动名额已满，请联系客服');need(!data.registrations.some(x=>x.event===event.id&&(x.owner||'C01')===(context.customer||'C01')),'已报名，请勿重复报名');data.registrations.push({event:event.id,owner:context.customer||'C01',status:event.fee?'模拟支付成功':'已报名'});event.joined++;log('主人确认活动报名及演示费用 '+event.title);}
 else if(type==='referral'){need(['customer','station'].includes(role),'请从用户或站点提交转介');need(input.service,'请选择专业服务');data.referrals.unshift({id:'RF'+id(),site:role==='customer'?customerFor(context.customer).site:(context.site||'A'),owner:role==='customer'?(context.customer||'C01'):((context.site||'A')==='A'?'C01':'C02'),pet:input.pet||'团团',service:input.service,department:input.service,status:'待联系',note:input.note||'请专业部门联系确认'});log('提交综合体预约意向，由专业部门确认');}
 else if(type==='referral_update'){hq();const r=data.referrals.find(x=>x.id===input.referral);need(r,'转介不存在');r.status=input.status;r.owner=input.owner||'专业部门受理人';log('转介更新 '+r.id+'：'+input.status);}
 else if(type==='catalog'){hq();need(input.name&&input.reason,'请填写项目及变更说明');data.catalogDrafts.unshift({name:input.name,reason:input.reason,status:'待确认',time:now()});log('提交服务/价格变更草稿，原订单不受影响');}
 else if(type==='handover'){need(['station','hq'].includes(role),'无此权限');need(input.text?.trim(),'请补充交接事项');data.handover.unshift({site:context.site||'A',text:input.text,time:now(),status:'待接手确认'});log('新增站务交接记录');}
 else if(type==='save_pet'){need(role==='customer'&&input.name?.trim(),'请填写宠物名称');data.pets.push({id:'P'+id(),owner:context.customer||'C01',name:input.name,type:input.type||'猫',breed:input.breed||'待补充',age:input.age||'待补充',note:input.note||''});log('新增演示宠物档案');}
 else if(type==='uncovered'){need(input.area?.trim(),'请填写意向社区名称，无需详细住址');data.uncovered.push({area:input.area,time:now()});log('登记未覆盖社区服务意向');}
 else if(type==='feedback'){need(input.text?.trim(),'请填写评审意见');data.reviewFeedback.push({role,page:input.page,text:input.text,decision:input.decision||'需修改',time:now()});}
 else throw Error('未识别的演示操作');
 return {message:'操作已记录，各端演示数据已同步'};
}
