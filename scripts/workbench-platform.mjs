import {copyFileSync,existsSync,mkdirSync,readdirSync,rmSync,lstatSync,realpathSync,statSync} from 'node:fs';
import path from 'node:path';

function copyMedia(source,destination) {
  if(statSync(source).isDirectory()) {
    mkdirSync(destination,{recursive:true});
    for(const name of readdirSync(source))copyMedia(path.join(source,name),path.join(destination,name));
  } else copyFileSync(source,destination);
}

// Render from real files: Remotion's static server does not serve symlinks.
export function syncRenderPublic(source, destination) {
  if(path.basename(destination)!=='.render-public'||path.resolve(source)===path.resolve(destination)||realpathSync(path.dirname(source))!==realpathSync(path.dirname(destination)))throw Error('Render staging must be a separate .render-public directory beside public');
  if(existsSync(destination)&&lstatSync(destination).isSymbolicLink())throw Error('Render staging may not be a symlink');
  mkdirSync(destination,{recursive:true});
  const excluded=new Set(['cardpreviews','cardthumbs']);
  for(const item of readdirSync(destination)) rmSync(path.join(destination,item),{recursive:true,force:true});
  if(!existsSync(source)) return;
  for(const item of readdirSync(source)) {
    if(excluded.has(item)||item.startsWith('.')) continue;
    copyMedia(path.join(source,item),path.join(destination,item));
  }
}

export function remotionCommand(workbench,args) {
  return {command:process.execPath,args:[path.join(workbench,'node_modules/@remotion/cli/remotion-cli.js'),...args]};
}
