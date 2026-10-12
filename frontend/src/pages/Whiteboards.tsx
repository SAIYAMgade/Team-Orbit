/**
 * ORBITRA Live Board — Figma-Grade Real-Time Multiplayer Whiteboard
 * Features:
 * 1. Live bidirectional drawing: collaborators watch strokes in-flight as they are drawn.
 * 2. Real-time multiplayer cursors with user names and distinct colors.
 * 3. Live object movement & resizing visible to all peers concurrently.
 * 4. Multi-user selection indicators showing who is interacting with what.
 * 5. World coordinate transformations (independent pan & zoom support).
 * 6. Low-latency dual transport: Socket.io WebSocket + BroadcastChannel mesh.
 * 7. Multi-tenant company isolation and persistent storage.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { companyStore, type CompanyMember } from '../services/companyStore';
import { liveBoardStore, type LiveBoard, type BoardElement } from '../services/liveBoardStore';
import {
  PenTool,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
  Type,
  StickyNote,
  Eraser,
  MousePointer,
  Hand,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Share2,
  Check,
  Users,
  Radio,
  Plus,
  Search,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid
} from 'lucide-react';

type ToolType = 'select' | 'hand' | 'draw' | 'rectangle' | 'diamond' | 'circle' | 'arrow' | 'line' | 'text' | 'note' | 'eraser';

interface RemoteCursor {
  x: number;
  y: number;
  userName: string;
  userColor: string;
  lastActive: number;
}

interface RemoteSelection {
  elementId: string;
  userName: string;
  userColor: string;
}

const PARTICIPANT_PALETTE = [
  '#00d4ff', // Cyan
  '#ff00ff', // Magenta
  '#00ff88', // Neon Green
  '#f59e0b', // Amber
  '#a855f7', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
];

export default function Whiteboards() {
  const [boards, setBoards] = useState<LiveBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<LiveBoard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  useEffect(() => {
    loadBoards();

    const handleUpdate = () => {
      loadBoards();
    };
    window.addEventListener('orbitra_board_updated', handleUpdate);
    window.addEventListener('orbitra_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const params = new URLSearchParams(window.location.search);
    const bId = params.get('boardId');
    if (bId) {
      const found = liveBoardStore.getBoardById(bId);
      if (found) setSelectedBoard(found);
    }

    return () => {
      window.removeEventListener('orbitra_board_updated', handleUpdate);
      window.removeEventListener('orbitra_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadBoards = () => {
    const list = liveBoardStore.getBoards();
    setBoards(list);
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    const board = liveBoardStore.createBoard(newBoardName.trim(), newBoardDesc.trim());
    setNewBoardName('');
    setNewBoardDesc('');
    setShowCreateModal(false);
    loadBoards();
    setSelectedBoard(board);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (!confirm('Are you sure you want to delete this live board?')) return;
    liveBoardStore.deleteBoard(boardId);
    loadBoards();
    if (selectedBoard?.id === boardId) {
      setSelectedBoard(null);
    }
  };

  const activeCompany = companyStore.getActiveCompany();
  const filteredBoards = boards.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedBoard) {
    return (
      <LiveBoardCanvas
        board={selectedBoard}
        onClose={() => {
          setSelectedBoard(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('boardId');
          window.history.replaceState({}, '', url.pathname);
          loadBoards();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1b24] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg">
              <PenTool className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Live Board
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-medium">
                  FIGMA-LIKE MULTIPLAYER
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Real-time collaborative diagramming, architectures, and wireframes for <strong className="text-white">{activeCompany?.name || 'Workspace'}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-[#111218] border border-[#1f212d] text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Board</span>
          </button>
        </div>
      </div>

      {/* Boards Grid */}
      {filteredBoards.length === 0 ? (
        <div className="panel-card p-12 text-center rounded-2xl border border-dashed border-[#1f212d]">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <PenTool className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Live Boards Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
            Create your team's first collaborative whiteboard to sketch system architectures, flowcharts, or project wireframes.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs transition-all shadow-lg inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Board</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBoards.map((b) => (
            <div
              key={b.id}
              className="panel-card p-5 rounded-2xl border border-[#1f212d] hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-xl bg-[#0f1017]"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                      <PenTool className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {b.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        By {b.createdByName}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Multiplayer
                  </span>
                </div>

                <p className="text-xs text-[#8e92a4] line-clamp-2 mb-4 leading-relaxed">
                  {b.description || 'Interactive multi-user whiteboard canvas'}
                </p>

                <div className="p-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] flex items-center justify-between text-xs font-mono text-muted-foreground mb-4">
                  <span>Elements: <strong className="text-white">{b.elements.length}</strong></span>
                  <span>Updated: {new Date(b.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1a1b24]">
                <button
                  onClick={() => handleDeleteBoard(b.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 opacity-60 hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedBoard(b);
                    const url = new URL(window.location.href);
                    url.searchParams.set('boardId', b.id);
                    window.history.replaceState({}, '', url.pathname + url.search);
                  }}
                  className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg text-xs transition-all shadow inline-flex items-center gap-1.5"
                >
                  <span>Open Live Board</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111218] border border-[#1f212d] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PenTool className="h-5 w-5 text-cyan-400" />
                <span>Create Live Board</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Board Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Distributed Core Virtualization Architecture"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the system architecture or wireframes..."
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   LIVE BOARD CANVAS COMPONENT
   Figma-Style Multiplayer Collaborative Canvas
   ===================================================================== */
function LiveBoardCanvas({ board, onClose }: { board: LiveBoard; onClose: () => void }) {
  const { user } = useAuth();
  const socketCtx = useSocket();

  // Committed elements on board
  const [elements, setElements] = useState<BoardElement[]>(board.elements || []);
  const [boardTitle, setBoardTitle] = useState(board.name);

  // Active tools & properties
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [strokeColor, setStrokeColor] = useState('#00d4ff');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);

  // Local interaction states
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<BoardElement | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan and Zoom
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // MULTIPLAYER STATES:
  // In-flight streaming drawings from remote peers (Person A sees Person B drawing in real time!)
  const [remoteInFlightStreams, setRemoteInFlightStreams] = useState<Record<string, BoardElement>>({});
  // Remote live cursors
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});
  // Remote active selections
  const [remoteSelections, setRemoteSelections] = useState<Record<string, RemoteSelection>>({});
  // Online participants
  const [onlineCollaborators, setOnlineCollaborators] = useState<Array<{ name: string; color: string }>>([]);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'syncing'>('saved');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Undo / Redo history
  const [history, setHistory] = useState<BoardElement[][]>([board.elements || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const lastCursorEmitRef = useRef<number>(0);

  // Determine current user identity & assign distinct color
  const currentUserName = user?.full_name || localStorage.getItem('orbitra_auth_email')?.split('@')[0] || 'You';
  const userColorIndex = Math.abs(currentUserName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % PARTICIPANT_PALETTE.length;
  const currentUserColor = PARTICIPANT_PALETTE[userColorIndex];

  const currentUserData = {
    id: `user-${currentUserName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    name: currentUserName,
    color: currentUserColor
  };

  // Setup Dual-Layer Real-Time Multiplayer (BroadcastChannel + Socket.io)
  useEffect(() => {
    const channelName = `orbitra_liveboard_${board.id}`;
    const bc = new BroadcastChannel(channelName);
    broadcastChannelRef.current = bc;

    // Handle incoming messages from peers
    bc.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'SYNC_COMMITTED') {
        // Full board update committed
        setElements(data.elements);
        // Remove in-flight stream from this sender
        if (data.sender) {
          setRemoteInFlightStreams(prev => {
            const next = { ...prev };
            delete next[data.sender];
            return next;
          });
        }
        setSaveStatus('saved');
      } else if (data.type === 'STREAM_DRAW') {
        // Real-time live stroke/shape expanding as peer draws!
        if (data.sender && data.element) {
          setRemoteInFlightStreams(prev => ({
            ...prev,
            [data.sender]: data.element
          }));
        }
      } else if (data.type === 'STREAM_MOVE') {
        // Real-time live object moving
        if (data.elementId) {
          setElements(prev => prev.map(el =>
            el.id === data.elementId ? { ...el, x: data.x, y: data.y } : el
          ));
        }
      } else if (data.type === 'CURSOR_MOVE') {
        // Remote pointer motion
        if (data.sender && data.sender !== currentUserData.name) {
          setRemoteCursors(prev => ({
            ...prev,
            [data.sender]: {
              x: data.x,
              y: data.y,
              userName: data.userName,
              userColor: data.userColor || '#ff00ff',
              lastActive: Date.now()
            }
          }));
        }
      } else if (data.type === 'SELECT_ELEMENT') {
        if (data.sender) {
          setRemoteSelections(prev => {
            const next = { ...prev };
            if (data.elementId) {
              next[data.sender] = {
                elementId: data.elementId,
                userName: data.userName,
                userColor: data.userColor
              };
            } else {
              delete next[data.sender];
            }
            return next;
          });
        }
      } else if (data.type === 'USER_PRESENCE') {
        if (data.userName && data.userName !== currentUserData.name) {
          setOnlineCollaborators(prev => {
            const exists = prev.some(u => u.name === data.userName);
            if (!exists) return [...prev, { name: data.userName, color: data.userColor || '#ff00ff' }];
            return prev;
          });
        }
      }
    };

    // Announce local presence immediately
    bc.postMessage({
      type: 'USER_PRESENCE',
      userName: currentUserData.name,
      userColor: currentUserData.color
    });

    // Populate active collaborators list
    const company = companyStore.getActiveCompany();
    const demoPeers = (company?.members || [])
      .filter(m => m.name !== currentUserData.name && m.isOnline)
      .slice(0, 3)
      .map((m, idx) => ({
        name: m.name,
        color: PARTICIPANT_PALETTE[(idx + 1) % PARTICIPANT_PALETTE.length]
      }));

    setOnlineCollaborators([
      { name: currentUserData.name, color: currentUserData.color },
      ...demoPeers
    ]);

    // Connect to Socket.io room
    socketCtx.joinWhiteboard(board.id, currentUserData);

    const unsubJoined = socketCtx.onWhiteboardUserJoined((data) => {
      if (data.user?.name) {
        setOnlineCollaborators(prev => {
          const exists = prev.some(u => u.name === data.user.name);
          if (!exists) return [...prev, { name: data.user.name, color: data.user.color || '#ff00ff' }];
          return prev;
        });
      }
    });

    const unsubLeft = socketCtx.onWhiteboardUserLeft((data) => {
      if (data.user?.name) {
        setOnlineCollaborators(prev => prev.filter(u => u.name !== data.user.name));
        setRemoteCursors(prev => {
          const next = { ...prev };
          delete next[data.user.name];
          return next;
        });
      }
    });

    const unsubElements = socketCtx.onWhiteboardElementsUpdated((data) => {
      if (data.elements) {
        setElements(data.elements);
        setSaveStatus('saved');
      }
    });

    const unsubStreamDraw = socketCtx.onWhiteboardStreamDraw((data) => {
      if (data.sender && data.element) {
        setRemoteInFlightStreams(prev => ({
          ...prev,
          [data.sender]: data.element
        }));
      }
    });

    const unsubStreamMove = socketCtx.onWhiteboardStreamMove((data) => {
      if (data.elementId) {
        setElements(prev => prev.map(el =>
          el.id === data.elementId ? { ...el, x: data.x, y: data.y } : el
        ));
      }
    });

    const unsubSelection = socketCtx.onWhiteboardSelection((data) => {
      if (data.user?.name) {
        setRemoteSelections(prev => {
          const next = { ...prev };
          if (data.elementId) {
            next[data.user.name] = {
              elementId: data.elementId,
              userName: data.user.name,
              userColor: data.user.color
            };
          } else {
            delete next[data.user.name];
          }
          return next;
        });
      }
    });

    const unsubCursor = socketCtx.onWhiteboardCursorUpdated((data) => {
      if (data.pointer && data.user) {
        setRemoteCursors(prev => ({
          ...prev,
          [data.user.name]: {
            x: data.pointer.x,
            y: data.pointer.y,
            userName: data.user.name,
            userColor: data.user.color || '#ff00ff',
            lastActive: Date.now()
          }
        }));
      }
    });

    // Cleanup stale cursors after 5 seconds of inactivity
    const cursorPruneInterval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors(prev => {
        let changed = false;
        const next: Record<string, RemoteCursor> = {};
        Object.entries(prev).forEach(([key, cursor]) => {
          if (now - cursor.lastActive < 4000) {
            next[key] = cursor;
          } else {
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);

    return () => {
      clearInterval(cursorPruneInterval);
      bc.close();
      socketCtx.leaveWhiteboard(board.id);
      unsubJoined();
      unsubLeft();
      unsubElements();
      unsubStreamDraw();
      unsubStreamMove();
      unsubSelection();
      unsubCursor();
    };
  }, [board.id]);

  // Expose state hook for deterministic real-time collaboration verification & telemetry
  useEffect(() => {
    (window as any).__liveboard_debug = {
      boardId: board.id,
      currentUser: currentUserData,
      getElements: () => elements,
      getRemoteCursors: () => remoteCursors,
      getInFlightStreams: () => remoteInFlightStreams,
      getSelections: () => remoteSelections,
      getCollaborators: () => onlineCollaborators,
      setActiveTool: (tool: ToolType) => setActiveTool(tool),
      getActiveTool: () => activeTool,
    };
  }, [board.id, currentUserData, elements, remoteCursors, remoteInFlightStreams, remoteSelections, onlineCollaborators, activeTool]);

  // Broadcast committed elements to both channels
  const broadcastCommitted = useCallback((newElements: BoardElement[]) => {
    setSaveStatus('syncing');

    // 1. Local multi-tenant store
    liveBoardStore.saveElements(board.id, newElements);

    // 2. BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'SYNC_COMMITTED',
        sender: currentUserData.name,
        elements: newElements
      });
    }

    // 3. Socket.io
    socketCtx.syncWhiteboardElements(board.id, newElements);

    setTimeout(() => {
      setSaveStatus('saved');
    }, 200);
  }, [board.id, socketCtx, currentUserData.name]);

  const pushHistory = (newElements: BoardElement[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newElements);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    broadcastCommitted(newElements);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      const prevElements = history[nextIndex];
      setElements(prevElements);
      broadcastCommitted(prevElements);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextElements = history[nextIndex];
      setElements(nextElements);
      broadcastCommitted(nextElements);
    }
  };

  // Convert client viewport screen coordinates to Shared Canvas World Coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    return {
      x: (screenX - panOffset.x) / zoomLevel,
      y: (screenY - panOffset.y) / zoomLevel,
    };
  };

  // Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Draw static dark viewport background
    ctx.fillStyle = '#08090d';
    ctx.fillRect(0, 0, width, height);

    // 2. Apply Pan & Zoom transformation matrix for World Space
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw dot grid in world coordinates
    if (showGrid) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      const gridSize = 24;
      const startX = Math.floor((-panOffset.x / zoomLevel) / gridSize) * gridSize;
      const startY = Math.floor((-panOffset.y / zoomLevel) / gridSize) * gridSize;
      const endX = startX + (width / zoomLevel) + gridSize * 2;
      const endY = startY + (height / zoomLevel) + gridSize * 2;

      for (let x = startX; x < endX; x += gridSize) {
        for (let y = startY; y < endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Helper: Draw element
    const drawElement = (el: BoardElement, isSelected: boolean, remoteSelection?: RemoteSelection) => {
      ctx.save();
      ctx.strokeStyle = el.strokeColor;
      ctx.fillStyle = el.fillColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.globalAlpha = el.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'draw' && el.points && el.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'rectangle') {
        if (el.fillColor !== 'transparent') ctx.fillRect(el.x, el.y, el.width, el.height);
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      } else if (el.type === 'diamond') {
        const midX = el.x + el.width / 2;
        const midY = el.y + el.height / 2;
        ctx.beginPath();
        ctx.moveTo(midX, el.y);
        ctx.lineTo(el.x + el.width, midY);
        ctx.lineTo(midX, el.y + el.height);
        ctx.lineTo(el.x, midY);
        ctx.closePath();
        if (el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (el.type === 'circle') {
        ctx.beginPath();
        ctx.ellipse(
          el.x + el.width / 2,
          el.y + el.height / 2,
          Math.abs(el.width / 2),
          Math.abs(el.height / 2),
          0, 0, Math.PI * 2
        );
        if (el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (el.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.stroke();
      } else if (el.type === 'arrow') {
        const startX = el.x;
        const startY = el.y;
        const endX = el.x + el.width;
        const endY = el.y + el.height;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const angle = Math.atan2(endY - startY, endX - startX);
        const headLen = 12;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = el.strokeColor;
        ctx.fill();
      } else if (el.type === 'text') {
        ctx.font = '14px monospace';
        ctx.fillStyle = el.strokeColor;
        const lines = (el.text || 'Text').split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(line, el.x, el.y + 16 + i * 20);
        });
      } else if (el.type === 'note') {
        ctx.fillStyle = el.fillColor || 'rgba(245, 158, 11, 0.15)';
        ctx.strokeStyle = el.strokeColor || '#f59e0b';
        ctx.fillRect(el.x, el.y, el.width, el.height);
        ctx.strokeRect(el.x, el.y, el.width, el.height);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#ffffff';
        const lines = (el.text || 'Sticky Note').split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(line, el.x + 12, el.y + 24 + i * 18);
        });
      }

      // Local selection bounding box
      if (isSelected) {
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(el.x - 4, el.y - 4, el.width + 8, el.height + 8);
        ctx.setLineDash([]);
      }

      // Remote selection bounding box (Figma style)
      if (remoteSelection) {
        ctx.strokeStyle = remoteSelection.userColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(el.x - 4, el.y - 4, el.width + 8, el.height + 8);

        // Remote user tag above object
        ctx.font = '10px monospace';
        ctx.fillStyle = remoteSelection.userColor;
        ctx.fillRect(el.x - 4, el.y - 20, ctx.measureText(remoteSelection.userName).width + 8, 16);
        ctx.fillStyle = '#000000';
        ctx.fillText(remoteSelection.userName, el.x, el.y - 8);
      }

      ctx.restore();
    };

    // Draw confirmed elements
    elements.forEach(el => {
      const remoteUserSel = Object.values(remoteSelections).find(s => s.elementId === el.id);
      drawElement(el, el.id === selectedElementId, remoteUserSel);
    });

    // Draw local in-progress element
    if (currentElement) {
      drawElement(currentElement, false);
    }

    // DRAW REMOTE IN-PROGRESS DRAWING STREAMS (Person B watches Person A draw live in progress!)
    Object.entries(remoteInFlightStreams).forEach(([_sender, streamEl]) => {
      drawElement(streamEl, false);
    });

    // DRAW MULTIPLAYER REMOTE CURSORS IN WORLD SPACE (Figma style)
    Object.entries(remoteCursors).forEach(([_sender, cursor]) => {
      ctx.save();
      ctx.fillStyle = cursor.userColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;

      // Cursor pointer path
      ctx.beginPath();
      ctx.moveTo(cursor.x, cursor.y);
      ctx.lineTo(cursor.x + 13, cursor.y + 13);
      ctx.lineTo(cursor.x + 4, cursor.y + 15);
      ctx.lineTo(cursor.x, cursor.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Collaborator name tag badge
      ctx.font = '11px monospace';
      const textWidth = ctx.measureText(cursor.userName).width;
      ctx.fillStyle = cursor.userColor;
      ctx.beginPath();
      ctx.roundRect(cursor.x + 12, cursor.y + 6, textWidth + 10, 18, 4);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.fillText(cursor.userName, cursor.x + 17, cursor.y + 19);

      ctx.restore();
    });

    ctx.restore(); // Restore world transform
    ctx.restore(); // Restore DPR scale
  }, [elements, currentElement, selectedElementId, remoteInFlightStreams, remoteCursors, remoteSelections, showGrid, zoomLevel, panOffset]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer & Drag Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle click or Hand tool starts viewport pan
    if (e.button === 1 || activeTool === 'hand' || e.spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'select') {
      const found = [...elements].reverse().find(el => {
        return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
      });

      if (found) {
        setSelectedElementId(found.id);
        setIsDragging(true);
        setDragOffset({ x: x - found.x, y: y - found.y });

        // Broadcast selection state to peers
        broadcastChannelRef.current?.postMessage({
          type: 'SELECT_ELEMENT',
          sender: currentUserData.name,
          userName: currentUserData.name,
          userColor: currentUserData.color,
          elementId: found.id
        });
        socketCtx.sendWhiteboardSelection(board.id, found.id, currentUserData);
      } else {
        setSelectedElementId(null);
        broadcastChannelRef.current?.postMessage({
          type: 'SELECT_ELEMENT',
          sender: currentUserData.name,
          elementId: null
        });
        socketCtx.sendWhiteboardSelection(board.id, null, currentUserData);
      }
      return;
    }

    if (activeTool === 'eraser') {
      const remaining = elements.filter(el => {
        const hit = x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
        return !hit;
      });
      if (remaining.length !== elements.length) {
        setElements(remaining);
        pushHistory(remaining);
      }
      return;
    }

    if (activeTool === 'text' || activeTool === 'note') {
      const text = prompt(activeTool === 'note' ? 'Enter Sticky Note content:' : 'Enter text:');
      if (text) {
        const newEl: BoardElement = {
          id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: activeTool,
          x,
          y,
          width: activeTool === 'note' ? 200 : 150,
          height: activeTool === 'note' ? 120 : 40,
          strokeColor,
          fillColor: activeTool === 'note' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
          strokeWidth,
          opacity,
          text,
          createdBy: currentUserData.name,
          updatedAt: new Date().toISOString()
        };
        const updated = [...elements, newEl];
        setElements(updated);
        pushHistory(updated);
      }
      return;
    }

    // Start drawing
    setIsDrawing(true);

    const baseEl: BoardElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: activeTool,
      x,
      y,
      width: 0,
      height: 0,
      strokeColor,
      fillColor,
      strokeWidth,
      opacity,
      points: activeTool === 'draw' ? [{ x, y }] : undefined,
      createdBy: currentUserData.name,
      updatedAt: new Date().toISOString()
    };

    setCurrentElement(baseEl);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 1. Handle viewport pan
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const { x, y } = getCanvasCoords(e);

    // 2. Broadcast cursor position in world coordinates (throttled to 25ms for 60fps smoothness)
    const now = Date.now();
    if (now - lastCursorEmitRef.current > 25) {
      lastCursorEmitRef.current = now;

      // BroadcastChannel (local tabs/windows)
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'CURSOR_MOVE',
          sender: currentUserData.name,
          userName: currentUserData.name,
          userColor: currentUserData.color,
          x,
          y
        });
      }
      // Socket.io (network peers)
      socketCtx.sendWhiteboardCursor(board.id, { x, y }, currentUserData);
    }

    // 3. Handle live dragging/moving of an existing shape
    if (isDragging && selectedElementId) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;

      setElements(prev => prev.map(el => {
        if (el.id === selectedElementId) {
          return { ...el, x: newX, y: newY };
        }
        return el;
      }));

      // BROADCAST LIVE MOVE IN PROGRESS! (Collaborators watch shape move continuously!)
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'STREAM_MOVE',
          sender: currentUserData.name,
          elementId: selectedElementId,
          x: newX,
          y: newY
        });
      }
      socketCtx.streamWhiteboardMove(board.id, selectedElementId, newX, newY, currentUserData.name);
      return;
    }

    // 4. Handle live drawing in progress
    if (!isDrawing || !currentElement) return;

    let updatedEl: BoardElement;

    if (currentElement.type === 'draw') {
      const points = currentElement.points || [];
      const updatedPoints = [...points, { x, y }];
      const minX = Math.min(...updatedPoints.map(p => p.x));
      const maxX = Math.max(...updatedPoints.map(p => p.x));
      const minY = Math.min(...updatedPoints.map(p => p.y));
      const maxY = Math.max(...updatedPoints.map(p => p.y));

      updatedEl = {
        ...currentElement,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        points: updatedPoints
      };
    } else {
      updatedEl = {
        ...currentElement,
        width: x - currentElement.x,
        height: y - currentElement.y
      };
    }

    setCurrentElement(updatedEl);

    // BROADCAST LIVE DRAWING STROKE/SHAPE IN PROGRESS! (Collaborators watch stroke appear live!)
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'STREAM_DRAW',
        sender: currentUserData.name,
        element: updatedEl
      });
    }
    socketCtx.streamWhiteboardDraw(board.id, updatedEl, currentUserData.name);
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDragging && selectedElementId) {
      setIsDragging(false);
      pushHistory(elements);
      return;
    }

    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);

    const el = { ...currentElement };
    if (el.type !== 'draw' && el.type !== 'arrow' && el.type !== 'line') {
      if (el.width < 0) {
        el.x += el.width;
        el.width = Math.abs(el.width);
      }
      if (el.height < 0) {
        el.y += el.height;
        el.height = Math.abs(el.height);
      }
    }

    // Commit drawing if valid size
    if (Math.abs(el.width) > 3 || Math.abs(el.height) > 3 || (el.points && el.points.length > 2)) {
      const updated = [...elements, el];
      setElements(updated);
      setCurrentElement(null);
      pushHistory(updated);
    } else {
      setCurrentElement(null);
    }
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoomLevel(prev => Math.min(3, Math.max(0.3, prev * zoomFactor)));
    } else {
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Export board as PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${boardTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_multiplayer.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Copy share link
  const handleShareLink = () => {
    const url = `${window.location.origin}/live-board?boardId=${board.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Clear board
  const handleClearBoard = () => {
    if (!confirm('Clear all elements on this live board? This will update for all active collaborators.')) return;
    setElements([]);
    pushHistory([]);
    socketCtx.clearWhiteboard(board.id);
  };

  // Global Keyboard Shortcuts (Figma/Excalidraw style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === 'v') setActiveTool('select');
      else if (key === 'h') setActiveTool('hand');
      else if (key === 'p') setActiveTool('draw');
      else if (key === 'r') setActiveTool('rectangle');
      else if (key === 'd') setActiveTool('diamond');
      else if (key === 'c') setActiveTool('circle');
      else if (key === 'a') setActiveTool('arrow');
      else if (key === 'l') setActiveTool('line');
      else if (key === 't') setActiveTool('text');
      else if (key === 'n') setActiveTool('note');
      else if (key === 'e') setActiveTool('eraser');
      else if ((e.ctrlKey || e.metaKey) && key === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="fixed inset-0 z-50 bg-[#08090d] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* ── TOP HEADER TOOLBAR ────────────────────────────────────── */}
      <header className="h-14 bg-[#0f1017] border-b border-[#1f212d] px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            title="Back to Live Boards"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Board Title */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={boardTitle}
              onChange={(e) => {
                setBoardTitle(e.target.value);
                board.name = e.target.value;
                liveBoardStore.saveBoard(board);
              }}
              className="bg-transparent text-sm font-bold text-white hover:bg-white/5 px-2 py-1 rounded focus:bg-[#14151e] focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Real-time status badge */}
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multiplayer Live</span>
          </span>
        </div>

        {/* Center: Online Participants Avatar Stack (Figma Style) */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            Live Presence:
          </span>
          <div className="flex items-center -space-x-2">
            {onlineCollaborators.map((user, i) => (
              <div
                key={i}
                title={`${user.name} is currently live on this canvas`}
                style={{ backgroundColor: user.color }}
                className="w-7 h-7 rounded-full border-2 border-[#0f1017] text-black font-extrabold text-[10px] flex items-center justify-center uppercase shadow-md cursor-pointer hover:scale-110 transition-transform"
              >
                {user.name.substring(0, 2)}
              </div>
            ))}
          </div>
          <span className="text-xs font-mono text-zinc-400 ml-1">
            ({onlineCollaborators.length} active)
          </span>
        </div>

        {/* Right actions: Share, Undo/Redo, Export, Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-[#1f212d] mx-1" />

          {/* Share Link */}
          <button
            onClick={handleShareLink}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            title="Copy Board Link"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied Link!' : 'Share'}</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            title="Export PNG"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Clear Board */}
          <button
            onClick={handleClearBoard}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── FLOATING COMPACT TOOLS PANEL ───────────────────────────── */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 z-30 bg-[#111218]/90 backdrop-blur-xl border border-[#1f212d] p-1.5 rounded-2xl shadow-2xl flex items-center gap-1">
        {[
          { tool: 'select' as ToolType, icon: MousePointer, label: 'Select (V)' },
          { tool: 'hand' as ToolType, icon: Hand, label: 'Pan Hand (H / Space)' },
          { tool: 'draw' as ToolType, icon: PenTool, label: 'Draw (P)' },
          { tool: 'rectangle' as ToolType, icon: Square, label: 'Rectangle (R)' },
          { tool: 'diamond' as ToolType, icon: Diamond, label: 'Diamond (D)' },
          { tool: 'circle' as ToolType, icon: Circle, label: 'Circle (C)' },
          { tool: 'arrow' as ToolType, icon: ArrowRight, label: 'Arrow (A)' },
          { tool: 'line' as ToolType, icon: Minus, label: 'Line (L)' },
          { tool: 'text' as ToolType, icon: Type, label: 'Text (T)' },
          { tool: 'note' as ToolType, icon: StickyNote, label: 'Sticky Note (N)' },
          { tool: 'eraser' as ToolType, icon: Eraser, label: 'Eraser (E)' },
        ].map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            title={label}
            className={`p-2 rounded-xl transition-all ${
              activeTool === tool
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* ── FLOATING PROPERTIES PANEL ──────────────────────────────── */}
      <div className="absolute bottom-6 left-6 z-30 bg-[#111218]/90 backdrop-blur-xl border border-[#1f212d] p-3 rounded-2xl shadow-2xl space-y-3 text-xs">
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            Stroke Color
          </span>
          <div className="flex items-center gap-1.5">
            {['#ffffff', '#00d4ff', '#00ff88', '#ff00ff', '#f59e0b', '#ef4444'].map(color => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  strokeColor === color ? 'scale-125 border-white ring-2 ring-cyan-500/50' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            Stroke Width
          </span>
          <div className="flex items-center gap-1">
            {[2, 4, 8].map(w => (
              <button
                key={w}
                onClick={() => setStrokeWidth(w)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                  strokeWidth === w ? 'bg-cyan-500 text-black font-bold' : 'bg-white/5 text-muted-foreground hover:text-white'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FLOATING VIEWPORT ZOOM & GRID CONTROLS ─────────────────── */}
      <div className="absolute bottom-6 right-6 z-30 bg-[#111218]/90 backdrop-blur-xl border border-[#1f212d] p-1.5 rounded-xl shadow-2xl flex items-center gap-1 text-xs">
        <button
          onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.1))}
          className="p-1.5 rounded text-muted-foreground hover:text-white"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="px-2 font-mono text-[11px] text-white hover:text-cyan-400"
          title="Reset Zoom & Pan"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.1))}
          className="p-1.5 rounded text-muted-foreground hover:text-white"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-[#1f212d] mx-1" />
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 rounded transition-colors ${showGrid ? 'text-cyan-400 bg-cyan-500/10' : 'text-muted-foreground hover:text-white'}`}
          title="Toggle Grid"
        >
          <Grid className="h-4 w-4" />
        </button>
      </div>

      {/* ── SHARED MULTIPLAYER CANVAS ──────────────────────────────── */}
      <div className={`flex-1 relative w-full h-full overflow-hidden ${activeTool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
}
