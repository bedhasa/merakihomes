import { spawn } from 'node:child_process';
import { loadDevDatabaseConfig } from './dev-config.mjs';

const config=loadDevDatabaseConfig();
const child=spawn(process.execPath,['backend/index.mjs'],{cwd:process.cwd(),stdio:'inherit',env:{...process.env,...config},windowsHide:true});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('error',error=>{console.error(`Development API could not start: ${error.message}`);process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
