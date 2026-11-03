import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, IndianRupee, Plus, Trash2, PieChart, TrendingUp, ShieldAlert, Sparkles, CreditCard } from 'lucide-react';
import { megaFeaturesService, ExpenseItem } from '../../services/megaFeaturesService';

interface SmartExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound?: () => void;
}

export const SmartExpenseModal: React.FC<SmartExpenseModalProps> = ({
  isOpen,
  onClose,
  playClickSound
}) => {
  if (!isOpen) return null;

  const [expenses, setExpenses] = useState<ExpenseItem[]>(megaFeaturesService.getExpenses());
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<ExpenseItem['category']>('Food');

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) return;

    megaFeaturesService.addExpense({
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      amount: val,
      category: categoryInput,
      note: noteInput.trim() || categoryInput
    });

    setExpenses(megaFeaturesService.getExpenses());
    setAmountInput('');
    setNoteInput('');
    if (playClickSound) playClickSound();
  };

  const handleDelete = (id: string) => {
    megaFeaturesService.deleteExpense(id);
    setExpenses(megaFeaturesService.getExpenses());
    if (playClickSound) playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-900 border border-green-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="text-green-400" size={20} />
            <h2 className="text-lg font-bold text-white font-mono-spec">LIZA Pocket Expense & Smart Budget</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-300">
          {/* Total Spent Summary Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-green-950/60 to-neutral-950 border border-green-500/20 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono-spec text-green-300 uppercase tracking-wider block">Total Tracked Spends</span>
              <div className="text-3xl font-black font-mono-spec text-white">
                ₹{totalSpent.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block font-mono-spec">Monthly Budget: ₹15,000</span>
              <span className="text-xs font-bold text-green-400 font-mono-spec">
                {Math.max(0, 15000 - totalSpent) > 0 ? `₹${(15000 - totalSpent).toLocaleString('en-IN')} Left` : 'Exceeded'}
              </span>
            </div>
          </div>

          {/* Add Expense Form */}
          <form onSubmit={handleAddExpense} className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">₹</span>
                <input
                  type="number"
                  placeholder="Amount (e.g. 150)"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 pl-6 pr-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value as any)}
                className="bg-neutral-900 border border-white/10 px-2 py-1.5 rounded-lg text-xs text-green-300 focus:outline-none"
              >
                <option value="Food">🍔 Food</option>
                <option value="Travel">🚕 Travel</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Bills">💡 Bills</option>
                <option value="Entertainment">🎮 Entertainment</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Note (e.g., Chai with friends, Metro ticket)..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="flex-1 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Add Expense
              </button>
            </div>
          </form>

          {/* Expense Log List */}
          <div className="space-y-2">
            <span className="text-xs font-bold font-mono-spec text-neutral-400 uppercase tracking-wider block">
              Recent Spends ({expenses.length})
            </span>

            {expenses.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-500">
                No expense entries yet. Track your daily spending to master your budget!
              </div>
            ) : (
              expenses.map(exp => (
                <div key={exp.id} className="p-3 bg-neutral-950/70 border border-white/10 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-xs text-white">{exp.note}</div>
                    <div className="text-[10px] text-neutral-400 font-mono-spec">{exp.date} • {exp.category}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs font-mono-spec text-green-400">₹{exp.amount}</span>
                    <button 
                      onClick={() => handleDelete(exp.id)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
