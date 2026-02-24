import React, { useRef, useEffect } from 'react';
import { AudioObject, Point } from '@/types/audio';
import { Mic, Speaker } from 'lucide-react';

interface StageProps {
  objects: AudioObject[];
  roomSize: Point;
  onObjectMove: (id: string, pos: Point) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const Stage: React.FC<StageProps> = ({ 
  objects, 
  roomSize, 
  onObjectMove,
  selectedId,
  onSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<string | null>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    isDragging.current = id;
    onSelect(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
    
    // Convert to meters
    const scaleX = roomSize.x / rect.width;
    const scaleY = roomSize.y / rect.height;
    
    onObjectMove(isDragging.current, {
      x: x * scaleX,
      y: y * scaleY
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }} 
      />

      {objects.map(obj => {
        // Convert meters to %
        const left = (obj.position.x / roomSize.x) * 100;
        const top = (obj.position.y / roomSize.y) * 100;

        return (
          <div
            key={obj.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2 rounded-full transition-colors ${
              selectedId === obj.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-600'
            }`}
            style={{ left: `${left}%`, top: `${top}%` }}
            onPointerDown={(e) => handlePointerDown(e, obj.id)}
          >
            {obj.type === 'speaker' ? <Speaker size={20} /> : <Mic size={20} />}
          </div>
        );
      })}
    </div>
  );
};
