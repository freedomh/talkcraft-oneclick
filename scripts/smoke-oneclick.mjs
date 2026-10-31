import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';import {createRequire} from 'node:module';import path from 'node:path';import {root} from './oneclick.mjs';
const wb=path.join(root,'workbench'),dir=path.join(root,'.local/smoke');mkdirSync(dir,{recursive:true});
const port=Number(process.env.TALKCRAFT_SMOKE_PORT??5299);
const log=[];const child=spawn(process.execPath,[path.join(wb,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:wb,stdio:['ignore','pipe','pipe']});
child.stdout.on('data',b=>log.push(b.toString()));child.stderr.on('data',b=>log.push(b.toString()));
const base=`http://127.0.0.1:${port}`;
try {
  let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,250))}assert.ok(ready,'Workbench did not start: '+log.join(''));
  const html=await (await fetch(base)).text();assert.match(html,/TalkCraft|动效工作台/);
  const pipeline=await (await fetch(base+'/api/pipeline')).json();assert.ok(pipeline,'Pipeline endpoint unavailable');
  const project={name:'oneclick-smoke',fps:30,width:1080,height:1920,tracks:[{id:'track1',name:'示例',clips:[{id:'clip1',cardId:'text-basic',start:0,duration:30,inOffset:0,speed:1,opacity:1,scale:1,x:0,y:0,props:{content:'一键导出验证',fontSize:72,color:'#ffffff',background:'#101c3e'}}]}]};
  let job;
  for(let attempt=0;attempt<2;attempt++) {
    const response=await fetch(base+'/api/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project})});assert.equal(response.status,200);const {id}=await response.json();assert.ok(id);
    for(let i=0;i<360;i++){job=await (await fetch(base+'/api/export/'+id)).json();if(job.status==='done'||job.status==='error')break;await new Promise(r=>setTimeout(r,500))}
    assert.equal(job.status,'done',JSON.stringify(job));const output=path.join(wb,job.output);assert.ok(existsSync(output));assert.ok(readFileSync(output).byteLength>1000);
  }
  const output=path.join(wb,job.output);
  const req=createRequire(path.join(root,'runtime/package.json'));const result={http:true,pipeline:true,export:true,consecutiveExports:2,output:job.output,bytes:readFileSync(output).length};
  // The renderer already checks frame ranges; capture CLI proof and the exact dependency version.
  result.remotion=req('remotion/package.json').version;writeFileSync(path.join(dir,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
} finally {child.kill();writeFileSync(path.join(dir,'server.log'),log.join(''))}
