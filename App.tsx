
import React, { useState, useCallback } from 'react';
import { AgentRole, LogEntry, FileData, GitState, GitCommit } from './types';
import { SystemHealth } from './components/SystemHealth';
import { AgentTerminal } from './components/AgentTerminal';
import { CodeEditor } from './components/CodeEditor';
import { getGeminiResponse, getStructuredOutput } from './geminiService';
import { Type } from "@google/genai";

const App: React.FC = () => {
  const [requirement, setRequirement] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [git, setGit] = useState<GitState>({
    branch: 'main',
    history: [],
    isInitialized: false
  });

  const addLog = (role: AgentRole, message: string, type: 'log' | 'error' | 'success' | 'info' | 'git' = 'log') => {
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        role,
        message,
        timestamp: new Date(),
        type
      }
    ]);
  };

  const simulateGitAction = async (action: string, branch?: string, commitMsg?: string) => {
    addLog(AgentRole.GIT_ENGINE, action, 'git');
    await new Promise(r => setTimeout(r, 600)); // Faster simulated IO for better UX

    if (action.includes('git init')) {
      setGit(prev => ({ ...prev, isInitialized: true }));
    } else if (action.includes('git checkout -b')) {
      setGit(prev => ({ ...prev, branch: branch || prev.branch }));
    } else if (action.includes('git commit')) {
      const newCommit: GitCommit = {
        id: Math.random().toString(36).substr(2, 9),
        hash: Math.random().toString(16).substr(2, 7),
        message: commitMsg || "Update files",
        author: "nexus-daemon",
        timestamp: new Date()
      };
      setGit(prev => ({
        ...prev,
        history: [newCommit, ...prev.history]
      }));
    }
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement.trim() || isProcessing) return;

    setIsProcessing(true);
    setLogs([]);
    setFiles([]);

    try {
      // 0. Git Initialization
      if (!git.isInitialized) {
        await simulateGitAction('git init --initial-branch=main');
        await simulateGitAction('git commit -m "Initial commit" --allow-empty');
      }

      // 1. Orchestrator Starts
      addLog(AgentRole.ORCHESTRATOR, `Bootstrapping pipeline for: "${requirement}"`, 'info');
      const featureBranch = `feat/${requirement.toLowerCase().replace(/\s+/g, '-').slice(0, 15)}`;
      await simulateGitAction(`git checkout -b ${featureBranch}`, featureBranch);
      
      addLog(AgentRole.ORCHESTRATOR, "Parsing requirements and delegating to Architect...");

      // 2. Architect Phase
      const architectSchema = {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          filesNeeded: { 
            type: Type.ARRAY, 
            items: { 
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    language: { type: Type.STRING },
                    purpose: { type: Type.STRING }
                },
                required: ["name", "language", "purpose"]
            }
          }
        },
        required: ["analysis", "filesNeeded"]
      };

      const architectResult = await getStructuredOutput(
        `Plan the architecture for: ${requirement}. Suggest a set of files and their purpose.`,
        architectSchema
      );

      addLog(AgentRole.ARCHITECT, `Architecture Analysis: ${architectResult.analysis}`);
      architectResult.filesNeeded.forEach((f: any) => {
        addLog(AgentRole.ARCHITECT, `Staging file: ${f.name} (${f.language})`);
      });

      // 3. Coder Phase
      addLog(AgentRole.CODER, "Generating source code implementation...");
      
      const coderSchema = {
        type: Type.OBJECT,
        properties: {
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                language: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["name", "language", "content"]
            }
          }
        },
        required: ["files"]
      };

      const coderResult = await getStructuredOutput(
        `Generate code for the following files: ${JSON.stringify(architectResult.filesNeeded)}. Context: ${requirement}`,
        coderSchema
      );

      setFiles(coderResult.files);
      addLog(AgentRole.CODER, `Codegen complete: ${coderResult.files.length} artifacts created.`, 'success');
      
      await simulateGitAction(`git add . && git commit -m "feat: implement ${requirement}"`, undefined, `feat: implement ${requirement}`);

      // 4. QA Phase
      addLog(AgentRole.QA, "Executing validation suite...");
      const qaResponse = await getGeminiResponse(
        `Verify for bugs: ${JSON.stringify(coderResult.files)}`,
        'QA',
        'Be critical. Find potential bugs and edge cases.'
      );
      addLog(AgentRole.QA, qaResponse);
      
      await simulateGitAction(`git commit -am "fix: resolve edge cases from QA audit"`, undefined, "fix: resolve edge cases from QA audit");

      // 5. Security Auditor Phase
      addLog(AgentRole.SECURITY, "Scanning for CVEs and insecure patterns...");
      const securityResponse = await getGeminiResponse(
        `Security audit: ${JSON.stringify(coderResult.files)}`,
        'Security',
        'Look for XSS, SQLi, and other vulnerabilities.'
      );
      addLog(AgentRole.SECURITY, securityResponse);
      
      await simulateGitAction(`git commit -am "security: patch identified vulnerabilities"`, undefined, "security: patch identified vulnerabilities");

      addLog(AgentRole.ORCHESTRATOR, "Pipeline successful. Merging to main...", 'success');
      await simulateGitAction(`git checkout main`, 'main');
      await simulateGitAction(`git merge ${featureBranch}`, 'main', `Merge branch '${featureBranch}'`);

    } catch (err) {
      addLog(AgentRole.ORCHESTRATOR, "Fatal error in coordination loop.", 'error');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#050505] select-none text-zinc-300">
      {/* Sidebar */}
      <SystemHealth isProcessing={isProcessing} git={git} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col p-5 space-y-4">
        <header className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <div className="flex items-center space-x-4">
            <div className="bg-red-700 p-2.5 rounded shadow-[0_0_15px_rgba(185,28,28,0.2)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter italic">NEXUS<span className="text-red-600 font-light">_CORP</span></h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Autonomous Dev Pipeline</p>
            </div>
          </div>

          <form onSubmit={handleProcess} className="flex-1 max-w-xl mx-12">
            <div className="relative">
              <input 
                type="text" 
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="PROMPT: Software Requirement Specification..."
                disabled={isProcessing}
                className="w-full bg-[#0c0c0c] border border-zinc-800 rounded px-6 py-3.5 text-xs font-mono focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all text-white placeholder-zinc-700 uppercase"
              />
              <button 
                type="submit"
                disabled={isProcessing || !requirement.trim()}
                className="absolute right-2 top-2 bg-red-700 hover:bg-red-600 disabled:bg-zinc-900 disabled:text-zinc-700 px-5 py-1.5 rounded text-[10px] font-black text-white transition-all uppercase"
              >
                {isProcessing ? 'BUSY' : 'EXECUTE'}
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-6">
            <div className="text-right">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">System Load</p>
                <div className="flex space-x-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-2.5 w-1 ${i < (isProcessing ? 4 : 1) ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
                  ))}
                </div>
            </div>
          </div>
        </header>

        {/* Central Log View */}
        <AgentTerminal logs={logs} />
      </div>

      {/* Code Editor */}
      <CodeEditor files={files} />
    </div>
  );
};

export default App;
