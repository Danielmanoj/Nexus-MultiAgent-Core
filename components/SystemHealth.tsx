
import React, { useState, useEffect } from 'react';
import { SystemMetrics, GitState } from '../types';

export const SystemHealth: React.FC<{ isProcessing: boolean, git: GitState }> = ({ isProcessing, git }) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 12,
    memory: 4.2,
    activeAgents: 0,
    networkLatency: 45
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: isProcessing ? Math.floor(Math.random() * 40) + 40 : Math.floor(Math.random() * 10) + 5,
        memory: isProcessing ? 6.8 + Math.random() : 4.2 + (Math.random() * 0.2),
        activeAgents: isProcessing ? 4 : 0,
        networkLatency: Math.floor(Math.random() * 30) + 20
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="bg-zinc-900 border-r border-zinc-800 w-72 h-full flex flex-col p-4 space-y-6 overflow-y-auto">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">System Health</h2>
      </div>

      <div className="space-y-4">
        <MetricCard label="CPU Usage" value={`${metrics.cpu}%`} percent={metrics.cpu} />
        <MetricCard label="Memory Allocation" value={`${metrics.memory.toFixed(1)} GB`} percent={(metrics.memory / 16) * 100} />
        <MetricCard label="Network Latency" value={`${metrics.networkLatency} ms`} percent={metrics.networkLatency / 2} />
        <MetricCard label="Active Agents" value={metrics.activeAgents.toString()} percent={metrics.activeAgents * 25} />
      </div>

      <div className="border-t border-zinc-800 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Git Status</h3>
          {git.isInitialized && (
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
              {git.branch}
            </span>
          )}
        </div>
        
        {!git.isInitialized ? (
          <p className="text-xs text-zinc-600 italic">No repository detected</p>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-col space-y-3">
              {git.history.length === 0 ? (
                <p className="text-xs text-zinc-600">Initial commit pending...</p>
              ) : (
                git.history.slice(0, 5).map((commit) => (
                  <div key={commit.id} className="text-[11px] border-l border-zinc-700 pl-3 relative">
                    <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900"></div>
                    <p className="text-zinc-300 font-medium truncate" title={commit.message}>{commit.message}</p>
                    <div className="flex justify-between text-zinc-500 mt-0.5">
                      <span className="font-mono text-[9px] text-blue-500/70">{commit.hash}</span>
                      <span>{commit.author}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-zinc-800 pt-4">
        <h3 className="text-xs font-bold text-zinc-500 mb-2">CONNECTED AGENTS</h3>
        <ul className="space-y-2 text-xs">
          <AgentStatus name="Orchestrator v2.1" status="Ready" />
          <AgentStatus name="Architect-Llama-70B" status="Ready" />
          <AgentStatus name="Coder-Flash-Latest" status="Ready" />
          <AgentStatus name="QA-Validator" status="Ready" />
          <AgentStatus name="Sec-Audit-Core" status="Ready" />
          <AgentStatus name="Git-Engine" status="Active" />
        </ul>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, percent: number }> = ({ label, value, percent }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-medium">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300">{value}</span>
    </div>
    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
        style={{ width: `${Math.min(percent, 100)}%` }}
      ></div>
    </div>
  </div>
);

const AgentStatus: React.FC<{ name: string, status: string }> = ({ name, status }) => (
  <li className="flex items-center justify-between text-zinc-400">
    <span>{name}</span>
    <span className="text-green-500 text-[10px] bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">{status}</span>
  </li>
);
