/**
 * Projects Page
 * Project management with Kanban and List views,
 * "+ Create Project" modal allowing assignment of real company members,
 * and real-time synchronization in monochrome pitch black & white.
 */

import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { companyStore, type CompanyMember } from '../services/companyStore';
import {
  FolderPlus,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  Grid,
  List,
  Search,
  X,
  UserCheck
} from 'lucide-react';

export interface LocalProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedMembers: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  progress: number;
}

const PROJECTS_STORAGE_KEY = 'orbitra_shared_projects';

const DEFAULT_PROJECTS: LocalProject[] = [
  {
    id: 'proj-1',
    name: 'Multi-Tenant Perimeter Isolation',
    description: 'Cryptographic boundary validation and zero cross-tenant token leak verification.',
    status: 'active',
    priority: 'urgent',
    dueDate: '2026-10-24',
    progress: 75,
    assignedMembers: [
      { id: 'm-david', name: 'David K.', email: 'david@acetlabs.io', role: 'Admin' },
      { id: 'm-priya', name: 'Priya Sharma', email: 'priya@acetlabs.io', role: 'Developer' }
    ]
  },
  {
    id: 'proj-2',
    name: 'Low-Latency WebSocket Mesh',
    description: 'Decentralized state broadcasting for real-time multiplayer board and presence synchronization.',
    status: 'active',
    priority: 'high',
    dueDate: '2026-10-30',
    progress: 60,
    assignedMembers: [
      { id: 'm-priya', name: 'Priya Sharma', email: 'priya@acetlabs.io', role: 'Developer' }
    ]
  },
  {
    id: 'proj-3',
    name: 'Cluster Telemetry & Service Metrics',
    description: 'Prometheus metrics aggregation with p95 cluster response time tracking.',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-10-10',
    progress: 100,
    assignedMembers: [
      { id: 'm-julian', name: 'Julian Vance', email: 'julian@acetlabs.io', role: 'Developer' }
    ]
  }
];

export default function Projects() {
  const activeCompany = companyStore.getActiveCompany();

  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState<LocalProject['status']>('active');
  const [newProjectPriority, setNewProjectPriority] = useState<LocalProject['priority']>('medium');
  const [newProjectDueDate, setNewProjectDueDate] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  useEffect(() => {
    loadProjects();

    const handleUpdate = () => {
      loadProjects();
    };
    window.addEventListener('orbitra_projects_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('orbitra_projects_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadProjects = () => {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
      setProjects(DEFAULT_PROJECTS);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setProjects(parsed);
      } else {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
        setProjects(DEFAULT_PROJECTS);
      }
    } catch {
      setProjects(DEFAULT_PROJECTS);
    }
  };

  const handleToggleMember = (memberId: string) => {
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memberId]);
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const availableMembers = activeCompany?.members || [];
    const assigned = availableMembers
      .filter((m) => selectedMemberIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role
      }));

    const newProject: LocalProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || 'No description provided.',
      status: newProjectStatus,
      priority: newProjectPriority,
      dueDate: newProjectDueDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      progress: newProjectStatus === 'completed' ? 100 : newProjectStatus === 'planning' ? 15 : 45,
      assignedMembers: assigned.length > 0 ? assigned : (availableMembers[0] ? [{
        id: availableMembers[0].id,
        name: availableMembers[0].name,
        email: availableMembers[0].email,
        role: availableMembers[0].role
      }] : [])
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('orbitra_projects_updated'));

    // Reset Form
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectStatus('active');
    setNewProjectPriority('medium');
    setNewProjectDueDate('');
    setSelectedMemberIds([]);
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch =
      !searchQuery.trim() ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const columns: { key: LocalProject['status']; label: string }[] = [
    { key: 'planning', label: 'Planning' },
    { key: 'active', label: 'In Progress' },
    { key: 'on_hold', label: 'On Hold' },
    { key: 'completed', label: 'Completed' }
  ];

  const availableCompanyMembers = activeCompany?.members || [];

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
              <span>Projects</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-mono font-medium">
                {activeCompany?.name || 'Acet Labs'}
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
            Create engineering initiatives, assign company members, and track delivery progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Filter and View Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'active', 'planning', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#14151e] text-[#8e92a4] hover:text-white border border-[#1f212d]'
              }`}
            >
              {tab === 'all' ? 'All Projects' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#14151e] border border-[#1f212d] text-white placeholder:text-[#555869] text-xs focus:outline-none focus:border-white transition-all w-44 sm:w-56"
            />
            <Search className="h-3.5 w-3.5 text-[#8e92a4] absolute left-2.5 top-2" />
          </div>

          <div className="flex items-center gap-1 bg-[#14151e] border border-[#1f212d] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white/15 text-white' : 'text-[#8e92a4] hover:text-white'
              }`}
              title="Kanban Board"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white/15 text-white' : 'text-[#8e92a4] hover:text-white'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Projects View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colProjects = filteredProjects.filter((p) => p.status === col.key);
            return (
              <div key={col.key} className="flex flex-col rounded-2xl bg-[#0b0c12] border border-[#1a1b24] p-3.5 space-y-3 min-h-[400px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#1a1b24] px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white/70" />
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                    {colProjects.length}
                  </span>
                </div>

                {/* Column Project Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colProjects.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-xs font-mono">
                      No items in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    colProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl bg-[#0f1017] border border-[#1d1f2c] hover:border-white/20 transition-all space-y-3 shadow-md group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white group-hover:text-white/90">
                            {proj.name}
                          </h4>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                              proj.priority === 'urgent'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                : proj.priority === 'high'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                : 'bg-white/10 text-white border border-white/20'
                            }`}
                          >
                            {proj.priority}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#8e92a4] line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                            <span>Progress</span>
                            <span className="text-white font-medium">{proj.progress}%</span>
                          </div>
                          <div className="w-full bg-[#171822] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-white h-1.5 rounded-full transition-all"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Assigned Members */}
                        <div className="pt-2 border-t border-[#1a1b24] flex items-center justify-between">
                          <div className="flex items-center -space-x-1.5">
                            {proj.assignedMembers.map((m, idx) => (
                              <div
                                key={m.id || idx}
                                title={`${m.name} (${m.role})`}
                                className="w-6 h-6 rounded-full bg-white text-black border border-[#0f1017] flex items-center justify-center font-bold text-[9px]"
                              >
                                {m.name.substring(0, 2).toUpperCase()}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                            <Calendar className="h-3 w-3" />
                            <span>{proj.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel-card rounded-2xl border border-[#1f212d] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#14151e] text-[#8e92a4] font-mono uppercase text-[11px] border-b border-[#1f212d]">
                <tr>
                  <th className="px-4 py-3">Project Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assigned Members</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f212d]">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{proj.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">
                        {proj.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white font-mono text-[10px]">
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="uppercase text-[10px] font-mono font-semibold text-slate-300">
                        {proj.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {proj.assignedMembers.map((m, idx) => (
                          <span
                            key={m.id || idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">{proj.dueDate}</td>
                    <td className="px-4 py-3.5 font-mono text-white font-semibold">{proj.progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111218] border border-[#1f212d] rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1f212d]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center">
                  <FolderPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Project</h3>
                  <p className="text-xs text-muted-foreground">
                    Add project in {activeCompany?.name || 'Company'} and assign members
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 mt-5">
              {/* Project Title */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8e92a4] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Distributed Database Virtualization"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white placeholder:text-[#555869] text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8e92a4] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="What is the goal of this initiative?"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#14151e] border border-[#1f212d] text-white placeholder:text-[#555869] text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8e92a4] mb-1">
                    Status
                  </label>
                  <select
                    value={newProjectStatus}
                    onChange={(e) => setNewProjectStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14151e] border border-[#1f212d] text-white text-xs focus:outline-none focus:border-white"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#8e92a4] mb-1">
                    Priority
                  </label>
                  <select
                    value={newProjectPriority}
                    onChange={(e) => setNewProjectPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14151e] border border-[#1f212d] text-white text-xs focus:outline-none focus:border-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8e92a4] mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={newProjectDueDate}
                  onChange={(e) => setNewProjectDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#14151e] border border-[#1f212d] text-white text-xs focus:outline-none focus:border-white"
                />
              </div>

              {/* Add Members from Company */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8e92a4] mb-1.5 flex items-center justify-between">
                  <span>Assign Company Members</span>
                  <span className="text-[10px] text-white">
                    {selectedMemberIds.length} Selected
                  </span>
                </label>

                <div className="max-h-36 overflow-y-auto rounded-xl border border-[#1f212d] bg-[#14151e] p-2 space-y-1.5">
                  {availableCompanyMembers.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">
                      No members registered in company yet.
                    </p>
                  ) : (
                    availableCompanyMembers.map((member) => {
                      const isSelected = selectedMemberIds.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => handleToggleMember(member.id)}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-white/10 text-white border border-white/20'
                              : 'hover:bg-white/5 text-[#8e92a4]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white text-black font-bold text-[9px] flex items-center justify-center">
                              {member.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-white block leading-tight">{member.name}</span>
                              <span className="text-[10px] text-muted-foreground">{member.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                              {member.role}
                            </span>
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-white border-white text-black' : 'border-[#2d3142]'
                              }`}
                            >
                              {isSelected && <span className="text-[10px] font-bold">&#10003;</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#1f212d] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#8e92a4] hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-lg"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
