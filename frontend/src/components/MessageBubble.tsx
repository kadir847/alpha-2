import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import type { Message } from '../types';

export function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  async function copy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <article className={isUser ? 'max-w-[85%] rounded-lg bg-accent text-ink px-4 py-3' : 'max-w-[92%] rounded-lg bg-panel border border-line px-4 py-3'}>
        <div className="prose prose-invert max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const text = String(children).replace(/\n$/, '');
                const language = className?.replace('language-', '');
                const html = language && hljs.getLanguage(language) ? hljs.highlight(text, { language }).value : hljs.highlightAuto(text).value;
                return className ? <code dangerouslySetInnerHTML={{ __html: html }} {...props} /> : <code {...props}>{children}</code>;
              },
            }}
          >
            {message.content || ' '}
          </ReactMarkdown>
        </div>
        {!isUser && (
          <button onClick={copy} className="mt-3 h-8 w-8 grid place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white" title="Copy">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </article>
    </div>
  );
}

