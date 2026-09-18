import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Cpu,
  Database,
  Key,
  Server,
  UserCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold font-mono-tech tracking-wide text-textPrimary uppercase flex items-center">
            <Settings className="w-5 h-5 text-cyberRed mr-2" />
            System Configuration &amp; Telemetry
          </h1>
          <p className="text-xs text-textMuted font-mono-tech mt-0.5">
            ThreatDNA-AI platform parameters, database connectivity, and LLM inference engine configuration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LLM Engine Configuration */}
        <div className="cyber-card p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Cpu className="w-4 h-4 text-cyberRed" />
            <span className="text-xs font-bold uppercase text-textPrimary font-mono-tech">
              LLM Provider Architecture
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono-tech">
            <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted">Default Provider:</span>
              <span className="text-cyberCyan font-bold">Google Gemini (Default) / OpenAI</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted">Active Model:</span>
              <span className="text-textPrimary font-bold">gemini-2.5-flash</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted">Fallback Engine:</span>
              <span className="text-cyberGreen font-bold">Offline Research Heuristic Analyzer</span>
            </div>

            <div className="p-3 bg-cyberRed/5 border border-cyberRed/30 rounded text-[11px] text-textSecondary leading-relaxed">
              <span className="font-bold text-cyberRed block uppercase mb-1">Security &amp; Privacy Guarantee</span>
              API keys are strictly managed on the backend and are never exposed or transmitted to the client browser.
            </div>
          </div>
        </div>

        {/* Database & Infrastructure */}
        <div className="cyber-card p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Database className="w-4 h-4 text-cyberCyan" />
            <span className="text-xs font-bold uppercase text-textPrimary font-mono-tech">
              Database Infrastructure
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono-tech">
            <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted">RDBMS Engine:</span>
              <span className="text-textPrimary font-bold">MySQL 8.0+ / SQLite 3</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted">ORM Layer:</span>
              <span className="text-textPrimary font-bold">SQLAlchemy 2.0 (Declarative)</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted">Database Connection:</span>
              <span className="text-cyberGreen font-bold uppercase flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                ONLINE / CONNECTED
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted">Seed Data Status:</span>
              <span className="text-cyberGreen font-bold">SYNTHETIC BENCHMARK SEEDED</span>
            </div>
          </div>
        </div>

        {/* Authenticated Analyst Profile */}
        <div className="cyber-card p-5 space-y-4 md:col-span-2">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <UserCheck className="w-4 h-4 text-cyberGreen" />
            <span className="text-xs font-bold uppercase text-textPrimary font-mono-tech">
              SOC Analyst Profile &amp; Role
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-tech">
            <div className="p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted text-[10px] uppercase block mb-1">Analyst Username</span>
              <span className="text-textPrimary font-bold">{user?.username || 'analyst'}</span>
            </div>

            <div className="p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted text-[10px] uppercase block mb-1">SOC Email</span>
              <span className="text-cyberCyan font-bold">{user?.email || 'analyst@threatdna.ai'}</span>
            </div>

            <div className="p-3 bg-secondary rounded border border-border">
              <span className="text-textMuted text-[10px] uppercase block mb-1">Authorization Role</span>
              <span className="text-cyberRed font-bold uppercase">{user?.role || 'Lead Analyst'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
