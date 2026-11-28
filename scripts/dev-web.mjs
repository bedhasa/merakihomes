import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const port=3000;
let response;

try{
  response=await fetch(`http://127.0.0.1:${port}`,{redirect:'manual',signal:AbortSignal.timeout(10000)});
}catch(error){
  if(error.cause?.code!=='ECONNREFUSED')
    throw new Error(`Port ${port} is occupied or unresponsive; cannot verify that it is the Meraki frontend. Refusing to start another server.`,{cause:error});
}

if(response){
  const body=await response.text();
  if(response.ok&&body.includes('Meraki Homes')&&body.includes('__next')){
    console.log(`Meraki frontend is already healthy on port ${port}; reusing the running server.`);
    process.exit(0);
  }
  throw new Error(`Port ${port} is serving an application that is not a healthy Meraki Next.js frontend (HTTP ${response.status}). Refusing to start the Meraki frontend.`);
}

const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','frontend','--hostname','0.0.0.0','--port',String(port)],{cwd:root,stdio:'inherit',windowsHide:true});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('error',error=>{console.error(`Meraki frontend could not start: ${error.message}`);process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
