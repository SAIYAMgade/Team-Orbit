import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { companyStore, type Company } from '@/services/companyStore';
import {
  Activity,
  ShieldCheck,
  Users,
  RefreshCw,
  Radio,
  ExternalLink,
  Calendar,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Building
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

export default function PlatformDeveloperDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadCompanies();

    const handleUpdate = () => {
      loadCompanies();
    };
    window.addEventListener('orbitra_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('orbitra_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadCompanies = () => {
    const list = companyStore.getCompanies();
    setCompanies(list);
    const active = companyStore.getActiveCompany();
    // Default to active company or Acet Labs
    const defaultComp = active || list.find(c => c.name === 'Acet Labs') || list[0] || null;
    setSelectedCompany(prev => {
      if (!prev) return defaultComp;
      const found = list.find(c => c.id === prev.id);
      return found || defaultComp;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadCompanies();
      setIsRefreshing(false);
      setLastRefreshed(new Date());
    }, 400);
  };

  const handleToggleStatus = (companyId: string, memberId: string) => {
    const updated = companyStore.toggleMemberStatus(companyId, memberId);
    if (updated) {
      loadCompanies();
    }
  };

  const handleToggleOnline = (companyId: string, memberId: string) => {
    const updated = companyStore.toggleMemberPresence(companyId, memberId);
    if (updated) {
      loadCompanies();
    }
  };

  // Metrics for selected workspace (not combined across unrelated companies)
  const currentMembers = selectedCompany?.members || [];
  const totalMembers = currentMembers.length;
  const totalOnlineMembers = currentMembers.filter(m => m.isOnline).length;

  // Task Status Ratio data for Developer Analytics
  const statusDistribution = [
    { name: 'To Do', value: 4, color: '#00d4ff' },
    { name: 'In Progress', value: 6, color: '#ff00ff' },
    { name: 'Done', value: 8, color: '#00ff88' },
    { name: 'Urgent', value: 2, color: '#ff3366' },
  ];

  // Weekly Task Activity data
  const previewActivityData = [
    { day: 'Mon', count: 18, tasks: 18, fill: '#00d4ff' },
    { day: 'Tue', count: 24, tasks: 24, fill: '#ff00ff' },
    { day: 'Wed', count: 32, tasks: 32, fill: '#00ff88' },
    { day: 'Thu', count: 28, tasks: 28, fill: '#ff3366' },
    { day: 'Fri', count: 35, tasks: 35, fill: '#f59e0b' },
    { day: 'Sat', count: 12, tasks: 12, fill: '#a78bfa' },
    { day: 'Sun', count: 15, tasks: 15, fill: '#34d399' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 selection:bg-white/20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Developer & Analytics
              </h1>
              <Badge variant="outline" className="font-mono text-xs bg-white/10 text-white border-white/20">
                REAL-TIME CLUSTER
              </Badge>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Cluster observability, active engineers registry, task distribution, and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Workspace Selector — distinct, never combined */}
            {companies.length > 1 && (
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl text-xs">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={selectedCompany?.id || ''}
                  onChange={(e) => {
                    const found = companies.find(c => c.id === e.target.value);
                    if (found) {
                      setSelectedCompany(found);
                      companyStore.setActiveCompany(found.id);
                    }
                  }}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0a0a0a] text-white">
                      {c.name} ({c.members.length} members)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-card hover:bg-muted border border-border text-foreground px-3.5 py-2 text-xs rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
              Refresh
            </button>
            <a
              href="/dashboard"
              className="bg-white hover:bg-zinc-200 text-black px-4 py-2 text-xs rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              Workspace Dashboard
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* 4 Metric Cards for Developer Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Members in this Workspace */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{totalMembers}</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {totalOnlineMembers} Currently Online in {selectedCompany?.name || 'Workspace'}
              </p>
            </CardContent>
          </Card>

          {/* 2. System Latency */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                API Core Latency
              </CardTitle>
              <Activity className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white font-mono">24 ms</div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> p95 cluster response time
              </p>
            </CardContent>
          </Card>

          {/* 3. Multi-Tenant Isolation */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Tenant Isolation
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">100%</div>
              <p className="text-xs text-muted-foreground mt-1">Zero token crossover</p>
            </CardContent>
          </Card>

          {/* 4. Schedule & Meetings */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Schedule & Meetings
              </CardTitle>
              <Calendar className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">4 Active</div>
              <p className="text-xs text-muted-foreground mt-1">
                Next: Architecture Sync at 4:30 PM
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Charts: Task Status Ratio + Weekly Task Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Task Status Ratio */}
          <Card className="border-border/80 bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white">Task Status Ratio</h3>
                <p className="text-xs text-muted-foreground">Workflow throughput by state</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                20 Total Tasks
              </span>
            </div>
            <div className="h-44 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#222222', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border text-xs">
              {statusDistribution.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center p-1.5 rounded-lg bg-muted/20">
                  <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-white font-mono mt-0.5">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Chart 2: Weekly Task Activity */}
          <Card className="border-border/80 bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white">Weekly Task Activity</h3>
                <p className="text-xs text-muted-foreground">Tasks closed per day across team</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +164 Tasks Closed
              </span>
            </div>
            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={previewActivityData}>
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#222222', borderRadius: '8px', fontSize: '11px', padding: '6px 10px' }}
                    formatter={(value: any) => [`${value} tasks`, 'Completed']}
                    labelStyle={{ color: '#8e92a4', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {previewActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground font-mono">
              <span>Peak Day: Friday (35 tasks)</span>
              <span className="text-emerald-400 font-semibold">+18.4% WoW Velocity</span>
            </div>
          </Card>
        </div>

        {/* --- LIVE STATUS TABLE: Only members of this workspace (Not combined) --- */}
        <Card className="border-border/80 bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-white">
                  <Radio className="h-5 w-5 text-white animate-pulse" />
                  Live Status ({totalMembers} {totalMembers === 1 ? 'Member' : 'Members'})
                </CardTitle>
                <CardDescription>
                  Active working members in <strong className="text-white">{selectedCompany?.name || 'Workspace'}</strong>. Real-time status, assigned tasks, and invite token.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {totalOnlineMembers} Online / {totalMembers} Total
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                  {currentMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* 1. Status Indicator */}
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

                      {/* 2. People Assigned */}
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

                      {/* 3. Email Address */}
                      <td className="px-4 py-3.5 font-mono text-muted-foreground">
                        {member.email}
                      </td>

                      {/* 4. Role */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-mono text-[11px]">
                          {member.role}
                        </span>
                      </td>

                      {/* 5. Invite Token */}
                      <td className="px-4 py-3.5 font-mono text-zinc-300">
                        {selectedCompany?.inviteToken}
                      </td>

                      {/* 6. Active / Inactive Toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => selectedCompany && handleToggleStatus(selectedCompany.id, member.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                            member.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                          }`}
                        >
                          {member.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* 7. Inspect */}
                      <td className="px-4 py-3.5 text-right font-sans">
                        <button
                          onClick={() => {
                            alert(`Member: ${member.name}\nEmail: ${member.email}\nRole: ${member.role}\nStatus: ${member.status}\nPresence: ${member.isOnline ? 'Online' : 'Offline'}\nTask: ${member.assignedTask || 'None'}`);
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
          </CardContent>
        </Card>

        {/* --- Active Members Cards in Selected Workspace (ALL members displayed) --- */}
        {selectedCompany && (
          <Card className="border-border/80 bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-white">
                    <UserCheck className="h-5 w-5 text-emerald-400" />
                    Active Members in {selectedCompany.name} ({currentMembers.length})
                  </CardTitle>
                  <CardDescription>
                    All registered engineering team members with real-time presence indicators
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Invite Token: {selectedCompany.inviteToken}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar with status indicator */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                            member.isOnline ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                        >
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                            member.isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                          <span
                            className={`text-[9px] font-mono font-bold ${
                              member.isOnline ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            ({member.isOnline ? 'Online' : 'Offline'})
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">{member.email}</p>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{member.assignedTask}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleOnline(selectedCompany.id, member.id)}
                      title="Toggle Online/Offline presence"
                      className="p-1 rounded text-muted-foreground hover:text-white transition-colors flex-shrink-0"
                    >
                      {member.isOnline ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-rose-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
