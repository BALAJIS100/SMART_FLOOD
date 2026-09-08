import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowRight, Lock, Mail, UserCheck, KeyRound, Smartphone, CheckCircle2, Info } from 'lucide-react';
import Logo from '../components/Logo';


export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP State
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const { login, requestOTP, verifyOTP, loading } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();


  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      showSuccess(`Welcome back, ${result.user.full_name}! (${result.user.role})`);
      navigate('/dashboard');
    } else {
      showError(result.error);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!otpIdentifier) {
      showError('Please enter your email or phone number.');
      return;
    }
    const res = await requestOTP(otpIdentifier);
    if (res.success) {
      setOtpSent(true);
      setOtpCode(''); // Ensure input box is blank for manual typing
      showSuccess('OTP sent successfully to your registered email address!');
    } else {
      showError(res.error);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      showError('Please enter the 6-digit OTP code.');
      return;
    }
    const res = await verifyOTP(otpIdentifier, otpCode);
    if (res.success) {
      showSuccess(`OTP Verified! Signed in as ${res.user.full_name}`);
      navigate('/dashboard');
    } else {
      showError(res.error);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex justify-center mb-3">
            <Logo size="lg" />
          </Link>

          <h1 className="text-2xl font-black tracking-tight text-white">SMART FLOOD RESCUE</h1>
          <p className="text-xs text-slate-400 mt-1">Command Center Secure Authentication</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Dual Auth Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'password' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('otp')}
              className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'otp' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
              <span>OTP Instant Login</span>
            </button>
          </div>

          {/* TAB 1: Password Login Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@floodrescue.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Security Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: OTP Login Form */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-2xl flex items-start gap-2 text-xs text-amber-200">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Official Rescuers Access:</strong> OTP login is enabled strictly for <em>Admin, Disaster Relief Officers, Rescue Commanders & Medical Teams</em>. Common public citizens please use <strong>Password Login</strong>.
                </span>
              </div>

              {!otpSent ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email or Phone Number</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={otpIdentifier}
                        onChange={(e) => setOtpIdentifier(e.target.value)}
                        placeholder="admin@floodrescue.com or +91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Request 6-Digit OTP Code'}</span>
                    <KeyRound className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>OTP sent to <b>{otpIdentifier}</b>. Code valid for 5 mins.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter 6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center tracking-widest font-mono text-lg py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-black focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                    >
                      <span>{loading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}



          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-cyan-400 font-bold hover:underline">
                Create New Account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-6 font-mono">
          State Disaster Relief Network • Tamil Nadu Authority • PostgreSQL Connected
        </p>
      </div>
    </div>
  );
}
