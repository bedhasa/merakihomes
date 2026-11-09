import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, Phone, CheckCheck } from 'lucide-react';

export const ChatModal: React.FC = () => {
  const { activeChatModal, closeChatModal, language, t } = useApp();
  const booking = activeChatModal;

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'provider',
      text: language === 'am'
        ? `ሰላም ሜሮን! እኔ ${booking?.amharicProviderName || 'ባለሙያ'} ነኝ። ለቀጠሮው በመዘጋጀት ላይ ነኝ።`
        : `Salam Meron! I am ${booking?.providerName || 'your specialist'}. I have confirmed your appointment and am gathering my equipment.`,
      time: '10:02 AM'
    },
    {
      id: 2,
      sender: 'provider',
      text: language === 'am'
        ? `አሁን ቦሌ አትላስ አቅራቢያ ነኝ፣ በ10 ደቂቃ ውስጥ እደርሳለሁ።`
        : `I am currently near Bole Atlas and should arrive at your residence within 10-15 minutes.`,
      time: '10:14 AM'
    }
  ]);

  if (!booking) return null;

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    // Simulated quick friendly provider reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'provider',
          text: language === 'am' ? 'እሺ አመሰግናለሁ! ደርሻለሁ።' : 'Ameseginalehu! I noted your instructions and am on my way.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  const quickReplies = [
    language === 'am' ? 'የግቢው ጥበቃ ያውቃል' : 'Security guard is informed',
    language === 'am' ? 'እባክዎ አረንጓዴውን ደወል ይጫኑ' : 'Please ring the green doorbell',
    language === 'am' ? 'አመሰግናለሁ!' : 'Ameseginalehu / Thank you!'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-3xl h-[85vh] flex flex-col overflow-hidden shadow-level-3 border border-[#D9E0E7]">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-[#D9E0E7] bg-[#102A43] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={booking.providerAvatar}
                alt={booking.providerName}
                className="w-10 h-10 rounded-xl object-cover border border-[#D4A853]"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            </div>

            <div>
              <h3 className="text-xs font-bold text-white">
                {language === 'am' ? booking.amharicProviderName : booking.providerName}
              </h3>
              <p className="text-[10px] text-slate-300">
                {booking.id} • Active in {booking.neighborhood}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${booking.providerPhone}`}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <Phone size={14} />
            </a>
            <button
              onClick={closeChatModal}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3 bg-[#F7F8FA]">
          <div className="text-center">
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              Today • Bole Sub-City
            </span>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-[#102A43] text-white rounded-tr-none'
                      : 'bg-white text-[#191c1e] border border-[#D9E0E7] rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[#74777E] px-1">
                  <span>{m.time}</span>
                  {isMe && <CheckCheck size={11} className="text-[#0072CE]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-1.5 bg-white border-t border-[#D9E0E7]/60 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              onClick={() => {
                setInputMessage(qr);
              }}
              className="text-[10px] whitespace-nowrap bg-[#F7F8FA] hover:bg-[#EDEEF0] border border-[#D9E0E7] text-[#334155] px-2.5 py-1 rounded-full"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-[#D9E0E7] bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={language === 'am' ? 'መልዕክት ይፃፉ...' : 'Type message to specialist...'}
            className="flex-1 h-10 px-3.5 rounded-2xl bg-[#F7F8FA] border border-[#D9E0E7] text-xs focus:outline-none focus:border-[#D4A853]"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-2xl bg-[#D4A853] text-[#102A43] flex items-center justify-center font-bold hover:bg-[#e0b764] transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
