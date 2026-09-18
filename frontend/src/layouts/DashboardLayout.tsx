import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-black text-textPrimary terminal-grid font-mono overflow-hidden">
      {/* Fixed Terminal Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bloomberg Amber Strip & Ticker */}
        <Header />

        {/* Scrollable Main Workspace */}
        <main className="flex-1 p-3.5 overflow-y-auto pb-10 bg-black">
          <Outlet />
        </main>

        {/* 3. Bottom Fixed Telemetry Bar */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#060606] border-t border-border px-3 py-1 flex items-center justify-between text-[11px] text-textSecondary font-mono select-none">
          <div className="flex items-center space-x-2">
            <span className="bg-terminalAmber text-black px-1.5 py-0.2 font-black text-[10px]">
              TERM://STATUS
            </span>
            <span className="text-terminalAmber hidden sm:inline">[F1 HELP]</span>
            <span className="text-textMuted hidden sm:inline">|</span>
            <span className="text-textSecondary hidden sm:inline">[F2 ALERTS]</span>
            <span className="text-textMuted hidden md:inline">|</span>
            <span className="text-textSecondary hidden md:inline">[F3 TRIAGE]</span>
            <span className="text-textMuted hidden md:inline">|</span>
            <span className="text-textSecondary hidden md:inline">[F4 BENCH]</span>
            <span className="text-textMuted hidden lg:inline">|</span>
            <span className="text-textSecondary hidden lg:inline">[F5 DATA]</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1.5">
              <span className="text-textMuted">BUFFER:</span>
              <span className="text-stockGreen font-bold">0.0% DROP</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-textMuted">PIPELINE:</span>
              <span className="text-terminalAmber font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-textMuted">MEM:</span>
              <span className="text-white font-bold">128MB</span>
            </div>
            <div className="flex items-center space-x-1 bg-stockGreen/15 text-stockGreen px-2 py-0.2 border border-stockGreen/40 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-stockGreen rounded-full animate-pulse mr-0.5"></span>
              LIVE_TELEMETRY
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
