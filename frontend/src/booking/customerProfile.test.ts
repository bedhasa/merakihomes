import test from 'node:test';
import assert from 'node:assert/strict';
import { updateCustomerName } from '@shared/api';

test('customer profile name update uses the authenticated self-service API',async()=>{
  const originalFetch=globalThis.fetch;
  let captured:{url:string;init?:RequestInit}|undefined;
  globalThis.fetch=async(input,init)=>{
    captured={url:String(input),init};
    return new Response(JSON.stringify({customer:{id:'customer-id',name:'Almaz Tadesse',firstName:'Almaz',lastName:'Tadesse',email:'customer@example.test',phone:'+251 911 222 333'}}),{status:200,headers:{'Content-Type':'application/json'}});
  };
  try{
    const customer=await updateCustomerName({firstName:'Almaz',lastName:'Tadesse'});
    assert.equal(captured?.url,'/api/customers/me/name');
    assert.equal(captured?.init?.method,'PATCH');
    assert.equal(captured?.init?.credentials,'include');
    assert.deepEqual(JSON.parse(String(captured?.init?.body)),{firstName:'Almaz',lastName:'Tadesse'});
    assert.equal(customer.name,'Almaz Tadesse');
  }finally{globalThis.fetch=originalFetch;}
});
