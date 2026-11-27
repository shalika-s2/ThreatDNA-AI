import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  Cpu,
  FlaskConical,
  Database,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  User as UserIcon,
  Shield,
  Terminal,
  Activity,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { code: '01', label: 'DASHBOARD', path: '/dashboard', icon: LayoutDashboard },
    { code: '02', label: 'IDS ALERTS', path: '/alerts', icon: ShieldAlert },
    { code: '03', label: 'AI TRIAGE', path: '/analysis', icon: Cpu },
    { code: '04', label: 'BENCHMARKS', path: '/experiments', icon: FlaskConical },
    { code: '05', label: 'DATASETS', path: '/datasets', icon: Database },
    { code: '06', label: 'TELEMETRY', path: '/metrics', icon: BarChart3 },
    { code: '07', label: 'SOC REPORTS', path: '/reports', icon: FileText },
    { code: '08', label: 'LIVE NETWORK', path: '/network', icon: Activity },
    { code: '09', label: 'SYS CONFIG', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#050505] border-r border-border flex flex-col justify-between h-screen sticky top-0 select-none z-30 font-mono">
      {/* Brand Header */}
      <div>
        <div className="p-3 border-b border-border bg-[#0a0a0a]">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-terminalAmber text-black font-black text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs tracking-wider text-terminalAmber uppercase">
                THREATDNA // AI
              </div>
              <div className="text-[10px] text-textMuted tracking-tight">
                SOC TRIAGE TERMINAL
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Command Header */}
        <div className="px-3 pt-3 pb-1 text-[10px] text-textMuted uppercase tracking-widest flex items-center justify-between">
          <span>&gt; DIRECTORY_SYS</span>
          <span className="text-terminalAmber">9 NODES</span>
        </div>

        {/* Navigation links */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-2.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-terminalAmber text-black font-extrabold border border-terminalAmber'
                      : 'text-textSecondary hover:text-terminalAmber hover:bg-[#110b00] border border-transparent'
                  }`
                }
              >
                <span className="font-mono text-[10px] mr-2 opacity-70">
                  [{item.code}]
                </span>
                <Icon className="w-3.5 h-3.5 mr-2" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom status & User profile */}
      <div className="p-2 border-t border-border bg-[#030303] space-y-2">
        {/* Terminal Telemetry Quick Box */}
        <div className="p-2 bg-[#080808] border border-border text-[10px] space-y-1">
          <div className="flex items-center justify-between text-textMuted">
            <span>SOCKET:</span>
            <span className="text-stockGreen font-bold">ESTABLISHED</span>
          </div>
          <div className="flex items-center justify-between text-textMuted">
            <span>PING:</span>
            <span className="text-terminalAmber font-bold">14ms</span>
          </div>
          <div className="flex items-center justify-between text-textMuted">
            <span>VERSION:</span>
            <span className="text-textSecondary font-bold">v2.4.0-TERM</span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-[#0a0a0a] border border-border">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-6 h-6 bg-terminalAmber/20 border border-terminalAmber/40 flex items-center justify-center text-terminalAmber text-xs font-bold">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {user?.username || 'ANALYST_01'}
              </div>
              <div className="text-[9px] text-textMuted uppercase">
                {user?.role || 'LEVEL_3_SEC'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Disconnect Terminal"
            className="p-1 text-textMuted hover:text-stockRed hover:bg-[#1a0000] border border-transparent hover:border-stockRed transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
