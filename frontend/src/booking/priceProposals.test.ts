import test from 'node:test';
import assert from 'node:assert/strict';
import { decideCustomerApproval, getCustomerPriceProposals } from '@shared/api';

test('customer price proposal API uses the authenticated account and preserves decision history',async()=>{
  const originalFetch=globalThis.fetch;
  let captured:{url:string;init?:RequestInit}|undefined;
  globalThis.fetch=async(input,init)=>{
    captured={url:String(input),init};
    return new Response(JSON.stringify({proposals:[{id:'proposal-id',itemId:'item-id',bookingReference:'MRK-AB12CD34EF56',serviceName:'Home repair',amount:'725.00',currency:'ETB',reason:'Reviewed scope',status:'accepted',createdAt:'2026-01-01T00:00:00.000Z',decidedAt:'2026-01-02T00:00:00.000Z'}]}),{status:200,headers:{'Content-Type':'application/json'}});
  };
  try{
    const proposals=await getCustomerPriceProposals();
    assert.equal(captured?.url,'/api/customers/me/price-proposals');
    assert.equal(captured?.init?.method,undefined);
    assert.equal(captured?.init?.credentials,'include');
    assert.equal(proposals[0].status,'accepted');
    assert.equal(Number(proposals[0].amount),725);

    await decideCustomerApproval('price','proposal-id','rejected');
    assert.equal(captured?.url,'/api/customers/me/approvals/price/proposal-id');
    assert.equal(captured?.init?.method,'PATCH');
    assert.equal(captured?.init?.credentials,'include');
    assert.deepEqual(JSON.parse(String(captured?.init?.body)),{decision:'rejected'});
  }finally{globalThis.fetch=originalFetch;}
});
