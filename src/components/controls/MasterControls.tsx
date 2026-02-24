import React from 'react';

interface MasterControlsProps {
  volume: number;
  dryWet: number;
  onVolumeChange: (val: number) => void;
  onDryWetChange: (val: number) => void;
}

export const MasterControls: React.FC<MasterControlsProps> = ({
  volume,
  dryWet,
  onVolumeChange,
  onDryWetChange
}) => {
  return (
    <div className="flex gap-6 items-center">
      <div className="flex flex-col gap-1 w-32">
        <label className="text-xs font-bold text-slate-500 uppercase">Master Vol</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="flex flex-col gap-1 w-32">
        <label className="text-xs font-bold text-slate-500 uppercase">Dry / Wet</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={dryWet}
          onChange={(e) => onDryWetChange(parseFloat(e.target.value))}
          className="h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-slate-600 uppercase font-mono">
          <span>Source</span>
          <span>Feedback</span>
        </div>
      </div>
    </div>
  );
};
