/**
 * Chat Page
 * Real-time messaging with channels, PDF / attachment support,
 * and synchronized storage events for cross-browser testing.
 */

import { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { chatService } from '../services/chat';
import { companyStore } from '../services/companyStore';
import type { Channel, Message } from '../types';
import {
  Send,
  Paperclip,
  FileText,
  MessageSquare,
  Users,
  Search,
  Sparkles,
  Download
} from 'lucide-react';

interface LocalChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  content: string;
  createdAt: string;
  file?: {
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  };
}

const CHAT_STORAGE_KEY = 'orbitra_shared_chat_messages';

export default function Chat() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const activeCompany = companyStore.getActiveCompany();

  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string; dataUrl?: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages from shared storage
  useEffect(() => {
    loadChatMessages();

    const handleUpdate = () => {
      loadChatMessages();
    };
    window.addEventListener('orbitra_chat_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('orbitra_chat_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadChatMessages = () => {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      const defaultMsgs: LocalChatMessage[] = [
        {
          id: 'msg-1',
          senderName: activeCompany?.adminName || 'Admin',
          senderEmail: activeCompany?.adminEmail || 'admin@company.com',
          content: 'Welcome to the team workspace! Feel free to share project notes and PDFs here.',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(defaultMsgs));
      setMessages(defaultMsgs);
      return;
    }
    try {
      setMessages(JSON.parse(raw));
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !selectedFile) return;

    const senderProfile = localStorage.getItem('orbitra_current_user');
    let senderName = 'Team Member';
    let senderEmail = 'member@company.com';

    if (senderProfile) {
      try {
        const p = JSON.parse(senderProfile);
        senderName = p.name || senderName;
        senderEmail = p.email || senderEmail;
      } catch {}
    } else if (user) {
      senderName = user.full_name || senderName;
      senderEmail = user.email || senderEmail;
    } else if (activeCompany) {
      senderName = activeCompany.adminName;
      senderEmail = activeCompany.adminEmail;
    }

    const newMsg: LocalChatMessage = {
      id: `msg-${Date.now()}`,
      senderName,
      senderEmail,
      content: messageText.trim(),
      createdAt: new Date().toISOString(),
      file: selectedFile || undefined
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('orbitra_chat_updated'));

    // Synchronize attached PDF/document with Documents page
    if (selectedFile) {
      const rawDocs = localStorage.getItem('orbitra_shared_documents');
      let docsList: any[] = [];
      try {
        if (rawDocs) docsList = JSON.parse(rawDocs);
      } catch {}
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.type || 'application/pdf',
        uploader: senderName,
        uploadedAt: new Date().toISOString(),
        dataUrl: selectedFile.dataUrl,
        source: 'Shared in Chat'
      };
      docsList.unshift(newDoc);
      localStorage.setItem('orbitra_shared_documents', JSON.stringify(docsList));
      window.dispatchEvent(new Event('orbitra_documents_updated'));
    }

    setMessageText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-2xl bg-[#0f1017] border border-[#1d1f2c] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1d1f2c] bg-[#0c0d12] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>#general</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Synchronized
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {activeCompany?.name || 'Company Workspace'} &bull; Real-time chat & PDF exchange
            </p>
          </div>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-3 group">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
              {msg.senderName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-white">{msg.senderName}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{msg.senderEmail}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.content && (
                <p className="text-xs text-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              )}

              {/* PDF or File attachment preview */}
              {msg.file && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#141622] border border-white/20 flex items-center justify-between max-w-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{msg.file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{msg.file.size}</p>
                    </div>
                  </div>

                  {msg.file.dataUrl && (
                    <a
                      href={msg.file.dataUrl}
                      download={msg.file.name}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors ml-2"
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with PDF Upload Button */}
      <div className="p-3 sm:p-4 border-t border-[#1d1f2c] bg-[#0c0d12]">
        {selectedFile && (
          <div className="mb-2 p-2 rounded-lg bg-white/5 border border-white/20 flex items-center justify-between text-xs max-w-sm">
            <div className="flex items-center gap-2 truncate">
              <FileText className="h-3.5 w-3.5 text-white flex-shrink-0" />
              <span className="truncate text-white font-medium">{selectedFile.name}</span>
              <span className="text-[10px] text-muted-foreground">({selectedFile.size})</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-xs text-rose-400 hover:text-rose-300 ml-2"
            >
              Remove
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* File input (accepts PDFs and documents) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach PDF or document"
            className="p-2.5 rounded-xl bg-[#141622] hover:bg-[#1a1d2e] border border-[#1d1f2c] text-muted-foreground hover:text-white transition-colors flex-shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write a message or attach a PDF..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#141622] border border-[#1d1f2c] text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white/30 transition-all"
          />

          <button
            type="submit"
            disabled={!messageText.trim() && !selectedFile}
            className="p-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold transition-all shadow-md flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
