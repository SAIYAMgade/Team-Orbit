import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { companyStore, type Company } from '@/services/companyStore';
import {
  Building,
  ArrowRight,
  Mail,
  User,
  ShieldCheck
} from 'lucide-react';

export default function JoinInvite() {
  const [token, setToken] = useState<string>('');
  const [company, setCompany] = useState<Company | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Read ?token=, ?workspace=, ?company=, ?admin= from URL query
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || '';
    const urlWorkspace = params.get('workspace') || params.get('company') || '';
    const urlAdmin = params.get('admin') || '';

    setToken(urlToken);

    let resolvedCompany: Company | undefined;

    if (urlWorkspace) {
      // Dynamically registers or retrieves company by the exact name provided in the invite link
      resolvedCompany = companyStore.ensureCompanyFromInvite(urlWorkspace, urlToken, urlAdmin);
    } else if (urlToken) {
      resolvedCompany = companyStore.getCompanyByToken(urlToken);
    }

    if (!resolvedCompany) {
      resolvedCompany = companyStore.getActiveCompany() || companyStore.getCompanies()[0];
    }

    if (resolvedCompany) {
      setCompany(resolvedCompany);
      if (!urlToken) {
        setToken(resolvedCompany.inviteToken);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    const currentToken = token || company?.inviteToken || 'default';
    const result = companyStore.addMemberViaToken(currentToken, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'Developer'
    });

    if (result.success && result.company) {
      // Immediate reliable entrance into workspace dashboard
      window.location.replace('/dashboard');
    } else {
      setIsSubmitting(false);
      setError(result.error || 'Failed to enter workspace');
    }
  };

  const workspaceDisplayName = company?.name || 'Company Workspace';

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f4f4f6] flex items-center justify-center p-4 selection:bg-white/20 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-b from-white/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* TEAM ORBIT Bold Header */}
        <div className="text-center mb-2">
          <span className="text-2xl font-black tracking-tight text-white uppercase">
            TEAM ORBIT
          </span>
        </div>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white mb-3 shadow-xl">
            <Building className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Join Team Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#8e92a4] mt-1">
            You have been invited to join <strong className="text-white">{workspaceDisplayName}</strong>
          </p>
        </div>

        <Card className="border border-[#1f212d] bg-[#111218]/90 backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardContent className="p-6 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workspace Indicator Badge */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8e92a4] block text-[11px] font-mono uppercase tracking-wider">Workspace</span>
                  <strong className="text-white font-semibold text-sm">{workspaceDisplayName}</strong>
                </div>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Invite
                </span>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="join-name" className="block text-xs font-mono uppercase tracking-wider text-[#8e92a4] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="join-name"
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white placeholder:text-[#555869] text-sm focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                  <User className="h-4 w-4 text-[#8e92a4] absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="join-email" className="block text-xs font-mono uppercase tracking-wider text-[#8e92a4] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="join-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14151e] border border-[#1f212d] text-white placeholder:text-[#555869] text-sm focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                  <Mail className="h-4 w-4 text-[#8e92a4] absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Entering Workspace...' : 'Enter Workspace'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-5">
          <a href="/" className="text-xs text-[#8e92a4] hover:text-white transition-colors">
            &larr; Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
