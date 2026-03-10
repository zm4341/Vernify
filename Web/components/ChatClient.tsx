'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export default function ChatClient() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto p-4 gap-4">
      <h1 className="text-xl font-semibold">AI 对话（流式）</h1>
      <div className="flex-1 overflow-y-auto rounded-lg border border-base-300 bg-base-200 p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-base-content/70 text-sm">发送一条消息开始对话，回复将以流式显示。</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat ${m.role === 'user' ? 'chat-end' : 'chat-start'}`}
          >
            <div className="chat-header opacity-70 text-sm">{m.role === 'user' ? '你' : 'AI'}</div>
            <div
              className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}
            >
              {m.parts?.map((part, i) =>
                part.type === 'text' ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="input input-bordered flex-1"
          disabled={status !== 'ready'}
        />
        <button type="submit" className="btn btn-primary" disabled={status !== 'ready'}>
          {status === 'streaming' ? '发送中…' : '发送'}
        </button>
      </form>
    </div>
  );
}
