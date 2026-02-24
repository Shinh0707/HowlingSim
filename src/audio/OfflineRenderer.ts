import { SimulationState, SPEED_OF_SOUND } from '@/types/audio';
import { calculateDistance } from '@/utils/math';
import { audioBufferToWav } from '@/utils/wav';

export async function renderOffline(
  sourceBuffer: AudioBuffer,
  state: SimulationState
): Promise<Blob> {
  const duration = sourceBuffer.duration;
  // Create Offline Context
  // We use the same sample rate as the source
  const offlineCtx = new OfflineAudioContext(
    2, // Stereo output
    duration * sourceBuffer.sampleRate,
    sourceBuffer.sampleRate
  );

  // --- Recreate Graph (Simplified Copy of AudioGraph/FeedbackManager) ---
  
  // 1. Master Chain
  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = state.masterVolume;
  
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = -10;
  compressor.ratio.value = 12;

  masterGain.connect(compressor);
  compressor.connect(offlineCtx.destination);

  const dryGain = offlineCtx.createGain();
  dryGain.gain.value = 1 - state.dryWet;
  dryGain.connect(masterGain);

  const wetGain = offlineCtx.createGain();
  wetGain.gain.value = state.dryWet;
  wetGain.connect(masterGain);

  // 2. Source
  const source = offlineCtx.createBufferSource();
  source.buffer = sourceBuffer;
  source.connect(dryGain);

  // 3. Topology
  const speakers = state.objects.filter(o => o.type === 'speaker');
  const mics = state.objects.filter(o => o.type === 'microphone');

  const speakerNodes = new Map<string, GainNode>();
  const micNodes = new Map<string, GainNode>();

  // Create Nodes
  speakers.forEach(spk => {
    const node = offlineCtx.createGain();
    node.gain.value = spk.muted ? 0 : spk.gain;
    node.connect(wetGain);
    speakerNodes.set(spk.id, node);
    
    // Connect Source to Speaker
    source.connect(node);
  });

  mics.forEach(mic => {
    const node = offlineCtx.createGain();
    node.gain.value = mic.muted ? 0 : mic.gain;
    micNodes.set(mic.id, node);
    
    // Connect Mic to All Speakers (Loop)
    speakers.forEach(spk => {
      const spkNode = speakerNodes.get(spk.id);
      if (spkNode) node.connect(spkNode);
    });
  });

  // Create Feedback Matrix (Speaker -> Mic)
  speakers.forEach(spk => {
    mics.forEach(mic => {
      const dist = calculateDistance(spk.position, mic.position);
      const delayTime = dist / SPEED_OF_SOUND;
      const clampedDist = Math.max(0.1, dist);
      const attenuation = 1 / (clampedDist * clampedDist);

      const delay = offlineCtx.createDelay(10.0);
      delay.delayTime.value = delayTime;
      
      const atten = offlineCtx.createGain();
      atten.gain.value = attenuation;

      const spkNode = speakerNodes.get(spk.id)!;
      const micNode = micNodes.get(mic.id)!;

      spkNode.connect(delay);
      delay.connect(atten);
      atten.connect(micNode);
    });
  });

  // Start Source
  source.start(0);

  // Render
  const renderedBuffer = await offlineCtx.startRendering();
  
  // Convert to Blob
  const wavBuffer = audioBufferToWav(renderedBuffer);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}
