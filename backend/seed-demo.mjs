import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createPool } from './index.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const packages=JSON.parse(readFileSync(resolve(here,'demo-catalogue.json'),'utf8'));
const workers=JSON.parse(readFileSync(resolve(here,'demo-workers.json'),'utf8'));
const pool=createPool();

try {
  const services=(await pool.query("SELECT id FROM services WHERE is_active=TRUE AND id IN ('handyman_plumbing','gardening_outdoor','office_cleaning','elder_companion','childcare_nanny','cooking_service','maid_laundry','premium_home_cleaning')")).rows;
  const serviceIds=new Set(services.map(row=>row.id));
  const missing=[...new Set(packages.map(row=>row.serviceId))].filter(id=>!serviceIds.has(id));
  if(missing.length)throw new Error(`Cannot seed demo packages; active services missing: ${missing.join(', ')}`);

  await pool.query('BEGIN');
  for(const item of packages){
    const seedKey=`demo:${item.serviceId}:${item.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
    await pool.query(`INSERT INTO service_packages(service_id,name,description,base_price,currency,estimated_duration_minutes,is_active,demo_seed_key)
      SELECT $1,$2,$3,$4,'ETB',$5,TRUE,$6
      WHERE NOT EXISTS(SELECT 1 FROM service_packages WHERE service_id=$1 AND lower(name)=lower($2))
      ON CONFLICT(demo_seed_key) DO NOTHING`,[item.serviceId,item.name,item.description,item.price,item.duration,seedKey]);
  }
  for(const item of workers){
    const worker=(await pool.query(`INSERT INTO workers(worker_code,full_name,operational_status,eligibility_status,service_area,latitude,longitude,base_rate,rate_currency,is_demo)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,'ETB',TRUE)
      ON CONFLICT(worker_code) DO UPDATE SET worker_code=EXCLUDED.worker_code
      RETURNING id`,[item.code,item.name,item.pending?'unavailable':'active',item.pending?'pending_review':'eligible',item.area,item.lat,item.lon,item.rate||null])).rows[0];
    for(const [serviceId,qualification] of item.skills){
      const pending=item.reviewSkill===serviceId||item.pending;
      await pool.query(`INSERT INTO worker_services(worker_id,service_id,qualification_status,qualification_name,demo_qualification)
        VALUES($1,$2,$3,$4,TRUE) ON CONFLICT(worker_id,service_id) DO NOTHING`,[worker.id,serviceId,pending?'pending_review':'verified',qualification]);
    }
    for(const weekday of item.days){
      await pool.query(`INSERT INTO worker_availability(worker_id,weekday,start_time,end_time,timezone)
        SELECT $1,$2,'09:00','18:00','Africa/Addis_Ababa'
        WHERE NOT EXISTS(SELECT 1 FROM worker_availability WHERE worker_id=$1 AND weekday=$2 AND specific_date IS NULL AND start_time='09:00' AND end_time='18:00')`,[worker.id,weekday]);
    }
  }
  const busy=(await pool.query("SELECT id FROM workers WHERE worker_code='DEMO-W001'")).rows[0];
  if(busy){
    const starts=new Date();starts.setDate(starts.getDate()+1);starts.setHours(10,0,0,0);
    const ends=new Date(starts.getTime()+2*60*60*1000);
    await pool.query(`INSERT INTO worker_unavailability(worker_id,starts_at,ends_at,reason,is_demo,demo_seed_key)
      VALUES($1,$2,$3,'Seeded busy-time example; demo data only',TRUE,'demo:busy-w001') ON CONFLICT(demo_seed_key) DO NOTHING`,[busy.id,starts,ends]);
  }
  await pool.query('COMMIT');
  const result=await pool.query(`SELECT (SELECT count(*)::int FROM service_packages WHERE is_active) AS active_packages,
    (SELECT count(*)::int FROM workers WHERE is_demo) AS demo_workers,
    (SELECT count(DISTINCT service_id)::int FROM worker_services WHERE demo_qualification) AS worker_skill_services`);
  console.log(JSON.stringify({seed:'demo catalogue',...result.rows[0]},null,2));
} catch(error){await pool.query('ROLLBACK').catch(()=>{});console.error(`Demo seed failed: ${error.message}`);process.exitCode=1;}
finally{await pool.end();}
