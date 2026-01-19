
import React, { useRef, useEffect } from 'react';
import { LogEntry, AgentRole } from '../types';

export const AgentTerminal: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getRoleLabel = (role: AgentRole) => {
    switch (role) {
      case AgentRole.ORCHESTRATOR: return 'orchestrator';
      case AgentRole.ARCHITECT: return 'architect';
      case AgentRole.CODER: return 'coder';
      case AgentRole.QA: return 'qa-eng';
      case AgentRole.SECURITY: return 'sec-audit';
      case AgentRole.GIT_ENGINE: return 'git-vcs';
      default: return 'system';
    }
  };

  const getLogColor = (log: LogEntry) => {
    if (log.type === 'error') return 'text-red-500';
    if (log.type === 'success') return 'text-green-500';
    if (log.type === 'git') return 'text-cyan-400';
    if (log.type === 'info') return 'text-blue-400';
    return 'text-zinc-100';
  };

  return (
    <div className="flex-1 bg-[#0c0c0c] border border-zinc-800 rounded shadow-2xl font-mono text-[13px] overflow-hidden flex flex-col">
      {/* Terminal Header - Red Hat Style */}
      <div className="bg-[#1a1a1a] px-3 py-1.5 border-b border-red-900/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Nexus Console v4.2.0-stable</span>
        </div>
        <div className="flex space-x-3 text-[10px] text-zinc-600">
          <span>TTY1</span>
          <span>SSH_AUTH_SOCK</span>
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 space-y-1.5 selection:bg-red-600 selection:text-white">
        {logs.length === 0 && (
          <div className="text-zinc-700 italic">
            [nexus-system@localhost ~]$ _
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="agent-fade-in group">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-2">
              <span className="text-zinc-600 whitespace-nowrap">
                [{log.timestamp.toLocaleTimeString([], { hour12: false })}]
              </span>
              <span className="text-zinc-500 font-bold">
                [{getRoleLabel(log.role)}@nexus-core ~]$
              </span>
              <span className={`${getLogColor(log)} break-words leading-relaxed flex-1`}>
                {log.message}
              </span>
            </div>
          </div>
        ))}
        {logs.length > 0 && <div className="text-zinc-100 terminal-cursor font-bold pt-2">
          [nexus-system@localhost ~]$ 
        </div>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
