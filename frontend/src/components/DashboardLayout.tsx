import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useNotifications } from '../contexts/NotificationContext';
import { companyStore, type Company } from '../services/companyStore';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  BarChart2,
  Mail,
  Bell,
  FileText,
  Database,
  Users,
  UserPlus,
  Settings,
  Shield,
  Key,
  Folder,
  Calendar,
  Video,
  PenTool,
  MessageSquare,
  LogOut,
  Radio
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadCompany();

    const handleUpdate = () => {
      loadCompany();
    };
    window.addEventListener('orbitra_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('orbitra_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadCompany = () => {
    setActiveCompany(companyStore.getActiveCompany());
  };

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('orbitra-sidebar-collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Group collapses matching Reference Image
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Content': true,
    'Team': true,
    'Settings': true,
  });

  const notificationRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('orbitra-sidebar-collapsed', String(next));
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pathname = window.location.pathname;

  return (
    <div className="min-h-screen bg-black text-[#f5f5f5] flex overflow-x-hidden selection:bg-white/20 font-sans">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* --- SIDEBAR EXACT MATCH TO REFERENCE IMAGE --- */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#080808] border-r border-[#1e1e1e] flex flex-col transition-[width,transform] duration-200 ease-out select-none ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Workspace Brand Top: Rounded white square icon + Company Name */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1e1e1e]">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              {/* Rounded white square icon as seen in Reference Image */}
              <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-sm bg-black" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    TEAM ORBIT
                  </span>
                </div>
                <h1 className="text-sm font-bold text-white truncate tracking-tight">
                  {activeCompany?.name || 'Acet Labs'}
                </h1>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs shadow-sm">
                <span className="w-2.5 h-2.5 rounded-sm bg-black" />
              </div>
            </div>
          )}

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1 rounded-md text-[#777777] hover:text-white hover:bg-[#191919] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list matching uploaded screenshot exactly */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          {/* Top 4 Flat Navigation Items: Dashboard, Analytics, Messages, Notifications */}
          <div className="space-y-0.5">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                pathname === '/dashboard'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8c91a4] hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Dashboard"
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>

            <Link
              to="/developer"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                pathname === '/developer'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8c91a4] hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Analytics"
            >
              <BarChart2 className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>Analytics</span>}
            </Link>

            <Link
              to="/chat"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                pathname === '/chat'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8c91a4] hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Messages"
            >
              <Mail className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>Messages</span>}
            </Link>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-[#8c91a4] hover:text-white hover:bg-white/5 ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="Notifications"
            >
              <Bell className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </div>
              )}
            </button>
          </div>

          {/* Group 1: Content (with Documents, Live Board, Projects) */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                onClick={() => toggleGroup('Content')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-[#7c8294] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>Content</span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    expandedGroups['Content'] ? '' : '-rotate-90'
                  }`}
                />
              </button>
            ) : (
              <div className="h-px bg-[#1a1b24] my-2" />
            )}

            {(!isCollapsed ? expandedGroups['Content'] : true) && (
              <div className="pl-6 space-y-0.5">
                <Link
                  to="/documents"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    pathname === '/documents'
                      ? 'text-white font-medium bg-white/5'
                      : 'text-[#8c91a4] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Documents</span>
                </Link>

                <Link
                  to="/whiteboards"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    pathname === '/whiteboards'
                      ? 'text-white font-medium bg-white/5'
                      : 'text-[#8c91a4] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <PenTool className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Live Board</span>
                </Link>

                <Link
                  to="/projects"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    pathname === '/projects'
                      ? 'text-white font-medium bg-white/5'
                      : 'text-[#8c91a4] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Database className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Projects</span>
                </Link>
              </div>
            )}
          </div>

          {/* Group 2: Team (Members, Invitations, Calendar/Meeting) */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                onClick={() => toggleGroup('Team')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-[#7c8294] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Team</span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    expandedGroups['Team'] ? '' : '-rotate-90'
                  }`}
                />
              </button>
            ) : (
              <div className="h-px bg-[#1a1b24] my-2" />
            )}

            {(!isCollapsed ? expandedGroups['Team'] : true) && (
              <div className="pl-6 space-y-0.5">
                <Link
                  to="/calendar"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    pathname === '/calendar'
                      ? 'text-white font-medium bg-white/5'
                      : 'text-[#8c91a4] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Calendar & Meetings</span>
                </Link>

                <Link
                  to="/developer"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    pathname === '/developer'
                      ? 'text-white font-medium bg-white/5'
                      : 'text-[#8c91a4] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Members</span>
                </Link>

                <button
                  onClick={() => {
                    if (activeCompany) {
                      const link = companyStore.getInviteUrl(activeCompany);
                      navigator.clipboard.writeText(link);
                      alert(`Invite link copied:\n${link}`);
                    }
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#8c91a4] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Invitations</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 3: Settings (General, Security, API Keys) */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <button
                onClick={() => toggleGroup('Settings')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-[#7c8294] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    expandedGroups['Settings'] ? '' : '-rotate-90'
                  }`}
                />
              </button>
            ) : (
              <div className="h-px bg-[#1a1b24] my-2" />
            )}

            {(!isCollapsed ? expandedGroups['Settings'] : true) && (
              <div className="pl-6 space-y-0.5">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#8c91a4] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>General</span>
                </Link>

                <Link
                  to="/developer"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#8c91a4] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Security</span>
                </Link>

                <Link
                  to="/developer"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#8c91a4] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Key className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>API Keys</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* User profile bottom item */}
        <div className="p-3 border-t border-[#1e1e1e] bg-[#050505]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white truncate leading-none">
                      {user?.full_name || (activeCompany ? activeCompany.adminName : 'Admin User')}
                    </p>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-[#777777] truncate mt-1">
                    {user?.email || (activeCompany ? activeCompany.adminEmail : 'admin@company.com')}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-[#777777] hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT CONTAINER MATCHING IMAGE LAYOUT --- */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-200 ease-out ${
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#1e1e1e] bg-black/90 backdrop-blur-md sticky top-0 z-30 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#111111] border border-[#222222] text-white"
            >
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-[#777777] hidden sm:flex">
              <span className="font-black text-white tracking-wider">TEAM ORBIT</span>
              <span className="text-[#333333]">/</span>
              <span>{activeCompany?.name || 'Workspace'}</span>
              <span className="text-[#333333]">/</span>
              <span className="text-white font-medium capitalize">
                {pathname.replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/whiteboards"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#111111] border border-[#222222] text-[#888888] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <PenTool className="h-3.5 w-3.5 text-white" />
              <span>Live Board</span>
            </Link>

            <Link
              to="/calendar"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#111111] border border-[#222222] text-[#888888] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-white" />
              <span>Schedule Meeting</span>
            </Link>

            <Link
              to="/chat"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#111111] border border-[#222222] text-[#888888] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span>Live Chat</span>
            </Link>

            <button
              onClick={logout}
              className="text-xs font-medium text-[#888888] hover:text-white px-3 py-1.5 rounded-lg bg-[#111111] border border-[#222222]"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-5 sm:p-7 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
