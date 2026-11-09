import React from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../src/lib/api';
import { Button, C, Card, Empty, Loading, Page, Title } from '../src/components/ui';
import { useAuth } from '../src/context/AuthContext';

type Notice={id:string;channel:string;template:string;relatedEntity:string|null;status:string;sentAt:string|null;createdAt:string};
export default function NotificationsScreen(){const {customer}=useAuth();const router=useRouter();const q=useQuery({queryKey:['notifications'],queryFn:()=>api<{notifications:Notice[]}>('/customers/me/notifications'),enabled:!!customer});return <Page><Title subtitle="Notifications that have actually been recorded for your account.">Notifications</Title>{!customer?<Empty title="Sign in to view notifications" body="Account notifications are private to registered customers." action={<Button title="Sign in" onPress={()=>router.push('/(auth)/login')} />} />:q.isLoading?<Loading/>:q.isError?<Empty title="Could not load notifications" body="Retry after checking the API connection." action={<Button title="Retry" variant="outline" onPress={()=>void q.refetch()}/>} />:!q.data?.notifications.length?<Empty title="No notifications yet" body="There are no recorded notifications for this account. New messages will appear when a notification provider is configured."/>:<View style={{gap:10}}>{q.data.notifications.map(n=><Card key={n.id}><Text style={{color:C.navy,fontWeight:'900'}}>{n.template.replaceAll('_',' ')}</Text><Text style={{color:C.slate,fontSize:12}}>{n.channel} · {n.status}</Text><Text style={{color:C.muted,fontSize:11}}>{new Date(n.createdAt).toLocaleString()}</Text>{n.relatedEntity?<Text style={{color:C.muted,fontSize:11}}>Related reference · {n.relatedEntity}</Text>:null}</Card>)}</View>}</Page>;}
