import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const source=resolve(process.env.SQLITE_SOURCE||'./data/meraki.sqlite');
if(!existsSync(source)){console.error(`SQLite source not found: ${source}`);process.exit(1);}
const seed=JSON.parse(readFileSync(new URL('./seed.json',import.meta.url),'utf8'));
const expected=seed.map(s=>({id:s.id,name:s.name,description:s.description,pricing_type:s.pricing_type,base_price:Number(s.base_price),currency:'USD',unit:s.unit,estimated_duration_minutes:s.duration,image:s.image,is_active:true})).sort((a,b)=>a.id.localeCompare(b.id));
const sqlite=new DatabaseSync(source,{readOnly:true});
try{
  const actual=sqlite.prepare('SELECT id,name,description,pricing_type,base_price,currency,unit,estimated_duration_minutes,image,is_active FROM services ORDER BY id').all().map(s=>({...s,base_price:Number(s.base_price),is_active:Boolean(s.is_active)}));
  const identical=JSON.stringify(actual)===JSON.stringify(expected);
  console.log(JSON.stringify({sqliteServices:actual.length,seedServices:expected.length,catalogueExactlyMatchesSeed:identical,bookingRows:sqlite.prepare('SELECT count(*) AS n FROM bookings').get().n,contactRows:sqlite.prepare("SELECT count(*) AS n FROM contact_submissions").get().n},null,2));
  if(!identical)throw new Error('The legacy SQLite services differ from the PostgreSQL development seed.');
}catch(error){console.error(`SQLite catalogue comparison failed: ${error.message}`);process.exitCode=1;}finally{sqlite.close();}
