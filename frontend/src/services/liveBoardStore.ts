/**
 * Live Board Data & Persistence Service
 * Multi-tenant board storage with company workspace isolation
 */

import { companyStore, type Company } from './companyStore';

export interface BoardElement {
  id: string;
  type: 'draw' | 'rectangle' | 'diamond' | 'circle' | 'arrow' | 'line' | 'text' | 'note';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  text?: string;
  points?: { x: number; y: number }[];
  createdBy: string;
  createdByEmail?: string;
  updatedAt: string;
}

export interface LiveBoard {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  elements: BoardElement[];
  thumbnail?: string;
}

const STORAGE_PREFIX = 'orbitra_live_boards_';

// Initial pre-loaded board for Acet Labs demo workspace
const defaultAcetLabsBoard: LiveBoard = {
  id: 'board-acet-arch',
  companyId: 'comp-demo-acet',
  name: 'Distributed Cloud Architecture & Mesh',
  description: 'Multi-region Kubernetes mesh, low-latency WebSocket routing and gRPC specs',
  createdBy: 'david@acetlabs.io',
  createdByName: 'David K.',
  createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  elements: [
    {
      id: 'el-1',
      type: 'rectangle',
      x: 100,
      y: 120,
      width: 220,
      height: 120,
      strokeColor: '#00d4ff',
      fillColor: 'rgba(0, 212, 255, 0.08)',
      strokeWidth: 2,
      opacity: 1,
      createdBy: 'David K.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'el-2',
      type: 'text',
      x: 120,
      y: 165,
      width: 180,
      height: 40,
      strokeColor: '#ffffff',
      fillColor: 'transparent',
      strokeWidth: 2,
      opacity: 1,
      text: 'Edge API Gateway\n(Envoy Proxy)',
      createdBy: 'David K.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'el-3',
      type: 'arrow',
      x: 320,
      y: 180,
      width: 120,
      height: 0,
      points: [{ x: 0, y: 0 }, { x: 120, y: 0 }],
      strokeColor: '#00ff88',
      fillColor: 'transparent',
      strokeWidth: 3,
      opacity: 1,
      createdBy: 'Priya Sharma',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'el-4',
      type: 'diamond',
      x: 440,
      y: 120,
      width: 180,
      height: 120,
      strokeColor: '#ff00ff',
      fillColor: 'rgba(255, 0, 255, 0.08)',
      strokeWidth: 2,
      opacity: 1,
      createdBy: 'Priya Sharma',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'el-5',
      type: 'text',
      x: 470,
      y: 170,
      width: 130,
      height: 30,
      strokeColor: '#ffffff',
      fillColor: 'transparent',
      strokeWidth: 2,
      opacity: 1,
      text: 'Auth & RBAC\n(JWT / Tenant)',
      createdBy: 'Priya Sharma',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'el-6',
      type: 'note',
      x: 680,
      y: 110,
      width: 220,
      height: 140,
      strokeColor: '#f59e0b',
      fillColor: 'rgba(245, 158, 11, 0.15)',
      strokeWidth: 1,
      opacity: 1,
      text: '⚡ SLA Target:\nSub-25ms WebSocket latency across all active tenant pods.',
      createdBy: 'Julian Vance',
      updatedAt: new Date().toISOString()
    }
  ]
};

export const liveBoardStore = {
  getBoards(companyId?: string): LiveBoard[] {
    const activeCompany = companyStore.getActiveCompany();
    const cId = companyId || activeCompany?.id || 'comp-demo-acet';
    const key = STORAGE_PREFIX + cId;

    const raw = localStorage.getItem(key);
    if (!raw) {
      if (cId === 'comp-demo-acet' || activeCompany?.name === 'Acet Labs') {
        const initial = [defaultAcetLabsBoard];
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  getBoardById(boardId: string, companyId?: string): LiveBoard | undefined {
    const boards = this.getBoards(companyId);
    return boards.find(b => b.id === boardId);
  },

  saveBoard(board: LiveBoard): void {
    const boards = this.getBoards(board.companyId);
    const index = boards.findIndex(b => b.id === board.id);

    board.updatedAt = new Date().toISOString();

    if (index >= 0) {
      boards[index] = board;
    } else {
      boards.unshift(board);
    }

    const key = STORAGE_PREFIX + board.companyId;
    localStorage.setItem(key, JSON.stringify(boards));

    // Broadcast across browser windows & tabs
    window.dispatchEvent(new CustomEvent('orbitra_board_updated', { detail: { boardId: board.id } }));
  },

  createBoard(name: string, description?: string): LiveBoard {
    const activeCompany = companyStore.getActiveCompany();
    const companyId = activeCompany?.id || 'comp-demo-acet';
    const currentUser = JSON.parse(localStorage.getItem('orbitra_current_user') || '{}');

    const newBoard: LiveBoard = {
      id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      name: name.trim() || 'Untitled Live Board',
      description: description?.trim() || 'Real-time collaborative live canvas',
      createdBy: currentUser.email || 'admin@company.com',
      createdByName: currentUser.name || 'Team Contributor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: []
    };

    this.saveBoard(newBoard);
    return newBoard;
  },

  deleteBoard(boardId: string, companyId?: string): boolean {
    const activeCompany = companyStore.getActiveCompany();
    const cId = companyId || activeCompany?.id || 'comp-demo-acet';
    const key = STORAGE_PREFIX + cId;

    const boards = this.getBoards(cId);
    const filtered = boards.filter(b => b.id !== boardId);
    localStorage.setItem(key, JSON.stringify(filtered));

    window.dispatchEvent(new CustomEvent('orbitra_board_updated', { detail: { boardId } }));
    return true;
  },

  saveElements(boardId: string, elements: BoardElement[], companyId?: string): LiveBoard | null {
    const board = this.getBoardById(boardId, companyId);
    if (!board) return null;

    board.elements = elements;
    this.saveBoard(board);
    return board;
  }
};
