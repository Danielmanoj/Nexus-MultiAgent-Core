
import React, { useState } from 'react';
import { FileData } from '../types';
import JSZip from 'jszip';

export const CodeEditor: React.FC<{ files: FileData[] }> = ({ files }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadProject = async () => {
    if (files.length === 0) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      files.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexus-project-${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate zip:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (files.length === 0) {
    return (
      <div className="w-96 bg-[#0a0a0a] border-l border-zinc-800 flex flex-col items-center justify-center text-zinc-700">
        <div className="w-16 h-16 border border-zinc-900 rounded-xl flex items-center justify-center mb-4 bg-zinc-950/50">
          <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-40">Repository Empty</p>
      </div>
    );
  }

  const activeFile = files[activeFileIndex];

  return (
    <div className="w-[500px] bg-[#0d0d0d] border-l border-zinc-800 flex flex-col shadow-2xl">
      {/* File Explorer Header */}
      <div className="h-11 border-b border-zinc-800 flex items-center bg-[#111] px-2 overflow-x-auto no-scrollbar">
        {files.map((file, idx) => (
          <button
            key={file.name}
            onClick={() => setActiveFileIndex(idx)}
            className={`px-4 h-full flex items-center space-x-2 text-[11px] font-bold uppercase tracking-tight transition-all relative ${
              idx === activeFileIndex 
                ? 'text-white border-b-2 border-red-600 bg-white/5' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-auto bg-[#080808] p-5 font-mono text-[12px] leading-relaxed selection:bg-red-900/30">
        <pre className="text-zinc-300">
          <code className={`language-${activeFile.language}`}>
            {activeFile.content}
          </code>
        </pre>
      </div>
      
      {/* Footer with Metadata and Download Action */}
      <div className="p-3 bg-[#111] border-t border-zinc-800 flex justify-between items-center">
        <div className="flex flex-col space-y-0.5">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Language: {activeFile.language}</span>
          <span className="text-[9px] text-zinc-600 font-mono">Lines: {activeFile.content.split('\n').length}</span>
        </div>
        
        <button 
          onClick={downloadProject}
          disabled={isDownloading}
          className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-red-700 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isDownloading ? (
            <span className="animate-pulse">Packaging...</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download ZIP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
