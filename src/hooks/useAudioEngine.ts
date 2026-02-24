import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioGraph } from '@/audio/AudioGraph';
import { FeedbackManager } from '@/audio/FeedbackManager';
import { AudioObject, SimulationState } from '@/types/audio';

export function useAudioEngine() {
  const [graph] = useState(() => new AudioGraph());
  const [manager] = useState(() => new FeedbackManager(graph));
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize context on user interaction
  const initAudio = useCallback(async () => {
    if (graph.ctx.state === 'suspended') {
      await graph.ctx.resume();
    }
  }, [graph]);

  const loadAudio = useCallback(async (file: File) => {
    const buffer = await graph.loadFile(file);
    const source = graph.createSource(buffer);
    // Reconnect logic will happen in updateState
    return buffer.duration;
  }, [graph]);

  const togglePlay = useCallback(() => {
    if (!graph.sourceNode) return;
    
    if (isPlaying) {
      graph.ctx.suspend();
      setIsPlaying(false);
    } else {
      graph.ctx.resume();
      if (graph.sourceNode) {
          try {
            graph.sourceNode.start(0);
          } catch(e) {
             // Already started, just resume context
          }
      }
      setIsPlaying(true);
    }
  }, [graph, isPlaying]);

  const updateState = useCallback((state: SimulationState) => {
    // Update Master Volume
    graph.masterGain.gain.setTargetAtTime(state.masterVolume, graph.ctx.currentTime, 0.1);
    
    // Update Wet/Dry
    graph.dryGain.gain.setTargetAtTime(1 - state.dryWet, graph.ctx.currentTime, 0.1);
    graph.wetGain.gain.setTargetAtTime(state.dryWet, graph.ctx.currentTime, 0.1);

    // Update Topology
    manager.updateTopology(state.objects);
  }, [graph, manager]);

  return {
    initAudio,
    loadAudio,
    togglePlay,
    isPlaying,
    updateState,
    graph
  };
}
