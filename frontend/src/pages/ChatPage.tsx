import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, SendHorizonal } from 'lucide-react';
import toast from 'react-hot-toast';
import { MessageBubble } from '../components/MessageBubble';
import { getConversation, streamChat } from '../services/api';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types';

export function ChatPage() {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const streaming = useChatStore((state) => state.streaming);
  const setStreaming = useChatStore((state) => state.setStreaming);

  const { data } = useQuery({
    queryKey: ['conversation', activeConversationId],
    queryFn: () => getConversation(activeConversationId!),
    enabled: Boolean(activeConversationId) && messages.length === 0,
  });

  useEffect(() => {
    if (data) setMessages(data.messages);
  }, [data, setMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text = input) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setInput('');
    setStreaming(true);
    const assistantId = `assistant-${Date.now()}`;
    addMessage({ id: `user-${Date.now()}`, role: 'user', content: trimmed, timestamp: new Date().toISOString() });
    addMessage({ id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() });
    let content = '';

    try {
      await streamChat(trimmed, activeConversationId, {
        onMeta: (meta) => {
          setActiveConversationId(meta.conversation_id);
        },
        onToken: (token) => {
          content += token;
          updateMessage(assistantId, content);
        },
        onDone: (done) => {
          updateMessage(assistantId, done.assistant_message.content);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
      });
    } catch (error) {
      updateMessage(assistantId, 'Something went wrong while streaming the response.');
      toast.error('Chat request failed');
    } finally {
      setStreaming(false);
    }
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((message) => message.role === 'user');
    if (lastUser) send(lastUser.content);
  }

  return (
    <main className="flex-1 min-h-0 flex flex-col">
      <section className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 && (
            <div className="py-24 text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-accent text-ink grid place-items-center font-black">A2</div>
              <h1 className="mt-5 text-3xl font-semibold">Alpha 2</h1>
              <p className="mt-2 text-slate-400">Ask, explore, draft, debug, and build.</p>
            </div>
          )}
          {messages.map((message: Message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {streaming && <div className="text-sm text-slate-400 animate-pulse">Thinking...</div>}
          <div ref={endRef} />
        </div>
      </section>
      <form
        className="border-t border-line bg-ink/85 backdrop-blur px-4 py-4"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <div className="mx-auto max-w-4xl flex gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Message Alpha 2"
            className="min-h-12 max-h-40 flex-1 resize-none rounded-md border border-line bg-panel px-4 py-3 outline-none focus:border-accent"
          />
          <button disabled={streaming || !input.trim()} className="h-12 w-12 grid place-items-center rounded-md bg-accent text-ink disabled:opacity-50" title="Send">
            <SendHorizonal size={20} />
          </button>
          <button type="button" onClick={regenerate} disabled={streaming || messages.length === 0} className="h-12 w-12 grid place-items-center rounded-md border border-line hover:bg-white/10 disabled:opacity-50" title="Regenerate">
            <RefreshCw size={19} />
          </button>
        </div>
      </form>
    </main>
  );
}

