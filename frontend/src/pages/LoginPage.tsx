import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertTriangle, UserCheck, Terminal, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@threatdna.ai');
  const [password, setPassword] = useState('Admin@123456');
  const [username, setUsername] = useState('soc_analyst');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await authApi.register({ username, email, password });
        // Automatically login after register
        const res = await authApi.login({ email, password });
        login(res.access_token, res.user);
        navigate('/dashboard');
      } else {
        const res = await authApi.login({ email, password });
        login(res.access_token, res.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 cyber-grid relative overflow-hidden">
      {/* Decorative scanline overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyberRed/5 to-transparent pointer-events-none opacity-40" />

      <div className="max-w-md w-full z-10">
        {/* Brand identity header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-card border border-cyberRed/40 rounded-xl mb-4 shadow-cyberRed">
            <Shield className="w-8 h-8 text-cyberRed" />
          </div>
          <h1 className="text-2xl font-black tracking-widest text-textPrimary font-mono-tech uppercase">
            ThreatDNA-AI
          </h1>
          <p className="text-xs font-mono-tech text-cyberRed tracking-widest uppercase mt-1">
            AI-POWERED IDS ALERT ANALYSIS
          </p>
          <p className="text-[11px] font-mono-tech text-textMuted tracking-wider uppercase mt-0.5">
            SECURITY OPERATIONS PLATFORM
          </p>
        </div>

        {/* Card */}
        <div className="cyber-card p-8 shadow-cardGlow border-borderLight relative bg-card">
          <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-6">
            <span className="text-xs font-mono-tech uppercase font-bold text-textPrimary flex items-center">
              <Terminal className="w-3.5 h-3.5 text-cyberGreen mr-2" />
              {isRegister ? 'New Analyst Registration' : 'Analyst Authentication'}
            </span>
            <span className="text-[10px] font-mono-tech text-cyberGreen px-2 py-0.5 bg-cyberGreen/10 border border-cyberGreen/30 rounded">
              ENCRYPTED TLS
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2 font-mono-tech">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-cyberRed" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-mono-tech text-textSecondary uppercase tracking-wider mb-1.5">
                  Analyst Handle / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-secondary border border-border focus:border-cyberRed focus:ring-1 focus:ring-cyberRed rounded py-2 pl-9 pr-3 text-xs font-mono-tech text-textPrimary placeholder-textMuted outline-none"
                    placeholder="soc_analyst"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono-tech text-textSecondary uppercase tracking-wider mb-1.5">
                SOC Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary border border-border focus:border-cyberRed focus:ring-1 focus:ring-cyberRed rounded py-2 pl-9 pr-3 text-xs font-mono-tech text-textPrimary placeholder-textMuted outline-none"
                  placeholder="analyst@threatdna.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-textSecondary uppercase tracking-wider mb-1.5">
                Passcode / Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border focus:border-cyberRed focus:ring-1 focus:ring-cyberRed rounded py-2 pl-9 pr-3 text-xs font-mono-tech text-textPrimary placeholder-textMuted outline-none"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-cyberRed hover:bg-red-600 text-white font-mono-tech font-bold text-xs uppercase tracking-widest py-2.5 px-4 rounded transition duration-150 flex items-center justify-center space-x-2 shadow-cyberRed disabled:opacity-50"
            >
              {loading ? (
                <span>VERIFYING CREDENTIALS...</span>
              ) : (
                <span>AUTHENTICATE</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Tip */}
          <div className="mt-6 pt-4 border-t border-border/80 text-[11px] font-mono-tech text-textMuted flex flex-col space-y-1">
            <div className="flex justify-between items-center text-textSecondary">
              <span>Demo Lead Analyst:</span>
              <span className="text-cyberCyan">admin@threatdna.ai</span>
            </div>
            <div className="flex justify-between items-center text-textSecondary">
              <span>Demo Password:</span>
              <span className="text-cyberCyan">Admin@123456</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs font-mono-tech text-textSecondary hover:text-cyberRed transition underline"
            >
              {isRegister ? 'Already have an analyst account? Sign In' : 'Need new analyst access? Register'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[10px] font-mono-tech text-textMuted space-y-1">
          <p>ACADEMIC CYBERSECURITY RESEARCH PLATFORM</p>
          <p>LLM-BASED IDS FALSE POSITIVE REDUCTION & TRIAGE</p>
        </div>
      </div>
    </div>
  );
};
