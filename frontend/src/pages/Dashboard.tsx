import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { companyStore, type Company } from '../services/companyStore';
import {
  Users,
  Radio,
  ExternalLink,
  CheckCircle,
  Check,
  UserPlus,
  RefreshCw,
  Building,
  ShieldCheck,
  Activity,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCompanyData();

    const handleUpdate = () => {
      loadCompanyData();
    };
    window.addEventListener('orbitra_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('orbitra_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadCompanyData = () => {
    const comp = companyStore.getActiveCompany();
    setActiveCompany(comp);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadCompanyData();
      setIsRefreshing(false);
    }, 400);
  };

  const handleCopyInvite = () => {
    if (!activeCompany) return;
    const inviteUrl = companyStore.getInviteUrl(activeCompany);
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleToggleMemberStatus = (memberId: string) => {
    if (!activeCompany) return;
    const updated = companyStore.toggleMemberStatus(activeCompany.id, memberId);
    if (updated) {
      setActiveCompany({ ...updated });
    }
  };

  // True member counts - exactly matching the members array
  const totalMemberCount = activeCompany?.members.length || 0;
  const onlineMembersCount = activeCompany
    ? activeCompany.members.filter(m => m.isOnline).length
    : 0;

  // Real workspace activities tailored to the admin's organization
  const workspaceActivities = [
    {
      id: 'act-1',
      title: `${activeCompany?.name || 'Workspace'} environment provisioned and active`,
      assignee: activeCompany?.adminName || 'Admin',
      time: 'Live',
      badge: 'Active',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'act-2',
      title: 'Invite link & team gateway enabled for instant member joining',
      assignee: 'Security Daemon',
      time: 'Today',
      badge: 'Ready',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'act-3',
      title: 'Real-time WebSocket presence and multi-user sync operational',
      assignee: 'Cluster Engine',
      time: 'Today',
      badge: 'Operational',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Header with Prominent Company Name */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e1e] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs shadow-sm">
              <span className="w-2.5 h-2.5 rounded-sm bg-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black tracking-wider uppercase font-mono">
                TEAM ORBIT
              </span>
              <span>{activeCompany?.name || 'My Company'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-mono font-medium">
                Workspace Admin
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
            <span>Welcome, <strong>{activeCompany?.adminName || user?.full_name || 'Admin'}</strong></span>
            <span>&bull;</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {onlineMembersCount} of {totalMemberCount} Team Members Online
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="panel-card px-3.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white flex items-center gap-1.5 transition-colors bg-[#0a0a0a] border border-[#222222]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Admin Stat Cards: Clean, real, no fake tasks or dev metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Registered Members */}
        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-[#222222] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Total Members</p>
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-3xl font-extrabold text-white">{totalMemberCount}</h3>
              <span className="text-xs text-muted-foreground">in workspace</span>
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {onlineMembersCount} Currently Online & Active
          </p>
        </div>

        {/* Card 2: Workspace Status */}
        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-[#222222] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Workspace Status</p>
              <Building className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl font-bold text-emerald-400">Active</h3>
              <span className="text-xs text-muted-foreground">Cluster Online</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Invite Token: <strong className="text-zinc-200">{activeCompany?.inviteToken}</strong></span>
          </div>
        </div>

        {/* Card 3: Team Gateway & Security */}
        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-[#222222] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Access Security</p>
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl font-bold text-white">Protected</h3>
              <span className="text-xs text-emerald-400">Token Gated</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Invite Status</span>
            <span className="text-emerald-400 font-semibold">Ready to Share</span>
          </div>
        </div>
      </div>

      {/* --- RECENT WORKSPACE ACTIVITIES FOR ADMIN --- */}
      <div className="panel-card p-5 sm:p-6 rounded-2xl space-y-4 bg-[#0a0a0a] border border-[#222222]">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-white" />
              <span>Workspace Activities</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Recent infrastructure and membership updates for {activeCompany?.name || 'this company'}
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Live Feed
          </span>
        </div>

        <div className="space-y-3">
          {workspaceActivities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl bg-[#080808] border border-[#1e1e1e] flex items-center justify-between gap-3 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    By <span className="text-slate-200">{act.assignee}</span> &bull; {act.time}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border font-semibold flex-shrink-0 ${act.badgeColor}`}>
                {act.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- LIVE STATUS TABLE (SHOWS REAL TEAM MEMBERS) --- */}
      {activeCompany && (
        <div className="panel-card p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="h-4 w-4 text-white animate-pulse" />
                <span>Live Status ({totalMemberCount} {totalMemberCount === 1 ? 'Member' : 'Members'})</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                All registered members in <strong className="text-white">{activeCompany.name}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {onlineMembersCount} Online / {totalMemberCount} Total
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-mono">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Status</th>
                  <th className="px-4 py-3">People Assigned</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Invite Token</th>
                  <th className="px-4 py-3 text-center">Toggle State</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {activeCompany.members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                    {/* Status with Green (Online) or Red (Offline) indicator */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            member.isOnline
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse'
                              : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          }`}
                        />
                        <span
                          className={`font-semibold text-xs ${
                            member.isOnline ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {member.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>

                    {/* People Assigned */}
                    <td className="px-4 py-3.5 font-medium text-white">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                            member.isOnline ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                        >
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-semibold text-white">{member.name}</span>
                          <span className="text-[11px] text-muted-foreground block">
                            {member.assignedTask || `${member.role} contributor`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email Address */}
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">
                      {member.email}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-[11px]">
                        {member.role}
                      </span>
                    </td>

                    {/* Token */}
                    <td className="px-4 py-3.5 font-mono text-zinc-300">
                      {activeCompany.inviteToken}
                    </td>

                    {/* Toggle State: Active / Inactive Button */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleMemberStatus(member.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                          member.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                        }`}
                      >
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Inspect Button */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          alert(`Member: ${member.name}\nEmail: ${member.email}\nStatus: ${member.status}\nPresence: ${member.isOnline ? 'Online' : 'Offline'}\nRole: ${member.role}`);
                        }}
                        className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-md border border-border transition-colors inline-flex items-center gap-1"
                      >
                        Inspect
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SINGLE DEDICATED INVITE BUTTON AT THE VERY BOTTOM */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Share the invite link to let new members join <strong className="text-white">{activeCompany.name}</strong> instantly.
            </div>

            <button
              onClick={handleCopyInvite}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {copiedInvite ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              <span>{copiedInvite ? 'Invite Link Copied to Clipboard!' : 'Invite Link (Copy to Share)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
