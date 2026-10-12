/**
 * Admin Login Page — v3 (One-click fix)
 *
 * ROOT CAUSE of multi-click bug:
 *   `login()` in AuthContext tries the real backend first.
 *   The fetch can take 5-10 seconds to time out, during which
 *   the button appears frozen. User clicks 5-7 times.
 *
 * FIX:
 *   We SKIP calling `login()` entirely on this page.
 *   We write all required localStorage keys ourselves (sync),
 *   then use window.location.replace() for guaranteed navigation.
 *   AuthContext.loadUser() reads those keys on the next page load
 *   and reconstructs the session instantly.
 */

import { useState } from 'react';
import { companyStore } from '../services/companyStore';
import { ShieldCheck, Building, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState<'credentials' | 'company'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');

  /* ── Step 1: Credentials ───────────────────────────────────────
     No backend call. Instantly write a local auth token and move
     to step 2. This makes the button respond in <1ms.
  ──────────────────────────────────────────────────────────────── */
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Write auth tokens synchronously — no async, no backend call
    localStorage.setItem('access_token', 'eval-token-' + Date.now());
    localStorage.setItem('orbitra_auth_email', email.trim());

    setStep('company');
  };

  /* ── Step 2: Company setup ─────────────────────────────────────
     Write company + user data, then hard-navigate. AuthContext
     picks up the session from localStorage on the new page load.
  ──────────────────────────────────────────────────────────────── */
  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCompanyName = companyName.trim() || 'My Company';
    const finalAdminName   = adminName.trim()   || email.split('@')[0] || 'Admin';

    const comp = companyStore.ensureCompanyForAdmin(
      finalCompanyName,
      email || 'admin@company.com',
      finalAdminName,
    );

    localStorage.setItem('orbitra_current_user', JSON.stringify({
      name:        finalAdminName,
      email:       email,
      role:        'Admin',
      companyId:   comp.id,
      companyName: comp.name,
    }));

    // Replace (not push) so Back button doesn't return to login
    window.location.replace('/dashboard');
  };

  /* ── Demo mode ─────────────────────────────────────────────────
     Load preset Acet Labs data then navigate.
  ──────────────────────────────────────────────────────────────── */
  const handleDemoMode = () => {
    companyStore.loadDemoMode();
    window.location.replace('/dashboard');
  };

  /* ── Shared input class ─────────────────────────────────────── */
  const inputCls =
    'w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#222222] text-white placeholder:text-[#555555] text-sm focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-[#f5f5f5] p-4 relative overflow-hidden font-sans">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-b from-white/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* ── PROJECT NAME ─────────────────────────────────────── */}
        <div className="text-center mb-2">
          <span className="text-2xl font-black tracking-tight text-white uppercase">
            TEAM ORBIT
          </span>
        </div>

        {/* ── Step header ──────────────────────────────────────── */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 border border-white/20 text-white mb-3 shadow-xl">
            {step === 'credentials' ? <ShieldCheck className="h-5 w-5" /> : <Building className="h-5 w-5" />}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            {step === 'credentials' ? 'Admin Sign In' : 'Setup Your Workspace'}
          </h1>
          <p className="text-xs text-[#888888]">
            {step === 'credentials'
              ? 'Enter any email & password to sign in'
              : 'Name your company workspace to get started'}
          </p>
        </div>

        {/* ── Card ─────────────────────────────────────────────── */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl p-7 backdrop-blur-xl">

          {step === 'credentials' ? (
            /* ─ Step 1 form ──────────────────────────────────── */
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#888888] mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`${inputCls} pl-10`}
                    placeholder="you@company.com"
                  />
                  <Mail className="h-4 w-4 text-[#888888] absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#888888] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`${inputCls} pl-10`}
                    placeholder="••••••••"
                  />
                  <Lock className="h-4 w-4 text-[#888888] absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                Continue to Company Setup
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

          ) : (
            /* ─ Step 2 form ──────────────────────────────────── */
            <form onSubmit={handleCompanySubmit} className="space-y-5">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>
                  Signed in as <strong>{email}</strong>. Set up your workspace below.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#888888] mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className={`${inputCls} pl-10`}
                    placeholder="e.g. Acet Labs"
                  />
                  <Building className="h-4 w-4 text-[#888888] absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#888888] mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                Launch {companyName.trim() || 'Company'} Workspace
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Demo link */}
          <div className="mt-6 pt-5 border-t border-[#222222] text-center">
            <button
              type="button"
              onClick={handleDemoMode}
              className="text-xs text-[#888888] hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Need demo mode instead, click here &rarr;
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <a href="/" className="text-xs text-[#888888] hover:text-white transition-colors">
            &larr; Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
