import {spawn,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,readFileSync,readdirSync,realpathSync,statSync,symlinkSync,unlinkSync,writeFileSync,copyFileSync} from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'runtime'),wb=path.join(root,'workbench'),local=path.join(root,'.local');
const args=process.argv.slice(2);
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const run=(script,argv=[],cwd=root)=>{
  const r=spawnSync(process.execPath,[script,...argv],{cwd,stdio:'inherit'});
  if(r.error) throw r.error;
  if(r.status!==0) throw Error(`${path.basename(script)} failed (${r.status})`);
};
function linkDirectory(target,destination) {
  if(existsSync(destination)||(()=>{try{lstatSync(destination);return true}catch{return false}})()) {
    const st=lstatSync(destination);
    if(st.isSymbolicLink()) {
      if(existsSync(destination)&&realpathSync(destination)===realpathSync(target)) return;
      unlinkSync(destination);
    } else if(st.isFile()&&readFileSync(destination,'utf8').trim().replaceAll('\\','/')==='../template/cards'&&path.basename(destination)==='tplcards') {
      // Git on Windows may check a Unix symlink out as a plain text file.
      unlinkSync(destination);
    } else throw Error(`Refusing to overwrite existing files: ${destination}. Move this directory aside before retrying.`);
  }
  symlinkSync(target,destination,process.platform==='win32'?'junction':'dir');
}
function npmCli() {
  const prefix=path.dirname(process.execPath);
  const paths=[process.env.npm_execpath,path.join(prefix,'node_modules/npm/bin/npm-cli.js'),path.resolve(prefix,'../lib/node_modules/npm/bin/npm-cli.js'),'/usr/share/nodejs/npm/bin/npm-cli.js'];
  const cli=paths.find(x=>x&&existsSync(x));
  if(!cli) throw Error('npm was not found. Install an official Node.js distribution including npm.');
  return cli;
}
export function linkProject(project) {
  const absolute=path.resolve(project);
  const rem=existsSync(path.join(absolute,'remotion/src'))?path.join(absolute,'remotion'):absolute;
  if(!existsSync(path.join(rem,'src'))) throw Error(`No remotion/src found: ${project}`);
  const stateFile=path.join(local,'linked-project.json');
  const state=existsSync(stateFile)?JSON.parse(readFileSync(stateFile,'utf8')):{entries:[]};
  const pub=path.join(wb,'public');mkdirSync(pub,{recursive:true});
  // Only unlink entries created by this launcher; never recursively remove source media.
  for(const name of state.entries) {
    if(path.basename(name)!==name) throw Error('Invalid managed media entry');
    const dest=path.join(pub,name);
    try{const st=lstatSync(dest);if(st.isSymbolicLink()||st.isFile())unlinkSync(dest);else throw Error(`Refusing to remove unmanaged directory: ${dest}`)}catch(e){if(e.code!=='ENOENT')throw e}
  }
  const entries=[];
  const source=path.join(rem,'public');
  if(existsSync(source)) for(const name of readdirSync(source)) {
    if(name.startsWith('.')||['cardpreviews','cardthumbs'].includes(name))continue;
    const src=path.join(source,name),dest=path.join(pub,name);
    if(existsSync(dest))throw Error(`Media name collision; preserved existing file: ${dest}`);
    if(statSync(src).isDirectory())linkDirectory(src,dest);else copyFileSync(src,dest);
    entries.push(name);
  }
  linkDirectory(path.join(rem,'src'),path.join(wb,'kbsrc'));
  if(!existsSync(path.join(rem,'node_modules')))linkDirectory(path.join(runtime,'node_modules'),path.join(rem,'node_modules'));
  writeFileSync(stateFile,JSON.stringify({project:path.dirname(rem),rem,entries},null,2));
  return rem;
}
function toneDemo() {
  const out=path.join(root,'examples/starter/remotion/public/narration.wav');
  if(existsSync(out)) return;
  mkdirSync(path.dirname(out),{recursive:true});
  const rate=48000,count=rate*4,pcm=Buffer.alloc(count*2),header=Buffer.alloc(44);
  for(let i=0;i<count;i++){const t=i/rate;const u=t%2;const a=u<.12?Math.sin(Math.PI*u/.12)*.06:0;pcm.writeInt16LE(Math.round(Math.sin(2*Math.PI*440*t)*a*32767),i*2)}
  header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);writeFileSync(out,Buffer.concat([header,pcm]));
}
export async function setup() {
  const major=Number(process.versions.node.split('.')[0]);
  if(major<22)throw Error('Node.js 22 or newer is required. On Windows double-click start.cmd for a private portable runtime.');
  mkdirSync(local,{recursive:true});
  const lock=readFileSync(path.join(runtime,'package-lock.json'));
  const hash=createHash('sha256').update(lock).digest('hex');
  const marker=path.join(local,'installed-lock.sha256');
  if(!existsSync(path.join(runtime,'node_modules/remotion/package.json'))||!existsSync(marker)||readFileSync(marker,'utf8')!==hash) {
    console.log('[setup] Installing locked dependencies (first launch needs Internet)...');
    run(npmCli(),['ci','--no-audit','--no-fund'],runtime);
    writeFileSync(marker,hash);
  }
  linkDirectory(path.join(runtime,'node_modules'),path.join(wb,'node_modules'));
  linkDirectory(path.join(root,'template/cards'),path.join(wb,'tplcards'));
  mkdirSync(path.join(root,'gallery/media'),{recursive:true});
  linkDirectory(path.join(root,'gallery/media'),path.join(wb,'public/cardpreviews'));
  linkDirectory(path.join(root,'gallery/thumbs'),path.join(wb,'public/cardthumbs'));
  toneDemo();
  const stateFile=path.join(local,'linked-project.json');
  const project=option('--project',existsSync(stateFile)?JSON.parse(readFileSync(stateFile,'utf8')).rem:path.join(root,'examples/starter'));
  linkProject(project);
  run(path.join(wb,'scripts/gen-index.mjs'),[],wb);
  console.log('[setup] Checking Chrome Headless Shell...');
  run(path.join(runtime,'node_modules/@remotion/cli/remotion-cli.js'),['browser','ensure'],wb);
  console.log('[setup] Ready. Your files and global Node.js were not upgraded.');
}
const freePort=p=>new Promise(resolve=>{const s=net.createServer();s.once('error',()=>resolve(false));s.listen(p,'127.0.0.1',()=>s.close(()=>resolve(true)))});
async function main() {
  await setup();
  if(args.includes('--setup'))return;
  if(args.includes('--build')){run(path.join(wb,'node_modules/typescript/bin/tsc'),['-b'],wb);run(path.join(wb,'node_modules/vite/bin/vite.js'),['build'],wb);return}
  let port=Number(option('--port','5199'));
  if(!Number.isInteger(port)||port<1024||port>65515)throw Error('Port must be an integer from 1024 to 65515');
  const requested=port;
  while(!(await freePort(port))){if(++port>=requested+20)throw Error('No free local port found')}
  const url=`http://127.0.0.1:${port}/?tracks`;
  console.log(`[workbench] ${url} (Ctrl+C to stop)`);
  const child=spawn(process.execPath,[path.join(wb,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:wb,stdio:'inherit'});
  process.on('SIGINT',()=>child.kill('SIGINT'));process.on('SIGTERM',()=>child.kill('SIGTERM'));
  if(!args.includes('--no-open')) for(let i=0;i<60;i++) {
    try{const r=await fetch(url);if(r.ok){const cmd=process.platform==='win32'?['explorer.exe',[url]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];const opener=spawn(cmd[0],cmd[1],{stdio:'ignore',detached:true});opener.on('error',()=>console.log(`Open manually: ${url}`));opener.unref();break}}catch{}
    await new Promise(r=>setTimeout(r,500));
  }
  child.on('error',e=>{console.error(e.message);process.exitCode=1});
  await new Promise(resolve=>child.on('exit',code=>{process.exitCode=code??0;resolve()}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error('[error]',e.message);process.exitCode=1});
