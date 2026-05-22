/**
 * Login page — premium centered design with live IoT telemetry nodes.
 */

import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sprout, TrendingUp, ShieldCheck, Truck, AlertCircle, CheckCircle2, Thermometer } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = form.email === '' || emailRegex.test(form.email);
  const isEmailComplete = form.email !== '' && emailRegex.test(form.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true });

    if (!isEmailComplete) {
      setError('Please enter a valid email address');
      return;
    }
    if (!form.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, password) => {
    setForm({ email, password });
    setTouched({ email: false, password: false });
    setError('');
    setTimeout(() => {
      if (formRef.current) formRef.current.requestSubmit();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#02140f] bg-gradient-to-b from-[#02140f] via-[#052219] to-[#040810] text-slate-100 flex flex-col items-center justify-start py-16 px-4 relative overflow-y-auto w-full" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Subtle geometric grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.15] filter blur-[120px] pointer-events-none" style={{
        background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
      }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.12] filter blur-[100px] pointer-events-none" style={{
        background: 'radial-gradient(circle, #0284c7 0%, transparent 70%)',
      }} />

      {/* Hero Header Section */}
      <header className="relative z-10 text-center max-w-[720px] w-full mb-16 animate-fade-in shrink-0 flex flex-col items-center">
        {/* Top Header Branding */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/20 animate-pulse-glow">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-white tracking-tight">AgriSupply</span>
            <span className="block text-[10px] text-emerald-400 font-bold tracking-[0.25em] uppercase">Control System</span>
          </div>
        </div>

        {/* System Status and Title */}
        <div className="inline-flex items-center gap-2 bg-slate-950/60 backdrop-blur-md border border-emerald-500/30 px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase shadow-lg mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span>SYSTEM CONTROL PANEL: ONLINE</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Intelligent Supply Chains <br/>
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent">For Modern Agriculture</span>
        </h2>
        <p className="text-slate-400 mt-4 text-base sm:text-lg max-w-[620px] mx-auto leading-relaxed">
          Real-time monitoring, AI-driven logistics, and cold chain verification integrated into a unified smart contract protocol.
        </p>
      </header>

      {/* Analytics Insights Grid Section */}
      <section className="relative z-10 max-w-[760px] w-full mb-0 animate-fade-in stagger-2 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Node 1: Crop Prediction */}
          <div className="bg-[#050e0a]/40 backdrop-blur-xl border border-emerald-500/10 p-7 rounded-[24px] shadow-lg hover:shadow-[0_0_24px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all duration-500 relative text-left group">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400/70 font-bold bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">NODE_01</span>
            </div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Crop Analytics</span>
            <span className="block text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">94.2% Prediction</span>
            <div className="w-full bg-slate-900/50 h-1.5 rounded-full mt-5 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[94.2%] relative">
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Node 2: Cold Chain Tracking */}
          <div className="bg-[#050e0a]/40 backdrop-blur-xl border border-blue-500/10 p-7 rounded-[24px] shadow-lg hover:shadow-[0_0_24px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all duration-500 relative text-left group">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                <Thermometer className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-blue-400/70 font-bold bg-blue-950/30 px-3 py-1 rounded-full border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">NODE_02</span>
            </div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cold Chain</span>
            <span className="block text-xl font-extrabold text-white group-hover:text-blue-300 transition-colors">-2.4°C Telemetry</span>
            <div className="flex items-center gap-2 mt-5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Status: Optimal</span>
            </div>
          </div>

          {/* Node 3: Smart Logistics */}
          <div className="bg-[#050e0a]/40 backdrop-blur-xl border border-amber-500/10 p-7 rounded-[24px] shadow-lg hover:shadow-[0_0_24px_rgba(245,158,11,0.15)] hover:border-amber-500/30 transition-all duration-500 relative text-left group">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-amber-400/70 font-bold bg-amber-950/30 px-3 py-1 rounded-full border border-amber-500/10 group-hover:border-amber-500/30 transition-colors">NODE_03</span>
            </div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Smart Logistics</span>
            <span className="block text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">Route Optimized</span>
            <div className="flex items-center gap-2 mt-5">
              <span className="text-[11px] text-amber-400/80 font-semibold tracking-wide">Auto-dispatch: Active</span>
            </div>
          </div>

          {/* Node 4: Quality Assurance */}
          <div className="bg-[#050e0a]/40 backdrop-blur-xl border border-purple-500/10 p-7 rounded-[24px] shadow-lg hover:shadow-[0_0_24px_rgba(168,85,247,0.15)] hover:border-purple-500/30 transition-all duration-500 relative text-left group">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-purple-400/70 font-bold bg-purple-950/30 px-3 py-1 rounded-full border border-purple-500/10 group-hover:border-purple-500/30 transition-colors">NODE_04</span>
            </div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Batch Ledger</span>
            <span className="block text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors">Audits Completed</span>
            <div className="flex items-center gap-2 mt-5">
              <div className="flex -space-x-1">
                 <span className="w-3 h-3 rounded-full bg-purple-500/40 border border-purple-500/60" />
                 <span className="w-3 h-3 rounded-full bg-purple-400/40 border border-purple-400/60" />
              </div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider ml-1">100% SECURED</span>
            </div>
          </div>

        </div>
      </section>

      {/* Spacer to guarantee premium layout gap and prevent overlap */}
      <div className="h-32 sm:h-48 w-full shrink-0 pointer-events-none" />

      {/* Authentication Card Section */}
      <section className="relative z-10 max-w-[540px] w-full mb-24 animate-fade-in stagger-3 shrink-0 flex flex-col items-center">
        <div className="w-full bg-[#030b08]/70 backdrop-blur-2xl border border-emerald-500/15 rounded-[32px] p-8 sm:p-14 shadow-[0_0_40px_rgba(16,185,129,0.05),_0_30px_70px_rgba(0,0,0,0.7)] transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_0_60px_rgba(16,185,129,0.1)] text-center">
          
          <div className="mb-10">
            <h3 className="text-4xl font-black text-white tracking-tight">Welcome back</h3>
            <p className="text-slate-400 mt-3 text-base">Sign in to manage your smart supply chain portal.</p>
          </div>

          {error && (
            <div className="mb-8 flex items-center gap-4 p-5 rounded-xl bg-red-950/30 border border-red-900/40 animate-fade-in text-left">
              <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-sm font-bold">!</span>
              </div>
              <p className="text-sm text-red-400 font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form with generous gaps */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 text-left">
            
            {/* Email Address */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className={`premium-input-container ${focused === 'email' ? 'focused' : ''} ${touched.email && !isEmailValid ? 'error' : ''}`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
                  touched.email && !isEmailValid ? 'text-red-400' : focused === 'email' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  <Mail className="w-6 h-6" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => { setFocused(''); setTouched(t => ({ ...t, email: true })); }}
                  className="premium-input"
                  placeholder="you@example.com"
                  required
                />
                {form.email && touched.email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isEmailComplete
                      ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      : <AlertCircle className="w-6 h-6 text-red-400" />
                    }
                  </div>
                )}
              </div>
              {touched.email && !isEmailValid && form.email && (
                <p className="text-sm text-red-400 flex items-center gap-1.5 mt-1.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4" /> Please enter a valid email address
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">Password</label>
                <a href="#forgot" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className={`premium-input-container ${focused === 'password' ? 'focused' : ''}`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
                  focused === 'password' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  <Lock className="w-6 h-6" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  className="premium-input"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (form.email && !isEmailComplete) || !form.password}
              className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-600 hover:via-teal-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-emerald-500/20 cursor-pointer mt-8"
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-10 pt-8 border-t border-slate-900/80">
            <span className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-5 text-center">Quick Demo Logins</span>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => quickLogin('farmer1@agrisupply.com', 'farmer123')}
                className="py-4 px-3 rounded-xl border border-slate-900 bg-slate-900/30 hover:bg-emerald-950/20 hover:border-emerald-500/30 text-sm font-bold text-slate-400 hover:text-emerald-400 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              >
                <Sprout className="w-6 h-6 text-emerald-500" />
                <span className="text-xs font-bold mt-1">Farmer</span>
              </button>
              <button
                onClick={() => quickLogin('transport@agrisupply.com', 'transport123')}
                className="py-4 px-3 rounded-xl border border-slate-900 bg-slate-900/30 hover:bg-blue-950/20 hover:border-blue-500/30 text-sm font-bold text-slate-400 hover:text-blue-400 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              >
                <Truck className="w-6 h-6 text-blue-500" />
                <span className="text-xs font-bold mt-1">Transporter</span>
              </button>
              <button
                onClick={() => quickLogin('admin@agrisupply.com', 'admin123')}
                className="py-4 px-3 rounded-xl border border-slate-900 bg-slate-900/30 hover:bg-purple-950/20 hover:border-purple-500/30 text-sm font-bold text-slate-400 hover:text-purple-400 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-6 h-6 text-purple-500" />
                <span className="text-xs font-bold mt-1">Admin</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-8 text-base text-slate-400 font-semibold">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </section>

      {/* Footer Compliance Section */}
      <footer className="text-center max-w-[420px] bg-slate-950/40 backdrop-blur-md border border-slate-900/60 p-5 rounded-2xl animate-fade-in shadow-md relative z-10 shrink-0 mb-12">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          Secure multi-tenant AgriTech portal. Powered by end-to-end IoT monitoring, automated cold-chain telemetry, and smart contract settlement.
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-900">
          <span className="inline-block text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider">
            System Integrity Verified
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <span className="inline-block text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider">
            SSR-41 Security Compliant
          </span>
        </div>
      </footer>

      {styleElement}
    </div>
  );
}

const styleElement = (
  <style>{`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .stagger-2 {
      animation-delay: 0.15s;
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #0b1310 inset !important;
        -webkit-text-fill-color: #ffffff !important;
        transition: background-color 5000s ease-in-out 0s;
    }
  `}</style>
);
