'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AgentPage() {
  const [messages, setMessages] = useState<{ role: string; content: string; mode?: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, conversation_history: [], trip_data: {} })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, mode: data.mode }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-800">Cayuga Compass</Link>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/explore" className="text-gray-600 hover:text-gray-900">Explore</Link>
              <Link href="/plan" className="text-gray-600 hover:text-gray-900">Plan your trip</Link>
              <Link href="/methodology" className="text-gray-600 hover:text-gray-900">Methodology</Link>
              <Link href="/plan" className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                Plan a visit →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Travel Assistant</h1>

        <div className="bg-white rounded-lg border border-gray-200 flex flex-col" style={{ height: '500px' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="mb-4">Ask me about sustainable travel to Ithaca.</p>
                <p className="text-sm">Try: "Plan a sustainable trip" or "How can I reduce my carbon footprint?"</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  m.role === 'user'
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  {m.mode === 'deterministic' && (
                    <p className="text-xs text-gray-400 mt-1">Deterministic assistant</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-500">Thinking...</div>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about sustainable travel..."
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
