// Local integration server: GitHub is simulated in memory; nothing is uploaded.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import worker from '../relay/worker.mjs';
const root=resolve(new URL('..',import.meta.url).pathname),port=Number(process.env.PETSCOM_PREVIEW_PORT || 8765),origin=`http://127.0.0.1:${port}`;
const issues=[];
const nativeFetch=globalThis.fetch;
globalThis.fetch=async(url,options={})=>{
  const target=String(url);
  if (!target.startsWith('https://api.github.com/repos/gordon310/petsCOM/')) return nativeFetch(url,options);
  if (options.method==='POST') {
    const payload=JSON.parse(options.body),number=issues.length+1;
    const issue={...payload,number,created_at:new Date().toISOString(),state:'open',html_url:`https://github.com/gordon310/petsCOM/issues/${number}`};issues.push(issue);
    return Response.json(issue,{status:201});
  }
  const found=target.match(/\/issues\/(\d+)$/);
  if (found) {const issue=issues.find(r=>r.number===Number(found[1]));return Response.json(issue || {},{status:issue?200:404});}
  return Response.json([...issues].reverse());
};
const env={GITHUB_REPO:'gordon310/petsCOM',GITHUB_TOKEN:'local-simulation-only',ALLOWED_ORIGIN:origin,FORM_KEY:'petscom-business-v04-20261017'};
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,origin);
    if (url.pathname.startsWith('/relay/')) {
      const chunks=[];for await (const chunk of req) chunks.push(chunk);
      const request=new Request('http://relay.local'+url.pathname.slice('/relay'.length)+url.search,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks).toString('utf8')}:{})});
      const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if (url.pathname==='/intake-config.json') {res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({enabled:true,relayUrl:origin+'/relay/',repository:'gordon310/petsCOM',formKey:env.FORM_KEY}));return;}
    const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if (!path.startsWith(root+'/') || path.includes('/node_modules/') || path.includes('/.git/')) {res.writeHead(403);res.end();return;}
    let body=await readFile(path);
    if (extname(path)==='.html') body=Buffer.from(body.toString().replace('<main class="wrap">','<main class="wrap"><p class="error">本机联调：记录仅在内存中，不是真实线上回收。</p>'));
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
    res.writeHead(200,{'Content-Type':types[extname(path)] || 'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Local simulation only: ${origin}/?mode=test`));
