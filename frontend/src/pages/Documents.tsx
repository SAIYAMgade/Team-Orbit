/**
 * Documents Page
 * Document and file management synchronized with Chat PDF attachments
 * Pure monochrome black & white aesthetic.
 */

import { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { companyStore } from '../services/companyStore';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Grid,
  List,
  Sparkles,
  Paperclip,
  CheckCircle,
  File
} from 'lucide-react';

export interface StoredDocument {
  id: string;
  name: string;
  size: string;
  sizeBytes?: number;
  mimeType: string;
  uploader: string;
  uploadedAt: string;
  dataUrl?: string;
  source?: string;
}

const DOCUMENTS_STORAGE_KEY = 'orbitra_shared_documents';

const DEFAULT_DOCUMENTS: StoredDocument[] = [
  {
    id: 'doc-arch-1',
    name: 'Platform-Architecture-Spec-v2.pdf',
    size: '1.4 MB',
    sizeBytes: 1468006,
    mimeType: 'application/pdf',
    uploader: 'David K.',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    source: 'Shared in Chat'
  },
  {
    id: 'doc-sec-2',
    name: 'Multi-Tenant-Perimeter-Security.pdf',
    size: '840 KB',
    sizeBytes: 860160,
    mimeType: 'application/pdf',
    uploader: 'Priya Sharma',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    source: 'Shared in Chat'
  },
  {
    id: 'doc-tele-3',
    name: 'Cluster-Telemetry-Protocol-RFC.pdf',
    size: '2.1 MB',
    sizeBytes: 2202009,
    mimeType: 'application/pdf',
    uploader: 'Julian Vance',
    uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    source: 'Workspace Repository'
  }
];

export default function Documents() {
  const { currentWorkspace } = useWorkspace();
  const activeCompany = companyStore.getActiveCompany();

  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();

    const handleUpdate = () => {
      loadDocuments();
    };
    window.addEventListener('orbitra_documents_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('orbitra_documents_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadDocuments = () => {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_DOCUMENTS));
      setDocuments(DEFAULT_DOCUMENTS);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setDocuments(parsed);
      } else {
        localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_DOCUMENTS));
        setDocuments(DEFAULT_DOCUMENTS);
      }
    } catch {
      setDocuments(DEFAULT_DOCUMENTS);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const senderProfile = localStorage.getItem('orbitra_current_user');
    let uploaderName = activeCompany?.adminName || 'Team Member';
    if (senderProfile) {
      try {
        const p = JSON.parse(senderProfile);
        uploaderName = p.name || uploaderName;
      } catch {}
    }

    const currentList = [...documents];
    const newItems: StoredDocument[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const item: StoredDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          sizeBytes: file.size,
          mimeType: file.type || 'application/pdf',
          uploader: uploaderName,
          uploadedAt: new Date().toISOString(),
          dataUrl: reader.result as string,
          source: 'Direct Upload'
        };
        newItems.push(item);
        if (newItems.length === files.length) {
          const combined = [...newItems, ...currentList];
          setDocuments(combined);
          localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(combined));
          window.dispatchEvent(new Event('orbitra_documents_updated'));
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownload = (doc: StoredDocument) => {
    if (doc.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Generate fallback text blob for demo items
    const blob = new Blob([`Document Content for ${doc.name}\nUploaded by: ${doc.uploader}\nWorkspace: ${activeCompany?.name || 'Company'}`], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDelete = (docId: string) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    const updated = documents.filter((d) => d.id !== docId);
    setDocuments(updated);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('orbitra_documents_updated'));
  };

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return doc.name.toLowerCase().includes(q) || doc.uploader.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1b24] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs shadow-sm">
              <span className="w-2.5 h-2.5 rounded-sm bg-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Documents</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-mono font-medium">
                {activeCompany?.name || 'Acet Labs'}
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
            Synchronized workspace files, architecture RFCs, and documents shared in chat
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.png,.jpg"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name or sender..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#14151e] border border-[#1f212d] text-white placeholder:text-[#555869] text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white/30 transition-all"
          />
          <Search className="h-3.5 w-3.5 text-[#8e92a4] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-white/10 text-white'
                : 'text-[#8e92a4] hover:text-white hover:bg-white/5'
            }`}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-white/10 text-white'
                : 'text-[#8e92a4] hover:text-white hover:bg-white/5'
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Documents Content */}
      {filteredDocs.length === 0 ? (
        <div className="panel-card p-12 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No documents found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? 'No documents matched your search filter.'
              : 'Upload a document or share a PDF in the #general chat to view it here.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="panel-card p-4 rounded-xl border border-[#1f212d] bg-[#0f1017] hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                    {doc.source || 'Shared in Chat'}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-white truncate group-hover:text-white/90">
                  {doc.name}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  By <strong className="text-slate-300">{doc.uploader}</strong> &bull; {doc.size}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {new Date(doc.uploadedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#1d1f2c] flex items-center justify-between">
                <button
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center gap-1.5 text-xs text-white hover:text-white/80 transition-colors font-medium"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 rounded text-muted-foreground hover:text-rose-400 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel-card rounded-2xl border border-[#1f212d] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#14151e] text-[#8e92a4] font-mono uppercase text-[11px] border-b border-[#1f212d]">
                <tr>
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3">Uploader</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f212d]">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 font-medium text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-white flex-shrink-0" />
                      <span className="truncate max-w-xs">{doc.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{doc.uploader}</td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">{doc.source || 'Shared in Chat'}</td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">{doc.size}</td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors inline-flex items-center gap-1"
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors inline-flex items-center gap-1"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
