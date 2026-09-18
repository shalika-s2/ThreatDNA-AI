import React from 'react';

export const SeverityBadge: React.FC<{ severity: string; size?: 'sm' | 'md' }> = ({ severity, size = 'sm' }) => {
  const sev = (severity || 'LOW').toUpperCase();

  const getStyle = () => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#220000] text-stockRed border-stockRed font-extrabold text-glow-red animate-pulse';
      case 'HIGH':
        return 'bg-[#1e0a00] text-[#FF7A00] border-[#FF7A00] font-bold';
      case 'MEDIUM':
        return 'bg-[#1a1200] text-terminalAmber border-terminalAmber font-semibold';
      case 'LOW':
        return 'bg-[#001a08] text-stockGreen border-stockGreen font-semibold';
      default:
        return 'bg-[#111111] text-textSecondary border-border';
    }
  };

  const pad = size === 'sm' ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-mono uppercase tracking-wider border ${pad} ${getStyle()}`}>
      [{sev}]
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: string; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  const p = (priority || 'P4').toUpperCase();

  const getStyle = () => {
    switch (p) {
      case 'P1':
      case 'P1 CRITICAL':
        return 'bg-[#220000] text-stockRed border-stockRed font-black';
      case 'P2':
      case 'P2 HIGH':
        return 'bg-[#1e0a00] text-[#FF8800] border-[#FF8800] font-bold';
      case 'P3':
      case 'P3 MEDIUM':
        return 'bg-[#1a1200] text-terminalAmber border-terminalAmber font-semibold';
      case 'P4':
      case 'P4 LOW':
        return 'bg-[#001a08] text-stockGreen border-stockGreen font-medium';
      default:
        return 'bg-[#111111] text-textSecondary border-border';
    }
  };

  const pad = size === 'sm' ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-mono uppercase tracking-wider border ${pad} ${getStyle()}`}>
      [{p}]
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || 'NEW').toUpperCase();

  const getStyle = () => {
    switch (s) {
      case 'NEW':
        return 'bg-[#001020] text-[#00B4D8] border-[#00B4D8]';
      case 'INVESTIGATING':
        return 'bg-[#1a1200] text-terminalAmber border-terminalAmber';
      case 'ESCALATED':
        return 'bg-[#220000] text-stockRed border-stockRed font-bold';
      case 'RESOLVED':
        return 'bg-[#001a08] text-stockGreen border-stockGreen';
      case 'FALSE_POSITIVE':
        return 'bg-[#180024] text-[#D880FF] border-[#D880FF]';
      default:
        return 'bg-[#111111] text-textSecondary border-border';
    }
  };

  return (
    <span className={`inline-flex items-center font-mono text-[10px] font-bold uppercase px-1.5 py-0.2 border ${getStyle()}`}>
      [{s.replace('_', ' ')}]
    </span>
  );
};
