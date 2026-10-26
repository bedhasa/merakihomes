import { spawn } from 'node:child_process';

const vite='node_modules/vite/bin/vite.js';
const next='node_modules/next/dist/bin/next';
const root=process.cwd();
const children=[
  spawn(process.execPath,[next,'dev','frontend','--hostname','0.0.0.0','--port','3000'],{cwd:root,stdio:'inherit',env:process.env,windowsHide:true}),
  spawn(process.execPath,[vite,'--config','management/vite.config.ts','--configLoader','runner','--host=0.0.0.0','--strictPort'],{cwd:root,stdio:'inherit',env:process.env,windowsHide:true}),
  spawn(process.execPath,['backend/index.mjs'],{cwd:root,stdio:'inherit',env:process.env,windowsHide:true}),
];
let stopping=false;
function terminate(child){
  if(child.exitCode!==null)return;
  if(process.platform==='win32'){
    const killer=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
    killer.on('error',()=>child.kill());
  }else child.kill('SIGTERM');
}
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)terminate(child);process.exitCode=code;}
for(const child of children){child.on('exit',code=>{if(!stopping)stop(code||0);});child.on('error',()=>stop(1));}
process.on('SIGINT',()=>stop(0));process.on('SIGTERM',()=>stop(0));
