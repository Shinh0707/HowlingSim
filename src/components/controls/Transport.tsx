import React from 'react';
import { Play, Pause, Download, Save, Upload } from 'lucide-react';

interface TransportProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  onExport: () => void;
  onSave: () => void;
  onLoadState: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Transport: React.FC<TransportProps> = ({
  isPlaying,
  onPlayToggle,
  onExport,
  onSave,
  onLoadState
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800 border-t border-slate-700">
      <button
        onClick={onPlayToggle}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
          isPlaying 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        {isPlaying ? 'STOP' : 'SIMULATE'}
      </button>

      <div className="h-8 w-px bg-slate-700 mx-2" />

      <button onClick={onExport} className="p-2 text-slate-400 hover:text-indigo-400 transition-colors" title="Export Audio">
        <Download size={20} />
      </button>
      
      <button onClick={onSave} className="p-2 text-slate-400 hover:text-indigo-400 transition-colors" title="Save State">
        <Save size={20} />
      </button>
      
      <label className="p-2 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer" title="Load State">
        <Upload size={20} />
        <input type="file" accept=".json" onChange={onLoadState} className="hidden" />
      </label>
    </div>
  );
};
