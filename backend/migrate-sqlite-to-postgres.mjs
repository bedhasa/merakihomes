import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPool, migrate } from './index.mjs';

const source=resolve(process.env.SQLITE_SOURCE||'./data/meraki.sqlite');
if(!existsSync(source)){console.error(`SQLite source not found: ${source}`);process.exit(1);}
const sqlite=new DatabaseSync(source,{readOnly:true});
const pg=createPool();
const mapStatus=s=>({draft:'pending',requested:'pending',awaiting_assignment:'pending',assigned:'confirmed',en_route:'confirmed',arrived:'confirmed',payment_pending:'pending',payment_failed:'pending',disputed:'pending'}[s]||s);
const hasTable=name=>Boolean(sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name));
const columns=name=>hasTable(name)?new Set(sqlite.prepare(`PRAGMA table_info(${name})`).all().map(c=>c.name)):new Set();
const value=(row,cols,...names)=>{for(const name of names)if(cols.has(name)&&row[name]!=null)return row[name];return null;};
try{
  await migrate(pg);
  const client=await pg.connect();let copied={services:0,bookings:0,bookingHistory:0,contacts:0,auditLogs:0};const bookingIds=new Map(),contactIds=new Map();
  try{
    await client.query('BEGIN');
    for(const s of sqlite.prepare('SELECT * FROM services').all()){
      const r=await client.query(`INSERT INTO services(id,name,description,pricing_type,base_price,currency,unit,estimated_duration_minutes,image,is_active,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(id) DO NOTHING`,[s.id,s.name,s.description,s.pricing_type||'quotation',s.base_price,s.currency||'USD',s.unit,s.estimated_duration_minutes,s.image||'',Boolean(s.is_active),s.created_at,s.updated_at]);copied.services+=r.rowCount;
    }
    for(const b of sqlite.prepare('SELECT * FROM bookings').all()){
      const id=randomUUID(),reference=b.reference||b.id,status=mapStatus(b.status||'pending');
      const r=await client.query(`INSERT INTO bookings(id,reference,service_id,service_name_snapshot,status,booking_source,selection_method,customer_name_snapshot,customer_phone_snapshot,customer_email_snapshot,address_snapshot,neighborhood,requested_start,estimated_duration_minutes,scope_notes,starting_estimate,currency,created_at,updated_at)
        VALUES($1,$2,$3,$4,$5,'website','operations_selected',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) ON CONFLICT(reference) DO NOTHING`,[id,reference,b.service_id,b.service_name_snapshot||b.service_name,status,b.customer_name_snapshot||b.customer_name,b.customer_phone_snapshot||b.customer_phone,b.customer_email_snapshot||b.customer_email||null,b.address_snapshot||b.address,b.neighborhood||'',new Date(b.requested_start||b.created_at),b.estimated_duration_minutes||60,b.scope_notes||b.notes||'',b.starting_estimate??b.total_price??null,b.currency||'USD',b.created_at,b.updated_at||b.created_at]);
      if(r.rowCount){copied.bookings++;bookingIds.set(String(b.id),id);if(hasTable('booking_status_history')){
        const hc=columns('booking_status_history'),history=sqlite.prepare('SELECT * FROM booking_status_history WHERE booking_id=? ORDER BY created_at').all(b.id);
        if(history.length){for(const h of history){await client.query(`INSERT INTO booking_status_history(booking_id,old_status,new_status,actor,reason,created_at) VALUES($1,$2,$3,$4,$5,$6)`,[id,mapStatus(value(h,hc,'old_status'))||null,mapStatus(value(h,hc,'new_status')||status),String(value(h,hc,'actor')||'migration'),String(value(h,hc,'reason')||'Imported from the previous SQLite database'),value(h,hc,'created_at')||b.created_at]);copied.bookingHistory++;}}
        else{await client.query(`INSERT INTO booking_status_history(booking_id,new_status,actor,reason,created_at) VALUES($1,$2,'migration','Imported from the previous SQLite database',$3)`,[id,status,b.created_at]);copied.bookingHistory++;}
      }else{await client.query(`INSERT INTO booking_status_history(booking_id,new_status,actor,reason,created_at) VALUES($1,$2,'migration','Imported from the previous SQLite database',$3)`,[id,status,b.created_at]);copied.bookingHistory++;}}
    }
    if(hasTable('contact_submissions'))for(const c of sqlite.prepare('SELECT * FROM contact_submissions').all()){
      const id=String(c.id||randomUUID());const r=await client.query('INSERT INTO contact_submissions(id,name,phone,email,message,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING',[id,c.name,c.phone,c.email,c.message,c.status,c.created_at]);if(r.rowCount){copied.contacts++;contactIds.set(String(c.id),id);}
    }
    if(hasTable('audit_logs')){
      const ac=columns('audit_logs');for(const a of sqlite.prepare('SELECT * FROM audit_logs').all()){
        let entityId=String(value(a,ac,'entity_id')||'');const kind=value(a,ac,'entity_type');if(kind==='booking')entityId=bookingIds.get(entityId)||entityId;if(kind==='contact')entityId=contactIds.get(entityId)||entityId;
        await client.query('INSERT INTO audit_logs(actor,action,entity_type,entity_id,reason,request_id,metadata,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[String(value(a,ac,'actor')||'migration'),String(value(a,ac,'action')||'legacy.event'),String(kind||'legacy'),entityId,String(value(a,ac,'reason')||'Imported from the previous SQLite database'),value(a,ac,'request_id'),JSON.stringify(value(a,ac,'metadata')||{}),value(a,ac,'created_at')||new Date()]);copied.auditLogs++;
      }
    }
    await client.query('COMMIT');
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  console.log(`Copied legacy rows without deleting the SQLite source: ${JSON.stringify(copied)}`);
}catch(e){console.error(`Migration failed; SQLite source remains intact: ${e.message}`);process.exitCode=1;}finally{sqlite.close();await pg.end();}
