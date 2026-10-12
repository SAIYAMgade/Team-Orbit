import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Play,
  Pause,
  ArrowRight,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  Layers,
  Code2,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Kanban,
  FileText,
  Terminal,
  Building
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface NavbarHeroProps {
  brandName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  backgroundImage?: string;
  videoUrl?: string;
  emailPlaceholder?: string;
  onSelectRole?: (role: 'developer' | 'admin') => void;
}

// Sample live telemetry data for the product preview cards
const previewRevenueData = [
  { name: 'Mon', value: 4200 },
  { name: 'Tue', value: 4800 },
  { name: 'Wed', value: 4500 },
  { name: 'Thu', value: 5800 },
  { name: 'Fri', value: 6400 },
  { name: 'Sat', value: 7200 },
  { name: 'Sun', value: 8900 },
];

const previewActivityData = [
  { day: 'M', count: 18 },
  { day: 'T', count: 24 },
  { day: 'W', count: 32 },
  { day: 'T', count: 28 },
  { day: 'F', count: 35 },
  { day: 'S', count: 12 },
  { day: 'S', count: 15 },
];

const NavbarHero: React.FC<NavbarHeroProps> = ({
  brandName = "ORBITRA",
  heroTitle = "One Workspace. Every Team. Moving Together.",
  heroSubtitle = "Linear / Modern System Architecture",
  heroDescription = "Enterprise-grade collaboration OS designed for modern engineering organizations. Clean, isolated, and lightning-fast.",
  backgroundImage = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop",
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  onSelectRole
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setIsVideoPlaying(true);
          setIsVideoPaused(false);
        })
        .catch(() => {
          setVideoError(true);
        });
    }
  };

  const handlePauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPaused(true);
    }
  };

  const handleResumeVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPaused(false);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setIsVideoPaused(false);
  };

  const ThemeToggleButton = () => {
    if (!mounted) return <div className="w-9 h-9" />;
    return (
      <button
        onClick={toggleTheme}
        className="bg-card hover:bg-muted text-muted-foreground hover:text-foreground p-2 rounded-xl transition-colors border border-border"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-indigo-400" />}
      </button>
    );
  };

  return (
    <div className="relative bg-background text-foreground overflow-hidden">
      {/* Background Multi-Layer Radial Light (Linear Indigo Glow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-indigo-500/20 via-indigo-600/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        {/* --- Top Navigation Bar --- */}
        <header className="py-3 flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5 font-bold text-xl text-foreground hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
                <Layers className="h-4 w-4" />
              </div>
              <span className="tracking-tight font-semibold text-lg text-white">{brandName}</span>
            </a>

            <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-muted-foreground">
              <a href="#features" className="px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors">
                Platform
              </a>
              <a href="#security" className="px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors">
                Company Isolation
              </a>
              <a href="/developer" className="px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Developer Mode
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <a
                href="/developer"
                className="text-xs font-mono text-muted-foreground hover:text-indigo-300 px-3 py-1.5 rounded-lg border border-border/60 hover:border-indigo-500/40 transition-colors flex items-center gap-1.5"
              >
                <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                Developer Mode
              </a>
              <a
                href="/login"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Mode
              </a>
            </div>

            <ThemeToggleButton />

            {/* Mobile Hamburger */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              {isMobileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-card border border-border rounded-xl shadow-2xl w-60 z-40 text-sm space-y-2">
                  <a href="/developer" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-foreground hover:bg-muted rounded-lg">
                    Developer Mode
                  </a>
                  <a href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium text-center">
                    Admin Mode
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- Hero Center Section --- */}
        <div className="pt-20 pb-16 sm:pt-28 sm:pb-20 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-indigo-400 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>{heroSubtitle}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            {heroTitle}
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {heroDescription}
          </p>

          {/* STRICTLY THE TWO BUTTONS IN THE MIDDLE OF THE SCREEN */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-md mx-auto">
            {/* 1. DEVELOPER MODE BUTTON */}
            <a
              href="/developer"
              className="w-full sm:w-1/2 group relative p-4 rounded-2xl bg-card border border-indigo-500/30 hover:border-indigo-400 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/15 flex flex-col items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight">Developer Mode</span>
              <span className="text-[11px] text-muted-foreground group-hover:text-slate-300">
                Direct access &bull; All companies
              </span>
            </a>

            {/* 2. ADMIN MODE BUTTON */}
            <a
              href="/login"
              className="w-full sm:w-1/2 group relative p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-indigo-600/25 flex flex-col items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight">Admin Mode</span>
              <span className="text-[11px] text-indigo-200">
                Sign in &bull; Manage company
              </span>
            </a>
          </div>
        </div>

        {/* --- Product Dashboard Preview (Linear Styling) --- */}
        <div className="mt-4 p-3 sm:p-5 rounded-3xl bg-[#0b0c13]/90 border border-border shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-border/50 px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-xs font-mono text-muted-foreground">app.orbitra.io/workspace</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Linear Cluster Online</span>
            </div>
          </div>

          {/* Grid of Product Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Card 1: Team Velocity Graph */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sprint Velocity</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-white">8,920 pts</h3>
                  <span className="text-xs text-emerald-400 font-medium">+18.4%</span>
                </div>
              </div>
              <div className="h-14 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={previewRevenueData}>
                    <defs>
                      <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5e6ad2" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#5e6ad2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#5e6ad2" strokeWidth={2} fillOpacity={1} fill="url(#velocityGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Active Tasks Overview */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Weekly Task Activity</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-white">+164</h3>
                  <span className="text-xs text-indigo-400 font-medium">tasks closed</span>
                </div>
              </div>
              <div className="h-14 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={previewActivityData}>
                    <Bar dataKey="count" fill="#5e6ad2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 3: Company Perimeter Status */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Multi-Tenant Isolation</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-emerald-400">100%</h3>
                  <span className="text-xs text-muted-foreground">Strict</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero token crossover</span>
              </div>
            </div>

            {/* Card 4: Platform Performance */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">System Latency</p>
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-2">
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">24 ms</div>
                <p className="text-[11px] text-muted-foreground mt-1">p95 cluster response time</p>
              </div>
              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Uptime SLA</span>
                <span className="text-white font-mono">99.98%</span>
              </div>
            </div>
          </div>

          {/* Interactive Video Header Option */}
          <div className="mt-5 relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-border/60 bg-black">
            <img
              src={backgroundImage}
              alt="ORBITRA Workspace preview"
              className={`w-full h-full absolute inset-0 object-cover transition-opacity duration-500 ${isVideoPlaying && !videoError ? 'opacity-0' : 'opacity-100'}`}
            />
            {!videoError && (
              <video
                ref={videoRef}
                src={videoUrl}
                className={`w-full h-full absolute inset-0 object-cover transition-opacity duration-500 ${isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}
                onEnded={handleVideoEnded}
                onError={() => setVideoError(true)}
                playsInline
                muted
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Interactive Workspace Walkthrough
              </span>
            </div>

            {!videoError && (
              <div className="absolute bottom-4 right-4 z-10">
                {!isVideoPlaying ? (
                  <button
                    onClick={handlePlayVideo}
                    aria-label="Play video"
                    className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all duration-200 shadow-lg shadow-indigo-600/30"
                  >
                    <Play className="h-5 w-5 ml-0.5 fill-white" />
                  </button>
                ) : (
                  <button
                    onClick={isVideoPaused ? handleResumeVideo : handlePauseVideo}
                    aria-label={isVideoPaused ? "Resume video" : "Pause video"}
                    className="w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all duration-200 border border-white/20"
                  >
                    {isVideoPaused ? <Play className="h-5 w-5 ml-0.5 fill-white" /> : <Pause className="h-5 w-5 fill-white" />}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { NavbarHero };
