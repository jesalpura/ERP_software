import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import SiteLogo from '../common/SiteLogo';
import { 
  ShieldAlert, 
  GraduationCap, 
  User, 
  Wallet, 
  Sparkles, 
  Lock, 
  ShieldCheck,
  KeyRound,
  LogIn,
  UserPlus,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginPage({ onSelectRoleLogin }) {
  const { websiteConfig } = useSiteConfig();
  const [selectedRoleId, setSelectedRoleId] = useState('admin');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const roles = [
    {
      id: 'admin',
      title: 'Admin Portal',
      roleBadge: 'ADMINISTRATOR',
      badgeColor: 'bg-indigo-600 text-white',
      borderColor: 'hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30',
      activeBorder: 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-100',
      icon: ShieldAlert,
      demoEmail: `admin@${websiteConfig.domain}`,
      description: 'Campus operations, terminal capacity, student registrations & full audit controls.'
    },
    {
      id: 'faculty',
      title: 'Faculty Portal',
      roleBadge: 'INSTRUCTOR',
      badgeColor: 'bg-blue-600 text-white',
      borderColor: 'hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30',
      activeBorder: 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-lg shadow-blue-100',
      icon: GraduationCap,
      demoEmail: `faculty@${websiteConfig.domain}`,
      description: 'Instructor class schedule, lab terminal attendance, student marksheet grading & project PR reviews.'
    },
    {
      id: 'student',
      title: 'Student Portal',
      roleBadge: 'STUDENT',
      badgeColor: 'bg-emerald-600 text-white',
      borderColor: 'hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50/30',
      activeBorder: 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-100',
      icon: User,
      demoEmail: `student@${websiteConfig.domain}`,
      description: 'Personal class schedule, assigned PC workstation seat, fee receipt ledger & assignment submissions.'
    },
    {
      id: 'finance',
      title: 'Finance Portal',
      roleBadge: 'FINANCE OFFICER',
      badgeColor: 'bg-teal-600 text-white',
      borderColor: 'hover:border-teal-300 hover:shadow-md hover:bg-teal-50/30',
      activeBorder: 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-lg shadow-teal-100',
      icon: Wallet,
      demoEmail: `finance@${websiteConfig.domain}`,
      description: 'Revenue cash flow ledgers, e-receipt voucher generation, faculty payroll disbursement & expense audit.'
    },
  ];

  const handleSelectRoleCard = (roleObj) => {
    setSelectedRoleId(roleObj.id);
    localStorage.setItem('supabase_selected_role', roleObj.id);
    if (!email) {
      setEmail(roleObj.demoEmail);
    }
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    // Helper to determine role from user email & metadata
    const getResolvedRole = (userEmail, userMetaRole) => {
      const lower = userEmail ? userEmail.toLowerCase() : '';
      if (lower.includes('admin')) return 'admin';
      if (lower.includes('faculty') || lower.includes('instructor') || lower.includes('teacher')) return 'faculty';
      if (lower.includes('finance') || lower.includes('account') || lower.includes('billing')) return 'finance';
      if (lower.includes('student')) return 'student';
      if (userMetaRole && ['admin', 'faculty', 'student', 'finance'].includes(userMetaRole)) return userMetaRole;
      return null;
    };

    if (!isSupabaseConfigured || !supabase) {
      // Fallback for local mock mode
      const mockRole = getResolvedRole(email, null);
      if (mockRole && mockRole !== selectedRoleId) {
        const actualRoleName = roles.find(r => r.id === mockRole)?.title || mockRole.toUpperCase();
        const targetRoleName = roles.find(r => r.id === selectedRoleId)?.title || selectedRoleId.toUpperCase();
        setErrorMsg(`Role Mismatch: Your credentials belong to "${actualRoleName}", not "${targetRoleName}". Please select the ${actualRoleName} card to log in.`);
        return;
      }

      onSelectRoleLogin({ id: selectedRoleId, email });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Register user with metadata role
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role: selectedRoleId,
            },
          },
        });

        if (error) throw error;

        if (data?.session) {
          setSuccessMsg('Account created & logged in successfully!');
        } else if (data?.user) {
          setSuccessMsg('Registration submitted! Check your email for confirmation or sign in below.');
          setIsSignUp(false);
        }
      } else {
        // Sign in user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data?.user) {
          const actualRole = getResolvedRole(data.user.email, data.user.user_metadata?.role || data.user.app_metadata?.role) || selectedRoleId;

          // Enforce strict role matching for selected portal
          if (actualRole !== selectedRoleId) {
            await supabase.auth.signOut();
            const actualRoleName = roles.find(r => r.id === actualRole)?.title || actualRole.toUpperCase();
            const targetRoleName = roles.find(r => r.id === selectedRoleId)?.title || selectedRoleId.toUpperCase();
            setErrorMsg(`Role Mismatch: This account is registered as "${actualRoleName}". You cannot sign in via the "${targetRoleName}". Please select the ${actualRoleName} card to log in.`);
            return;
          }

          setSuccessMsg('Signed in successfully!');
        }
      }
    } catch (err) {
      console.error('Supabase Auth Error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Light Gradients */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white/90 border border-slate-200/90 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-slate-200/70 z-10 flex flex-col gap-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-3">
            <SiteLogo imageClassName="h-12 w-12 object-cover rounded-2xl shadow-lg border border-slate-200/60" className="h-12 w-12 text-2xl" />
            <span className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              {websiteConfig.shortName} {websiteConfig.suffix} <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            </span>
          </div>
          <p className="text-slate-600 text-xs max-w-md mt-1">
            Institutional Role-Based Access Portal powered by Supabase Auth
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Supabase Auth & RBAC Active
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Role Cards Column */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRoleId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRoleCard(r)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden ${
                    isSelected ? r.activeBorder : `bg-white/80 border-slate-200 ${r.borderColor}`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-9 w-9 rounded-xl ${r.badgeColor} flex items-center justify-center shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900">{r.title}</h3>
                        <span className="text-[10px] font-mono text-slate-500 block uppercase font-semibold">Role: {r.id}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-600 text-white tracking-wide shadow-xs">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono">{r.demoEmail}</span>
                    <span className="text-indigo-600 font-semibold hover:underline">Select &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Supabase Embedded Auth Form Column */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isSignUp ? 'Create Supabase Account' : 'Supabase Portal Sign In'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Role: <span className="font-bold uppercase text-indigo-600">{selectedRoleId}</span>
                </p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    !isSignUp ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isSignUp ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`${selectedRoleId}@${websiteConfig.domain}`}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isSignUp ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create {selectedRoleId.toUpperCase()} Account</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to {selectedRoleId.toUpperCase()}</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">Demo Testing Credentials:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(`${selectedRoleId}@${websiteConfig.domain}`);
                    setPassword('demo1234');
                  }}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Auto-fill Demo Form
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-mono text-slate-900 font-bold block">{selectedRoleId}@${websiteConfig.domain}</span>
                  <span className="text-slate-400 font-mono text-[10px]">Password: demo1234</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectRoleLogin({ id: selectedRoleId, email: `${selectedRoleId}@${websiteConfig.domain}` });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Demo Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600">Authenticated via Supabase Auth. RBAC enforced based on user metadata & email assignment.</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">TCIT ERP v3.0 • Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}


