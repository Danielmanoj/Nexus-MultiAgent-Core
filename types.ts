
export enum AgentRole {
  ORCHESTRATOR = 'ORCHESTRATOR',
  ARCHITECT = 'ARCHITECT',
  CODER = 'CODER',
  QA = 'QA_ENGINEER',
  SECURITY = 'SECURITY_AUDITOR',
  GIT_ENGINE = 'GIT_ENGINE'
}

export interface LogEntry {
  id: string;
  role: AgentRole;
  message: string;
  timestamp: Date;
  type: 'log' | 'error' | 'success' | 'info' | 'git';
}

export interface FileData {
  name: string;
  language: string;
  content: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  activeAgents: number;
  networkLatency: number;
}

export interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
}

export interface GitState {
  branch: string;
  history: GitCommit[];
  isInitialized: boolean;
}
