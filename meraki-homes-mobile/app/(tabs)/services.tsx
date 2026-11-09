import React, { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../../src/lib/api';
import type { Service } from '../../src/lib/types';
import { C, Empty, Field, Loading, Page, Title, Card, Button } from '../../src/components/ui';

export default function ServicesScreen() {
  const router=useRouter(); const [search,setSearch]=useState('');
  const query=useQuery({queryKey:['services'],queryFn:()=>api<{services:Service[]}>('/services',{},false)});
  const filtered=useMemo(()=>query.data?.services.filter(s=>`${s.name} ${s.description}`.toLowerCase().includes(search.toLowerCase()))||[],[query.data,search]);
  return <Page><Title subtitle="Choose one or more services. Pricing comes from the live catalogue.">Service catalogue</Title><Field label="Search services" value={search} onChangeText={setSearch} placeholder="Cleaning, gardening, repairs…" returnKeyType="search"/><View style={{flexDirection:'row',alignItems:'center',gap:7}}><Feather name="search" size={15} color={C.muted}/><Text style={{fontSize:11,color:C.muted}}>{filtered.length} available services</Text></View>{query.isLoading?<Loading/>:query.isError?<Empty title="Catalogue unavailable" body="The app could not reach the service catalogue." action={<Button title="Retry" variant="outline" onPress={()=>void query.refetch()}/>} />:filtered.length===0?<Empty title="No matching services" body="Try another search or clear the field."/>:<View style={{gap:12}}>{filtered.map(s=><Pressable key={s.id} onPress={()=>router.push({pathname:'/service/[id]',params:{id:s.id}})}><Card style={{padding:0,overflow:'hidden'}}>{s.image?<Image source={{uri:s.image}} style={{width:'100%',height:150,backgroundColor:C.canvas}} resizeMode="cover"/>:null}<View style={{padding:15,gap:7}}><Text style={{fontSize:16,fontWeight:'900',color:C.navy}}>{s.name}</Text><Text style={{fontSize:12,color:C.slate,lineHeight:18}}>{s.description}</Text><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8}}><Text style={{color:'#7B5804',fontSize:12,fontWeight:'800',flex:1}}>{s.pricing_type==='quotation'?'Price after scope review':`${s.basePrice.toLocaleString()} ${s.currency} ${s.unit}`}</Text><Text style={{color:C.muted,fontSize:11}}>{s.durationMinutes} min</Text></View><Text style={{color:C.muted,fontSize:11}}>{(s.reviewsCount ?? 0) > 0 && s.rating != null ? `★ ${s.rating.toFixed(1)} · ${s.reviewsCount} reviews` : 'New · No reviews yet'}</Text><Button title="View service" onPress={()=>router.push({pathname:'/service/[id]',params:{id:s.id}})} variant="outline"/></View></Card></Pressable>)}</View>}</Page>;
}
