import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { deleteConversation, listConversations } from '../services/api';
import { useChatStore } from '../store/chatStore';

export function Sidebar() {
  const queryClient = useQueryClient();
  const activeId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setMessages = useChatStore((state) => state.setMessages);
  const resetChat = useChatStore((state) => state.resetChat);
  const { data = [], isLoading } = useQuery({ queryKey: ['conversations'], queryFn: listConversations });

  async function handleDelete(id: number) {
    await deleteConversation(id);
    if (activeId === id) resetChat();
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    toast.success('Conversation deleted');
  }

  return (
    <aside className="border-b md:border-b-0 md:border-r border-line bg-panel/90 backdrop-blur px-3 py-3 md:py-4 flex flex-col md:min-h-screen">
      <div className="flex items-center gap-2 px-2 mb-3 md:mb-4">
        <div className="h-9 w-9 rounded-lg bg-accent text-ink grid place-items-center font-black">A2</div>
        <div>
          <div className="font-semibold">Alpha 2</div>
          <div className="text-xs text-slate-400">AI assistant</div>
        </div>
      </div>
      <div className="flex gap-2 md:block">
        <button
          onClick={resetChat}
          className="h-11 shrink-0 rounded-md bg-white px-4 md:w-full text-ink font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition"
        >
          <Plus size={18} />
          New chat
        </button>
      </div>
      <div className="mt-3 md:mt-4 flex md:flex-1 gap-2 md:block overflow-x-auto md:overflow-y-auto scrollbar-thin md:space-y-1">
        {isLoading && <div className="h-10 rounded-md bg-white/5 animate-pulse" />}
        {data.map((conversation) => (
          <div
            key={conversation.id}
            className={clsx(
              'group flex min-w-44 md:min-w-0 items-center rounded-md text-sm',
              activeId === conversation.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10',
            )}
          >
            <button
              className="min-w-0 flex-1 text-left px-3 py-2 truncate"
              onClick={() => {
                setActiveConversationId(conversation.id);
                setMessages([]);
              }}
            >
              {conversation.title}
            </button>
            <button
              title="Delete"
              onClick={() => handleDelete(conversation.id)}
              className="opacity-0 group-hover:opacity-100 h-8 w-8 grid place-items-center rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-200"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
