import CyberMatrixHero from '@/components/ui/cyber-matrix-hero';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Kanban,
  FileText,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
  Video,
  PenTool,
  Clock,
  ShieldCheck,
  Layers,
  Code2
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col font-sans selection:bg-white/20">
      {/* 1. Cyber Matrix Hero */}
      <CyberMatrixHero />

      {/* 2. Platform Capabilities (Real Feature Modules) */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-black">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs border-white/20 text-white">
            Engineered For Modern Work
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Everything your teams need in one place
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Say goodbye to fragmented tools. <strong className="text-white font-bold">TEAM ORBIT</strong> unifies the entire collaboration lifecycle into high-performance, isolated workspaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Projects & Tasks */}
          <div className="panel-card p-6 rounded-2xl flex flex-col justify-between group bg-[#0a0a0a] border border-[#222222]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                <Kanban className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-neutral-300 transition-colors">
                Projects & Task Boards
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Agile sprints, custom kanban columns, priority tracking, and subtasks tailored to your team's velocity.
              </p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 mt-6 pt-4 border-t border-[#222222]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Multiple board views & sprint tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Real-time card reordering & assignments
              </li>
            </ul>
          </div>

          {/* Card 2: Channels */}
          <div className="panel-card p-6 rounded-2xl flex flex-col justify-between group bg-[#0a0a0a] border border-[#222222]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Real-Time Channels
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Persistent channels, instant 1:1 direct messages, rich attachments, and unread notifications via WebSockets.
              </p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 mt-6 pt-4 border-t border-[#222222]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Direct & channel conversations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live typing indicators & presence
              </li>
            </ul>
          </div>

          {/* Card 3: Collaborative Docs */}
          <div className="panel-card p-6 rounded-2xl flex flex-col justify-between group bg-[#0a0a0a] border border-[#222222]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-neutral-300 transition-colors">
                Documents & Knowledge
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Rich-text editor powered by TipTap with real-time multi-cursor collaboration, revision history, and tags.
              </p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 mt-6 pt-4 border-t border-[#222222]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Version control & export to PDF/Markdown
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Workspace knowledge base organization
              </li>
            </ul>
          </div>

          {/* Card 4: Whiteboards */}
          <div className="panel-card p-6 rounded-2xl flex flex-col justify-between group bg-[#0a0a0a] border border-[#222222]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <PenTool className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Interactive Whiteboards
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Infinite canvas with vector shapes, sticky notes, freehand drawing, and multiplayer cursor tracking.
              </p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 mt-6 pt-4 border-t border-[#222222]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Multiplayer drawing on Fabric.js canvas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Visual brainstorming & flowcharts
              </li>
            </ul>
          </div>

          {/* Card 5: Conferencing */}
          <div className="panel-card p-6 rounded-2xl flex flex-col justify-between group bg-[#0a0a0a] border border-[#222222]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-neutral-300 transition-colors">
                Meetings & Video
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Integrated WebRTC rooms with peer-to-peer audio/video streaming, screen sharing, and scheduled calendar events.
              </p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 mt-6 pt-4 border-t border-[#222222]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Instant conference rooms without external apps
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Calendar agenda sync & automatic reminders
              </li>
            </ul>
          </div>

          {/* Card 6: Time Tracking */}
          <div className="panel-card p-6 rounded-2xl flex flex-col justify-between group bg-[#0a0a0a] border border-[#222222]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-neutral-300 transition-colors">
                Time Tracking & Deadlines
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Precision stopwatch timers linked to projects, detailed timesheets, and exportable project utilization reports.
              </p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 mt-6 pt-4 border-t border-[#222222]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Billable hour audits & task association
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Deadline forecasting & team workload
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Security & Company Isolation Section */}
      <section id="security" className="py-20 bg-[#050505] border-y border-[#1e1e1e] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-4 text-xs font-semibold uppercase tracking-wider text-white border-white/20">
              Enterprise Governance
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
              Guaranteed Company Isolation & Role-Based Boundaries
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              <strong className="text-white font-bold">TEAM ORBIT</strong> enforces strict architectural boundaries at both the database and API layer. Every workspace is completely isolated with its own encrypted data domain.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Company Admin Isolation</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Company Admins control users, roles, billing, and teams strictly within their company boundary.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Zero Cross-Tenant Leakage</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    FastAPI middleware validates JWT tokens against tenant IDs on every query and WebSocket handshake.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Platform Developer Observability</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Developers monitor system health, latency, and database stats across all companies without compromising privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Architecture Card */}
          <div className="panel-card rounded-2xl p-6 sm:p-8 shadow-xl bg-[#0a0a0a] border border-[#222222]">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">TEAM ORBIT Kernel Security</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Protection
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-between">
                <span className="text-muted-foreground">Tenant Perimeter</span>
                <span className="text-white font-semibold">Strict Encrypted Partitioning</span>
              </div>
              <div className="p-3 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-between">
                <span className="text-muted-foreground">Authentication Standard</span>
                <span className="text-white font-semibold">HS256 JWT + Refresh Tokens</span>
              </div>
              <div className="p-3 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-between">
                <span className="text-muted-foreground">Session Invalidation</span>
                <span className="text-white font-semibold">Redis Distributed Cache</span>
              </div>
              <div className="p-3 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-between">
                <span className="text-muted-foreground">Object Storage</span>
                <span className="text-white font-semibold">MinIO S3-Compatible Buckets</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#222222] flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Explore Platform Telemetry</span>
              <a
                href="/developer"
                className="text-xs font-semibold text-white hover:text-neutral-300 inline-flex items-center gap-1 transition-colors"
              >
                Developer Dashboard
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Mode Selection (Developer vs Admin) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center w-full bg-black">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
          Ready to launch your workspace?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto">
          Choose your role to enter the <strong className="text-white font-bold">TEAM ORBIT</strong> unified operating system.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/developer"
            className="w-full sm:w-auto bg-[#111111] hover:bg-[#1a1a1a] border border-[#2e2e2e] text-white font-semibold px-8 py-3.5 text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Code2 className="h-4 w-4 text-emerald-400" />
            Enter Developer Mode
          </a>
          <a
            href="/login"
            className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black font-extrabold px-8 py-3.5 text-sm rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Enter Admin Mode
          </a>
        </div>
      </section>

      {/* 5. Professional Footer */}
      <footer className="mt-auto border-t border-[#1e1e1e] py-12 px-4 sm:px-6 lg:px-8 bg-black text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white text-black font-extrabold text-xs flex items-center justify-center">
              TO
            </div>
            <span className="font-bold text-white text-sm">TEAM ORBIT</span>
            <span className="text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="/login" className="hover:text-white transition-colors">
              Admin Mode
            </a>
            <a href="/developer" className="hover:text-white transition-colors">
              Developer Mode
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Company Isolation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
