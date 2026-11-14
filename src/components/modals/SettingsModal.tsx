import React, { useState } from 'react';
import { 
  Key, 
  Trash2, 
  RotateCcw, 
  X, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  Database 
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { deviceService } from '../../services/deviceService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetSampleData: () => Promise<void>;
  onClearAllData: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetSampleData,
  onClearAllData
}) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('prep_gemini_api_key') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    aiService.setApiKey(apiKey);
    setSavedSuccess(true);
    deviceService.playSuccessSound();
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-md bg-warm-50 rounded-3xl border border-warm-200 overflow-hidden shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-warm-900">Settings & AI Configuration</h3>
          </div>
          <button onClick={onClose} className="text-warm-400 hover:text-warm-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gemini API Key */}
        <form onSubmit={handleSaveApiKey} className="bg-white p-4 rounded-2xl border border-warm-200 space-y-3">
          <div>
            <label className="text-xs font-bold text-warm-900 block">Gemini Flash API Key (Optional)</label>
            <p className="text-[11px] text-warm-500 mt-0.5">
              Prep includes high-accuracy offline heuristic rules by default. Add your Gemini API key for enhanced conversational parsing and weather analysis.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              {savedSuccess ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </form>

        {/* PWA & Local-First Architecture Status */}
        <div className="bg-white p-4 rounded-2xl border border-warm-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-warm-900 font-bold">
            <Database className="w-4 h-4 text-emerald-700" />
            Local-First Storage (Dexie.js)
          </div>
          <p className="text-[11px] text-warm-600 leading-relaxed">
            All your bags, items, documents, and checklists are stored locally in your browser's IndexedDB. No personal scans or credentials leave your device.
          </p>
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Capacitor & PWA Ready</span>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-bold text-warm-700">Data Management</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (confirm('Reset to realistic sample events and bags?')) {
                  await onResetSampleData();
                  onClose();
                }
              }}
              className="flex-1 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Samples
            </button>

            <button
              onClick={async () => {
                if (confirm('Clear all user events and checklists?')) {
                  await onClearAllData();
                  onClose();
                }
              }}
              className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
