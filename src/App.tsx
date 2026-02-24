import React, { useState, useEffect, useCallback } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { DEFAULT_STATE, createObject } from '@/constants';
import { SimulationState, AudioObject, Point } from '@/types/audio';
import { Stage } from '@/components/workspace/Stage';
import { ObjectControls } from '@/components/controls/ObjectControls';
import { Transport } from '@/components/controls/Transport';
import { MasterControls } from '@/components/controls/MasterControls';
import { renderOffline } from '@/audio/OfflineRenderer';
import { Plus, Trash2, UploadCloud, AlertTriangle } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<SimulationState>(() => {
    const saved = localStorage.getItem('howling-sim-state');
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [sourceBuffer, setSourceBuffer] = useState<AudioBuffer | null>(null);

  const engine = useAudioEngine();

  // Sync state to engine
  useEffect(() => {
    engine.updateState(state);
  }, [state, engine]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('howling-sim-state', JSON.stringify(state));
  }, [state]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      await engine.initAudio();
      const buffer = await engine.graph.loadFile(file);
      setSourceBuffer(buffer);
      engine.graph.createSource(buffer);
    }
  };

  const handleObjectMove = (id: string, pos: Point) => {
    setState(prev => ({
      ...prev,
      objects: prev.objects.map(o => o.id === id ? { ...o, position: pos } : o)
    }));
  };

  const handleObjectChange = (id: string, changes: Partial<AudioObject>) => {
    setState(prev => ({
      ...prev,
      objects: prev.objects.map(o => o.id === id ? { ...o, ...changes } : o)
    }));
  };

  const handleAddObject = (type: 'speaker' | 'microphone') => {
    const newObj = createObject(type, state.roomSize);
    setState(prev => ({
      ...prev,
      objects: [...prev.objects, newObj]
    }));
    setSelectedId(newObj.id);
  };

  const handleDeleteObject = (id: string) => {
    setState(prev => ({
      ...prev,
      objects: prev.objects.filter(o => o.id !== id)
    }));
    if (selectedId === id) setSelectedId(null);
  };

  const handleExport = async () => {
    if (!sourceBuffer) {
      alert("Please load an audio file first.");
      return;
    }
    setIsExporting(true);
    try {
      const blob = await renderOffline(sourceBuffer, state);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'howling-simulation.wav';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveState = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation-state.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadState = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const newState = JSON.parse(ev.target?.result as string);
          setState(newState);
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const selectedObject = state.objects.find(o => o.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <AlertTriangle size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Howling Sim <span className="text-xs font-normal text-slate-500 ml-2 border border-slate-700 px-2 py-0.5 rounded-full">Safe Mode</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors text-sm font-medium border border-slate-700">
             <UploadCloud size={16} />
             {audioFile ? audioFile.name.slice(0, 20) + '...' : 'Upload Audio'}
             <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
           </label>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left Column: Stage & Master */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 p-1 rounded-2xl border border-slate-800 shadow-xl">
             <Stage 
               objects={state.objects} 
               roomSize={state.roomSize}
               onObjectMove={handleObjectMove}
               selectedId={selectedId}
               onSelect={setSelectedId}
             />
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-wrap gap-8 items-center justify-between">
            <MasterControls 
              volume={state.masterVolume}
              dryWet={state.dryWet}
              onVolumeChange={(v) => setState(s => ({ ...s, masterVolume: v }))}
              onDryWetChange={(v) => setState(s => ({ ...s, dryWet: v }))}
            />
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleAddObject('speaker')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold transition-colors"
              >
                <Plus size={16} /> Add Speaker
              </button>
              <button 
                onClick={() => handleAddObject('microphone')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold transition-colors"
              >
                <Plus size={16} /> Add Mic
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Inspector */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 h-full min-h-[400px] flex flex-col">
            <div className="p-4 border-b border-slate-800">
              <h2 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Inspector</h2>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {selectedObject ? (
                <div className="space-y-6">
                  <ObjectControls 
                    object={selectedObject} 
                    onChange={handleObjectChange}
                  />
                  
                  <button 
                    onClick={() => handleDeleteObject(selectedObject.id)}
                    className="w-full py-3 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                  >
                    <Trash2 size={16} /> Remove Object
                  </button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                  Select an object to edit properties
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Transport */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-800 z-50">
        <div className="max-w-7xl mx-auto">
          <Transport 
            isPlaying={engine.isPlaying}
            onPlayToggle={engine.togglePlay}
            onExport={handleExport}
            onSave={handleSaveState}
            onLoadState={handleLoadState}
          />
        </div>
      </div>
      
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-[100]">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 text-center animate-pulse">
            <h3 className="text-xl font-bold text-white mb-2">Rendering Audio...</h3>
            <p className="text-slate-400">Please wait while we simulate the feedback loop.</p>
          </div>
        </div>
      )}
    </div>
  );
}
