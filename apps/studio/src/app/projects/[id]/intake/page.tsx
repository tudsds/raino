'use client';

import { useState, use, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
 id: string;
 role: 'user' | 'assistant';
 content: string;
 timestamp: string;
 attachments?: string[];
 thinking?: string;
}

function ThinkingBlock({ thinking }: { thinking: string }) {
 const [isExpanded, setIsExpanded] = useState(false);

 return (
 <div className="border border-white/[0.12] rounded-lg overflow-hidden my-2 bg-white/[0.02]">
 <button
 onClick={() => setIsExpanded(!isExpanded)}
 className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.04] transition-all duration-300"
 >
 <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
 <span className="font-medium">Thinking</span>
 <span className="text-xs text-[#64748B] ml-auto">{thinking.length} chars</span>
 </button>
 {isExpanded && (
 <div className="px-3 py-2 border-t border-white/[0.06] text-xs text-[#64748B] font-[family-name:var(--font-body)] whitespace-pre-wrap leading-relaxed">
 {thinking}
 </div>
 )}
 </div>
 );
}

const markdownComponents = {
 h1: ({ children }: { children?: ReactNode }) => <h1 className="text-xl font-bold text-[#E2E8F0] mt-4 mb-2">{children}</h1>,
 h2: ({ children }: { children?: ReactNode }) => <h2 className="text-lg font-bold text-[#E2E8F0] mt-3 mb-2">{children}</h2>,
 h3: ({ children }: { children?: ReactNode }) => <h3 className="text-md font-semibold text-[#E2E8F0] mt-2 mb-1">{children}</h3>,
 p: ({ children }: { children?: ReactNode }) => <p className="text-[#E2E8F0] leading-relaxed mb-2">{children}</p>,
 ul: ({ children }: { children?: ReactNode }) => <ul className="list-disc list-inside mb-2 text-[#E2E8F0]">{children}</ul>,
 ol: ({ children }: { children?: ReactNode }) => <ol className="list-decimal list-inside mb-2 text-[#E2E8F0]">{children}</ol>,
 li: ({ children }: { children?: ReactNode }) => <li className="ml-4 mb-1">{children}</li>,
 code: ({ children, className }: { children?: ReactNode; className?: string }) => {
 const isInline = !className;
 return isInline
 ? <code className="bg-white/[0.08] px-1.5 py-0.5 rounded text-[#6191D3] text-sm font-[family-name:var(--font-body)]">{children}</code>
 : <code className="block bg-white/[0.06] p-3 rounded-lg my-2 text-sm font-[family-name:var(--font-body)] overflow-x-auto">{children}</code>;
 },
 pre: ({ children }: { children?: ReactNode }) => <pre className="bg-white/[0.06] p-4 rounded-lg my-2 overflow-x-auto">{children}</pre>,
 blockquote: ({ children }: { children?: ReactNode }) => <blockquote className="border-l-2 border-[#1565C0] pl-4 my-2 text-[#94A3B8] italic">{children}</blockquote>,
 table: ({ children }: { children?: ReactNode }) => <table className="w-full border-collapse my-2">{children}</table>,
 th: ({ children }: { children?: ReactNode }) => <th className="border border-white/[0.12] px-3 py-2 bg-white/[0.06] text-left text-[#94A3B8]">{children}</th>,
 td: ({ children }: { children?: ReactNode }) => <td className="border border-white/[0.12] px-3 py-2">{children}</td>,
 a: ({ children, href }: { children?: ReactNode; href?: string }) => <a href={href} className="text-[#6191D3] underline hover:text-[#1565C0]">{children}</a>,
 strong: ({ children }: { children?: ReactNode }) => <strong className="font-bold text-[#E2E8F0]">{children}</strong>,
};

export default function IntakePage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = use(params);
 const [messages, setMessages] = useState<Message[]>([]);
 const [input, setInput] = useState('');
 const [isReady] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

 useEffect(() => {
 async function loadMessages() {
 try {
 const res = await fetch(`/api/projects/${id}`);
 if (res.ok) {
 const data = await res.json();
 if (data.intakeMessages) {
 setMessages(
 data.intakeMessages.map(
 (m: { id: string; role: string; content: string; createdAt: string; thinking?: string }) => ({
 id: m.id,
 role: m.role as 'user' | 'assistant',
 content: m.content,
 timestamp: new Date(m.createdAt).toISOString(),
 thinking: m.thinking,
 }),
 ),
 );
 }
 }
 } catch {
 // no prior messages — start fresh
 }
 }
 loadMessages();
 }, [id]);

  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;
    if (loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      attachments: selectedFiles.map((f) => f.name),
    };

    const assistantPlaceholder: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInput('');
    setSelectedFiles([]);
    setLoading(true);
    setStreaming(true);

    try {
      const res = await fetch(`/api/projects/${id}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let finalMessageId = assistantPlaceholder.id;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;

          let event: Record<string, unknown>;
          try {
            event = JSON.parse(payload);
          } catch {
            continue;
          }

          if (event.type === 'content' && typeof event.content === 'string') {
            accumulated += event.content;
            const currentContent = accumulated;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantPlaceholder.id ? { ...m, content: currentContent } : m,
              ),
            );
          } else if (event.type === 'done' && event.message && typeof event.message === 'object') {
            const msg = event.message as {
              id: string;
              role: string;
              content: string;
              timestamp: string;
            };
            finalMessageId = msg.id;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantPlaceholder.id
                  ? {
                      ...m,
                      id: msg.id,
                      content: msg.content,
                      timestamp: new Date(msg.timestamp).toISOString(),
                    }
                  : m,
              ),
            );
          } else if (event.type === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantPlaceholder.id
                  ? {
                      ...m,
                      content:
                        typeof event.error === 'string'
                          ? event.error
                          : 'An error occurred during streaming.',
                    }
                  : m,
              ),
            );
          }
        }
      }

      if (!accumulated) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === finalMessageId
              ? { ...m, content: 'No response received. Please try again.' }
              : m,
          ),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantPlaceholder.id
            ? { ...m, content: 'Failed to get a response. Please try again.' }
            : m,
        ),
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files) {
 setSelectedFiles(Array.from(e.target.files));
 }
 };

 const removeFile = (index: number) => {
 setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
 };

 const tabs = [
 { id: 'overview', label: 'Overview', href: `/projects/${id}` },
 { id: 'intake', label: 'Intake', href: `/projects/${id}/intake`, active: true },
 { id: 'spec', label: 'Spec', href: `/projects/${id}/spec` },
 { id: 'architecture', label: 'Architecture', href: `/projects/${id}/architecture` },
 { id: 'bom', label: 'BOM', href: `/projects/${id}/bom` },
 { id: 'previews', label: 'Previews', href: `/projects/${id}/previews` },
 { id: 'downloads', label: 'Downloads', href: `/projects/${id}/downloads` },
 { id: 'quote', label: 'Quote', href: `/projects/${id}/quote` },
 ];

 return (
 <div className="min-h-screen bg-[#0A1929] flex flex-col">
 <header className="border-b border-white/[0.12] bg-[#0A1929]/80 backdrop-blur-xl sticky top-0 z-50">
 <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <Link
 href={`/projects/${id}`}
 className="text-[#94A3B8] hover:text-[#E2E8F0] transition-colors duration-300"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M10 19l-7-7m0 0l7-7m-7 7h18"
 />
 </svg>
 </Link>
 <div>
 <h1 className="text-xl font-bold text-[#E2E8F0]">Project Intake</h1>
 <p className="text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">{id}</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 {isReady ? (
 <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(76,175,80,0.15)] border border-[rgba(76,175,80,0.3)] rounded-lg">
 <div className="w-2 h-2 bg-[#4CAF50] rounded-full" />
 <span className="text-xs text-[#4CAF50] font-medium">Ready for Spec</span>
 </div>
 ) : (
 <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(21,101,192,0.15)] border border-[rgba(21,101,192,0.3)] rounded-lg">
 <div className="w-2 h-2 bg-[#1565C0] animate-pulse rounded-full" />
 <span className="text-xs text-[#1565C0] font-medium">Gathering Info</span>
 </div>
 )}
 </div>
 </div>
 </header>

 <div className="border-b border-white/[0.12] bg-[#132F4C]/50">
 <div className="max-w-7xl mx-auto px-6">
 <nav className="flex gap-1">
 {tabs.map((tab) => (
 <Link
 key={tab.id}
 href={tab.href}
 className={`px-4 py-3 text-sm font-medium transition-all duration-300 border-b-2 ${
 tab.active
 ? 'text-[#1565C0] border-[#1565C0]'
 : 'text-[#94A3B8] border-transparent hover:text-[#E2E8F0] hover:border-white/[0.12]'
 }`}
 >
 {tab.label}
 </Link>
 ))}
 </nav>
 </div>
 </div>

 <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col">
 <div className="flex-1 space-y-4 overflow-y-auto mb-4">
 {messages.map((message) => (
 <div
 key={message.id}
 className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
 >
 <div
 className={`max-w-[80%] px-4 py-3 rounded-xl ${
 message.role === 'user'
 ? 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.20)] border-l-2 border-l-[#1565C0] text-[#E2E8F0]'
 : 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.20)] text-[#E2E8F0]'
 }`}
 >
  {message.role === 'assistant' && message.thinking && (
  <ThinkingBlock thinking={message.thinking} />
  )}
  {message.role === 'assistant' && streaming && !message.content ? (
  <p className="text-sm text-[#64748B] animate-pulse">●●●</p>
  ) : message.role === 'assistant' ? (
 <div className="prose prose-invert max-w-none">
 <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
 {message.content}
 </ReactMarkdown>
 </div>
 ) : (
 <p className="text-sm">{message.content}</p>
 )}
 {message.attachments && message.attachments.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-2">
 {message.attachments.map((attachment, idx) => (
 <div
 key={idx}
 className="flex items-center gap-1.5 px-2 py-1 bg-[rgba(21,101,192,0.1)] border border-[rgba(21,101,192,0.3)] rounded-lg"
 >
 <svg
 className="w-3 h-3 text-[#1565C0]"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
 />
 </svg>
 <span className="text-xs text-[#6191D3]">{attachment}</span>
 </div>
 ))}
 </div>
 )}
 <span className="text-xs text-[#64748B] mt-1 block">
 {new Date(message.timestamp).toLocaleTimeString()}
 </span>
 </div>
 </div>
 ))}
 </div>

 <div className="border-t border-white/[0.12] pt-4">
 {selectedFiles.length > 0 && (
 <div className="flex flex-wrap gap-2 mb-3">
 {selectedFiles.map((file, index) => (
 <div
 key={index}
 className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(21,101,192,0.1)] border border-[rgba(21,101,192,0.3)] rounded-lg"
 >
 <svg
 className="w-4 h-4 text-[#1565C0]"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
 />
 </svg>
 <span className="text-sm text-[#6191D3]">{file.name}</span>
 <button
 onClick={() => removeFile(index)}
 className="ml-1 text-[#64748B] hover:text-[#EF5350] transition-colors duration-300"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 </svg>
 </button>
 </div>
 ))}
 </div>
 )}
 <div className="flex gap-3">
 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
 placeholder="Describe your hardware idea..."
 className="flex-1 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0] placeholder-[#64748B] px-4 py-3 rounded-xl focus:outline-none focus:border-[#1565C0] transition-colors duration-300"
 />
 <label className="cursor-pointer px-4 py-3 border border-white/[0.12] bg-white/[0.06] text-[#94A3B8] hover:border-[#1565C0] hover:text-[#1565C0] transition-all duration-300 rounded-xl flex items-center justify-center">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
 />
 </svg>
 <input type="file" multiple className="hidden" onChange={handleFileSelect} />
 </label>
 <button
 onClick={handleSend}
 disabled={(!input.trim() && selectedFiles.length === 0) || loading}
 className="px-6 py-3 bg-[#1565C0] text-white font-medium hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg"
 >
  {streaming ? 'Streaming...' : loading ? 'Sending...' : 'Send'}
 </button>
 </div>
 <p className="text-xs text-[#64748B] mt-2">
 Press Enter to send. Be specific about your requirements, constraints, and target
 application.
 </p>
 </div>
 </div>
 </div>
 );
}
