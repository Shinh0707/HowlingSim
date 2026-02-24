import React from 'react';
import { AudioObject } from '@/types/audio';
import { Volume2, VolumeX } from 'lucide-react';

interface ObjectControlsProps {
  object: AudioObject;
  onChange: (id: string, changes: Partial<AudioObject>) => void;
}

export const ObjectControls: React.FC<ObjectControlsProps> = ({ object, onChange }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-200">
          {object.type === 'speaker' ? 'Speaker' : 'Microphone'} Settings
        </h3>
        <button
          onClick={() => onChange(object.id, { muted: !object.muted })}
          className={`p-2 rounded-md ${object.muted ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}
        >
          {object.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Gain</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={object.gain}
          onChange={(e) => onChange(object.id, { gain: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>{(object.gain * 100).toFixed(0)}%</span>
          <span>200%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div className="bg-slate-900 p-2 rounded">
          X: {object.position.x.toFixed(2)}m
        </div>
        <div className="bg-slate-900 p-2 rounded">
          Y: {object.position.y.toFixed(2)}m
        </div>
      </div>
    </div>
  );
};
