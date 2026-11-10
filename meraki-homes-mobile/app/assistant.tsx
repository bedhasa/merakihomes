import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, postJson } from '../src/lib/api';
import { getAgazVisitorId } from '../src/lib/agaz';
import { useAuth } from '../src/context/AuthContext';
import { Button, C, Card, ErrorBanner, Loading } from '../src/components/ui';

type Language = 'auto' | 'en' | 'am' | 'om';
type Suggestion = { id: string; categoryId: string | null; packageId: string | null };
type Message = { role: 'user' | 'model'; text: string; suggestedService?: Suggestion | null };
type Conversation = { id: string; title: string; language: Language; createdAt: string; updatedAt: string };
const greeting = "Hello! I'm Merk, your Meraki Homes assistant. I can explain services and help you start a request. Availability, final scope, and price are confirmed by the Meraki Homes team.";
function agazFailure(error: unknown): { message: string; retryable: boolean } {
  if (error instanceof ApiError) {
    if (error.status === 0 || error.code === 'network' || error.status === 408 || error.code === 'timeout') {
      return { message: 'Please check your internet connection and try again.', retryable: true };
    }
    if (error.code === 'quota_daily') return { message: error.message, retryable: false };
    if (error.code === 'config') return { message: error.message, retryable: false };
    if (error.code === 'rate_limit' || error.code === 'busy' || error.code === 'invalid' || error.code === 'provider') {
      return { message: error.message, retryable: error.code !== 'invalid' };
    }
    return { message: error.message, retryable: error.status >= 500 || error.status === 429 };
  }
  return { message: 'Merk could not get a response. Please try again.', retryable: true };
}
const starters = ['What services does Meraki Homes offer?', 'Help me find a service.'];
const languageLabels: Record<Language, string> = { auto: 'Auto', en: 'English', am: 'Amharic', om: 'Afaan Oromoo' };

export default function AssistantScreen() {
  const { customer, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scroll = useRef<ScrollViewInstance | null>(null);
  const [visitorId, setVisitorId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{ role: 'model', text: greeting }]);
  const [language, setLanguage] = useState<Language>('auto');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retryText, setRetryText] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const sending = useRef(false);

  useEffect(() => { void getAgazVisitorId().then(setVisitorId).catch(() => setError('Could not start a private visitor session. Please reopen Merk.')); }, []);
  const history = useQuery({ queryKey: ['agaz-conversations'], queryFn: () => api<{ conversations: Conversation[] }>('/agaz/conversations'), enabled: !!customer });

  const send = async (rawText: string, retry = false) => {
    const text = rawText.trim();
    if (!text || busy || sending.current || (!customer && !visitorId)) return;
    sending.current = true;
    if (!retry) { setMessages(old => [...old, { role: 'user', text }]); setInput(''); }
    setBusy(true); setError(''); setRetryText(''); setCanRetry(false);
    try {
      const result = await api<{ conversationId: string; message: string; language: Language; suggestedService: Suggestion | null }>('/agaz/chat', postJson({ message: text, language, conversationId, visitorId: visitorId || undefined }), Boolean(customer));
      setConversationId(result.conversationId);
      setMessages(old => [...old, { role: 'model', text: result.message, suggestedService: result.suggestedService }]);
      if (customer) await queryClient.invalidateQueries({ queryKey: ['agaz-conversations'] });
    } catch (e) {
      const failure = agazFailure(e);
      setError(failure.message);
      setRetryText(failure.retryable ? text : '');
      setCanRetry(failure.retryable);
    } finally {
      sending.current = false;
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const startNew = () => {
    setConversationId(null); setMessages([{ role: 'model', text: greeting }]); setError(''); setRetryText(''); setCanRetry(false); setInput(''); setHistoryOpen(false);
  };

  const openConversation = async (id: string) => {
    setBusy(true); setError('');
    try {
      const suffix = customer ? '' : `?visitorId=${encodeURIComponent(visitorId)}`;
      const result = await api<{ conversation: Conversation; messages: Array<{ role: 'user' | 'model'; text: string; suggestedServiceId: string | null; suggestedPackageId: string | null }> }>(`/agaz/conversations/${id}${suffix}`);
      setConversationId(result.conversation.id); setLanguage(result.conversation.language);
      setMessages(result.messages.map(message => ({ role: message.role, text: message.text, suggestedService: message.suggestedServiceId ? { id: message.suggestedServiceId, categoryId: null, packageId: message.suggestedPackageId } : null })));
      setHistoryOpen(false);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not open that conversation.'); }
    finally { setBusy(false); }
  };

  const deleteConversation = async () => {
    if (!conversationId) return;
    setBusy(true); setError('');
    try {
      const suffix = customer ? '' : `?visitorId=${encodeURIComponent(visitorId)}`;
      await api(`/agaz/conversations/${conversationId}${suffix}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['agaz-conversations'] });
      startNew();
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not delete this conversation.'); }
    finally { setBusy(false); }
  };

  if (loading) return <Loading />;
  return <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: C.canvas }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <View style={{ flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 12, paddingTop: 4, paddingBottom: 4, gap: 7 }}>
        <View style={{ minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F7D37E', alignItems: 'center', justifyContent: 'center' }}><Feather name="star" size={16} color={C.navy} /></View>
          <View style={{ flex: 1 }}><Text style={{ color: C.navy, fontWeight: '800', fontSize: 16 }}>አጋዥ — Merk</Text><Text style={{ color: C.muted, fontSize: 10 }}>Your Meraki Homes Assistant</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Start a new conversation" onPress={startNew} style={{ padding: 7 }}><Feather name="plus-circle" size={20} color={C.navy} /></Pressable>
          {customer ? <Pressable accessibilityRole="button" accessibilityLabel="Conversation history" onPress={() => setHistoryOpen(value => !value)} style={{ padding: 7 }}><Feather name="clock" size={19} color={C.navy} /></Pressable> : null}
          {conversationId ? <Pressable accessibilityRole="button" accessibilityLabel="Delete this conversation" onPress={() => void deleteConversation()} style={{ padding: 7 }}><Feather name="trash-2" size={18} color={C.red} /></Pressable> : null}
        </View>

        {historyOpen && customer ? <Card style={{ maxHeight: 180, padding: 11, gap: 7 }}><Text style={{ color: C.navy, fontWeight: '900', fontSize: 13 }}>Your conversations</Text>{history.isLoading ? <ActivityIndicator color={C.gold} /> : history.isError ? <Text style={{ color: C.muted, fontSize: 11 }}>Conversation history could not load.</Text> : history.data?.conversations.length ? <ScrollView nestedScrollEnabled>{history.data.conversations.map(item => <Pressable key={item.id} onPress={() => void openConversation(item.id)} style={{ paddingVertical: 9, borderTopWidth: 1, borderColor: C.border }}><Text numberOfLines={1} style={{ color: C.navy, fontSize: 12, fontWeight: '700' }}>{item.title}</Text><Text style={{ color: C.muted, fontSize: 10 }}>{new Date(item.updatedAt).toLocaleString()}</Text></Pressable>)}</ScrollView> : <Text style={{ color: C.muted, fontSize: 11 }}>Your saved conversations will appear here.</Text>}</Card> : null}

        <ScrollView horizontal style={{ height: 42, flexGrow: 0, flexShrink: 0 }} showsHorizontalScrollIndicator={false} contentContainerStyle={{ height: 42, alignItems: 'center', gap: 7 }}>
          {(Object.keys(languageLabels) as Language[]).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: language === value }} onPress={() => setLanguage(value)} style={{ height: 34, flexShrink: 0, paddingHorizontal: 13, borderRadius: 17, borderWidth: 1, borderColor: language === value ? C.navy : C.border, backgroundColor: language === value ? C.navy : C.white, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: language === value ? C.white : C.slate, fontSize: 13, fontWeight: '700' }}>{languageLabels[value]}</Text></Pressable>)}
        </ScrollView>

        <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ gap: 8, paddingVertical: 4 }} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
          {messages.map((message, index) => <View key={`${index}-${message.role}`} style={{ alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: message.role === 'user' ? C.navy : C.white, borderWidth: 1, borderColor: message.role === 'user' ? C.navy : C.border, gap: 7 }}>
            <Text style={{ fontSize: 13, color: message.role === 'user' ? C.white : C.ink, lineHeight: 19 }}>{message.text}</Text>
            {message.suggestedService ? <Button title="Continue to booking" variant="gold" onPress={() => router.push({ pathname: '/booking', params: { serviceId: message.suggestedService!.id, packageId: message.suggestedService!.packageId || undefined, source: 'agaz' } })} /> : null}
          </View>)}
          {busy ? <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 }}><ActivityIndicator size="small" color={C.gold} /><Text style={{ color: C.muted, fontSize: 12 }}>Thinking...</Text></View> : null}
          <ErrorBanner message={error} />
          {retryText && canRetry ? <Button title="Retry message" variant="outline" onPress={() => void send(retryText, true)} disabled={busy} /> : null}
        </ScrollView>

        {!conversationId && !historyOpen ? <ScrollView horizontal style={{ height: 46, flexGrow: 0, flexShrink: 0 }} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ height: 46, alignItems: 'center', gap: 7 }}>{starters.map(question => <Pressable key={question} accessibilityRole="button" onPress={() => void send(question)} style={{ height: 40, flexShrink: 0, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.white }}><Text numberOfLines={1} style={{ color: C.slate, fontSize: 12, fontWeight: '700' }}>{question}</Text></Pressable>)}</ScrollView> : null}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingBottom: 5 }}>
          <TextInput accessibilityLabel="Message Merk" value={input} onChangeText={setInput} multiline maxLength={2000} placeholder="Ask Merk about home services..." placeholderTextColor={C.muted} returnKeyType="send" onSubmitEditing={() => void send(input)} style={{ flex: 1, maxHeight: 92, minHeight: 48, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 13, paddingTop: 12, paddingBottom: 10, backgroundColor: C.white, color: C.ink, fontSize: 14 }} />
          <Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!input.trim() || busy || (!customer && !visitorId)} onPress={() => void send(input)} style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', opacity: !input.trim() || busy ? 0.5 : 1 }}><Feather name="send" size={18} color={C.white} /></Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
