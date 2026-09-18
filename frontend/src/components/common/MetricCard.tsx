import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'red' | 'green' | 'amber' | 'cyan' | 'default';
  trend?: string;
  isMonospace?: boolean;
  tag?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  isMonospace = true,
  tag,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'red':
        return {
          headerBg: 'bg-[#1a0505]',
          border: 'border-stockRed/60 hover:border-stockRed',
          valText: 'text-stockRed text-glow-red',
          tagColor: 'text-stockRed border-stockRed/40',
        };
      case 'green':
        return {
          headerBg: 'bg-[#051a0b]',
          border: 'border-stockGreen/60 hover:border-stockGreen',
          valText: 'text-stockGreen text-glow-green',
          tagColor: 'text-stockGreen border-stockGreen/40',
        };
      case 'amber':
        return {
          headerBg: 'bg-[#1a1000]',
          border: 'border-terminalAmber/60 hover:border-terminalAmber',
          valText: 'text-terminalAmber text-glow-amber',
          tagColor: 'text-terminalAmber border-terminalAmber/40',
        };
      case 'cyan':
        return {
          headerBg: 'bg-[#00141a]',
          border: 'border-[#00E5FF]/60 hover:border-[#00E5FF]',
          valText: 'text-[#00E5FF]',
          tagColor: 'text-[#00E5FF] border-[#00E5FF]/40',
        };
      default:
        return {
          headerBg: 'bg-[#0d0d0d]',
          border: 'border-border hover:border-terminalAmber/50',
          valText: 'text-white',
          tagColor: 'text-terminalAmber border-border',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`terminal-card flex flex-col justify-between overflow-hidden ${styles.border}`}>
      {/* Bloomberg Window Header Strip */}
      <div className={`px-2.5 py-1 flex items-center justify-between border-b border-border ${styles.headerBg}`}>
        <div className="flex items-center space-x-1.5 overflow-hidden">
          {tag && (
            <span className="text-[10px] font-mono text-terminalAmber font-extrabold">
              [{tag}]
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary truncate font-mono">
            {title}
          </span>
        </div>

        {/* Retro window control icons */}
        <div className="flex items-center space-x-1">
          {Icon && <Icon className="w-3 h-3 text-textMuted mr-1" />}
          <div className="flex items-center space-x-0.5 opacity-60">
            <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] bg-black border border-border text-textMuted font-mono">_</span>
            <span className="w-2.5 h-2.5 flex items-center justify-center text-[8px] bg-black border border-border text-textMuted font-mono">□</span>
          </div>
        </div>
      </div>

      {/* Metric Content */}
      <div className="p-3">
        <div className="flex items-baseline justify-between">
          <div className={`text-2xl font-black tracking-tight ${styles.valText} ${isMonospace ? 'font-mono' : ''}`}>
            {value}
          </div>
          {trend && (
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
              trend.includes('+') || trend.includes('▲') 
                ? 'text-stockGreen bg-[#051a0b] border-stockGreen/40' 
                : trend.includes('-') || trend.includes('▼')
                ? 'text-stockRed bg-[#1a0505] border-stockRed/40'
                : 'text-textSecondary bg-black border-border'
            }`}>
              {trend}
            </span>
          )}
        </div>

        {subtitle && (
          <div className="text-[10px] text-textMuted mt-1.5 truncate font-mono border-t border-border/40 pt-1">
            &gt; {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
