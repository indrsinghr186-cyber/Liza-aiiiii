import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, X, Search, Pin, Trash2, Plus, Download, Upload, 
  Tag, Clock, Sparkles, Database, CheckCircle2, ShieldCheck, Share2
} from 'lucide-react';
import { LizaMemory, getTimeRemainingText } from '../services/memoryService';

interface KnowledgeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: LizaMemory[];
  onAddMemory: (key: string, value: string, memoryType: 'session' | 'long_term', detail?: string) => void;
  onDeleteMemory: (id: string) => void;
  onTogglePermanent: (id: string) => void;
  onClearAll: () => void;
  playClickSound?: () => void;
}

const CATEGORY_TAGS = ['All', 'Personal', 'Work', 'Health', 'Finance', 'Preferences', 'Important', 'Credentials'];

export const KnowledgeVaultModal: React.FC<KnowledgeVaultModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onTogglePermanent,
  onClearAll,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [viewMode, setViewMode] = useState<'cards' | 'graph'>('cards');
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<'session' | 'long_term'>('long_term');
  const [newTag, setNewTag] = useState('Personal');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.detail && m.detail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'All' || (m.detail && m.detail.toLowerCase().includes(selectedTag.toLowerCase()));
    return matchesSearch && matchesTag;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    playClickSound?.();
    onAddMemory(newKey.trim(), newValue.trim(), newType, newTag);
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
  };

  const handleExportJSON = () => {
    playClickSound?.();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `liza_knowledge_vault_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    playClickSound?.();
    let md = `# 🧠 RAWAT AI (LIZA) — Personal Knowledge Vault Export\n\nExported on: ${new Date().toLocaleString()}\nTotal Records: ${memories.length}\n\n---\n\n`;
    memories.forEach((m, idx) => {
      md += `### ${idx + 1}. ${m.key} [${m.memoryType === 'long_term' ? '📌 Permanent' : '⏳ 24h Rolling'}]\n`;
      md += `- **Value**: ${m.value}\n`;
      if (m.detail) md += `- **Category/Tag**: ${m.detail}\n`;
      md += `- **Created**: ${new Date(m.createdAt).toLocaleString()}\n\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `liza_knowledge_vault_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-4xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Personal Knowledge Vault
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-normal">
                  {memories.length} Nodes
                </span>
              </h2>
              <p className="text-xs text-slate-400">Permanent Knowledge & 24-Hour Rolling Memory Storage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { playClickSound?.(); setViewMode(viewMode === 'cards' ? 'graph' : 'cards'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                viewMode === 'graph' 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              {viewMode === 'cards' ? 'Graph View' : 'Card View'}
            </button>
            <button
              onClick={() => { playClickSound?.(); onClose(); }}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search knowledge nodes, topics, preferences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={() => { playClickSound?.(); setIsAdding(!isAdding); }}
              className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Node
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportMarkdown}
              title="Export as Markdown (.md)"
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Markdown
            </button>
            <button
              onClick={handleExportJSON}
              title="Export JSON Backup"
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              JSON
            </button>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="px-4 py-2 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {CATEGORY_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => { playClickSound?.(); setSelectedTag(tag); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Add Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreate}
                className="p-4 rounded-xl bg-slate-800/80 border border-cyan-500/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Add Knowledge Node
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Topic / Key Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Wi-Fi Password, Favorite Food, Project Repo"
                      value={newKey}
                      onChange={e => setNewKey(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] text-slate-400 mb-1">Category Tag</label>
                      <select
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        {CATEGORY_TAGS.filter(t => t !== 'All').map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] text-slate-400 mb-1">Storage Type</label>
                      <select
                        value={newType}
                        onChange={e => setNewType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="long_term">📌 Permanent (Lifetime)</option>
                        <option value="session">⏳ 24-Hour Rolling</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Detailed Content</label>
                  <textarea
                    placeholder="Enter the complete note, details, or preferences remembered by LIZA..."
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Save to Vault
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Graph View Simulator */}
          {viewMode === 'graph' ? (
            <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0,transparent_70%)] pointer-events-none" />
              {/* Central AI Node */}
              <div className="relative z-10 p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2 mb-8">
                <Brain className="w-5 h-5" />
                LIZA CORE BRAIN
              </div>
              {/* Surrounding Nodes */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 max-w-lg">
                {filteredMemories.slice(0, 12).map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 ${
                      m.memoryType === 'long_term'
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                        : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    {m.key}
                  </motion.div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-6 relative z-10">
                Connected Neural Knowledge Network ({filteredMemories.length} Active Memory Clusters)
              </p>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMemories.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                  <Brain className="w-10 h-10 mb-2 opacity-30 text-cyan-400" />
                  <p className="text-sm font-medium">No knowledge nodes found</p>
                  <p className="text-xs text-slate-600 mt-1">Say "Liza memoize this" or click "New Node" above to add.</p>
                </div>
              ) : (
                filteredMemories.map(m => (
                  <motion.div
                    key={m.id}
                    layout
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                          {m.memoryType === 'long_term' ? (
                            <Pin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="truncate">{m.key}</span>
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { playClickSound?.(); onTogglePermanent(m.id); }}
                            title={m.memoryType === 'long_term' ? 'Switch to 24h temporary' : 'Pin as permanent'}
                            className={`p-1 rounded text-[10px] transition-colors ${
                              m.memoryType === 'long_term' 
                                ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30' 
                                : 'bg-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {m.memoryType === 'long_term' ? 'Permanent' : '24-Hour'}
                          </button>
                          <button
                            onClick={() => { playClickSound?.(); onDeleteMemory(m.id); }}
                            title="Delete Node"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-2">
                        {m.value}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-700/50">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {m.detail || 'General'}
                      </span>
                      <span>{getTimeRemainingText(m)}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400/90 font-medium">
            <ShieldCheck className="w-4 h-4" />
            Zero Data Leakage • Local Device Encrypted
          </span>
          {memories.length > 0 && (
            <button
              onClick={() => { playClickSound?.(); onClearAll(); }}
              className="text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Clear Vault
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
