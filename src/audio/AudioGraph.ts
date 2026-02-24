import { AudioObject, SPEED_OF_SOUND } from '@/types/audio';
import { calculateDistance } from '@/utils/math';

export class AudioGraph {
  ctx: AudioContext;
  destination: AudioNode;
  
  // Nodes
  sourceNode: MediaElementAudioSourceNode | AudioBufferSourceNode | null = null;
  masterGain: GainNode;
  compressor: DynamicsCompressorNode;
  
  // Feedback Loop Elements
  micNodes: Map<string, GainNode> = new Map();
  speakerNodes: Map<string, GainNode> = new Map();
  delayNodes: Map<string, DelayNode> = new Map();
  attenuationNodes: Map<string, GainNode> = new Map();
  
  // Main Mixer
  dryGain: GainNode;
  wetGain: GainNode;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Master Output Chain (Safety First!)
    this.masterGain = this.ctx.createGain();
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -10;
    this.compressor.ratio.value = 12;
    
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
    
    this.destination = this.masterGain;

    // Wet/Dry
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();
    
    this.dryGain.connect(this.masterGain);
    this.wetGain.connect(this.masterGain);
  }

  async loadFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    return await this.ctx.decodeAudioData(arrayBuffer);
  }

  createSource(buffer: AudioBuffer) {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    this.sourceNode = source;
    
    // Connect Source to Dry (Direct Monitoring)
    source.connect(this.dryGain);
    
    return source;
  }

  // ... connection logic will be added in next steps
}
