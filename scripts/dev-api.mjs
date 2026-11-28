import { spawn } from 'node:child_process';
import { loadDevDatabaseConfig } from './dev-config.mjs';

const config=await loadDevDatabaseConfig();
const port=Number(config.PORT||process.env.PORT||config.API_PORT||process.env.API_PORT||5000);
let alreadyRunning=false;
try{
  const response=await fetch(`http://127.0.0.1:${port}/api/health`,{signal:AbortSignal.timeout(1000)});
  const health=await response.json();
  alreadyRunning=response.ok&&health.status==='ok'&&health.database==='postgresql';
}catch{}

if(alreadyRunning){
  console.log(`Meraki API is already healthy on port ${port}; reusing the running server.`);
}else{
  const child=spawn(process.execPath,['backend/index.mjs'],{cwd:process.cwd(),stdio:'inherit',env:{...process.env,...config},windowsHide:true});
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
  child.on('error',error=>{console.error(`Development API could not start: ${error.message}`);process.exitCode=1;});
  child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
}
