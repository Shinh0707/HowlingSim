import { AudioGraph } from './AudioGraph';
import { AudioObject, SPEED_OF_SOUND } from '@/types/audio';
import { calculateDistance } from '@/utils/math';

export class FeedbackManager {
  graph: AudioGraph;

  constructor(graph: AudioGraph) {
    this.graph = graph;
  }

  updateTopology(objects: AudioObject[]) {
    const speakers = objects.filter(o => o.type === 'speaker');
    const mics = objects.filter(o => o.type === 'microphone');

    // Reset connections (simplified for now, ideally we diff)
    // In a real app, we'd be more careful about not recreating nodes constantly
    // For this demo, we'll update params where possible
    
    // 1. Ensure all objects have nodes
    objects.forEach(obj => {
      if (obj.type === 'speaker') {
        if (!this.graph.speakerNodes.has(obj.id)) {
          const node = this.graph.ctx.createGain();
          this.graph.speakerNodes.set(obj.id, node);
          // Speaker goes to Wet Output
          node.connect(this.graph.wetGain);
        }
        // Update Gain
        const node = this.graph.speakerNodes.get(obj.id)!;
        node.gain.setTargetAtTime(obj.muted ? 0 : obj.gain, this.graph.ctx.currentTime, 0.1);
      } else {
        if (!this.graph.micNodes.has(obj.id)) {
          const node = this.graph.ctx.createGain();
          this.graph.micNodes.set(obj.id, node);
        }
        // Update Gain
        const node = this.graph.micNodes.get(obj.id)!;
        node.gain.setTargetAtTime(obj.muted ? 0 : obj.gain, this.graph.ctx.currentTime, 0.1);
      }
    });

    // 2. Connect Source -> Speakers
    if (this.graph.sourceNode) {
      // Disconnect old fan-out? 
      // For simplicity, we assume source connects to all speakers for now
      // Or we can implement a matrix.
      // Let's connect source to all speakers.
      speakers.forEach(spk => {
         const spkNode = this.graph.speakerNodes.get(spk.id);
         if(spkNode) {
             // Check if already connected? WebAudio doesn't strictly require check, 
             // but multiple connections sum up.
             // We'll handle this by having a "SourceDistribution" gain node if needed.
             // For now, let's just connect.
             try {
               this.graph.sourceNode!.connect(spkNode);
             } catch(e) { /* ignore already connected */ }
         }
      });
    }

    // 3. Connect Speakers -> Air -> Mics (The Feedback Matrix)
    speakers.forEach(spk => {
      mics.forEach(mic => {
        const connectionId = `${spk.id}-${mic.id}`;
        
        // Create or get Delay/Gain for this path
        if (!this.graph.delayNodes.has(connectionId)) {
          const delay = this.graph.ctx.createDelay(5.0); // Max 5 sec delay
          const atten = this.graph.ctx.createGain();
          
          // Speaker -> Delay -> Attenuation -> Mic
          const spkNode = this.graph.speakerNodes.get(spk.id)!;
          const micNode = this.graph.micNodes.get(mic.id)!;
          
          spkNode.connect(delay);
          delay.connect(atten);
          atten.connect(micNode);
          
          this.graph.delayNodes.set(connectionId, delay);
          this.graph.attenuationNodes.set(connectionId, atten);
        }

        // Update Physics
        const dist = calculateDistance(spk.position, mic.position);
        const delayTime = dist / SPEED_OF_SOUND;
        // Simple inverse square law approximation for gain
        // Clamp distance to avoid infinity. Min 0.1m
        const clampedDist = Math.max(0.1, dist);
        const attenuation = 1 / (clampedDist * clampedDist); 
        
        const delayNode = this.graph.delayNodes.get(connectionId)!;
        const attenNode = this.graph.attenuationNodes.get(connectionId)!;
        
        delayNode.delayTime.setTargetAtTime(delayTime, this.graph.ctx.currentTime, 0.1);
        attenNode.gain.setTargetAtTime(attenuation, this.graph.ctx.currentTime, 0.1);
      });
    });

    // 4. Connect Mics -> Speakers (The Loop Closure)
    // In a PA system, Mics go to the Mixer, which goes to Speakers.
    // We need to simulate this routing.
    // For simplicity: All Mics -> All Speakers (or specific routing).
    // Let's assume a simple "All Mics go to All Speakers" for maximum chaos, 
    // or we can add a "Mixer" node.
    
    mics.forEach(mic => {
      const micNode = this.graph.micNodes.get(mic.id)!;
      speakers.forEach(spk => {
        const spkNode = this.graph.speakerNodes.get(spk.id)!;
        // Connect Mic back to Speaker
        try {
            micNode.connect(spkNode);
        } catch (e) { /* ignore */ }
      });
    });
  }
}
