import { useEffect, useState } from 'react';
import { useReducedMotion, motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { djb2, mulberry32 } from '../../lib/hash';

export function ChallengeCover({ slug, size = 'sm' }: { slug: string; size?: 'sm' | 'lg' }) {
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const bgX = useTransform(smoothX, [0, 1], [15, -15]);
  const bgY = useTransform(smoothY, [0, 1], [15, -15]);
  const fgX = useTransform(smoothX, [0, 1], [-25, 25]);
  const fgY = useTransform(smoothY, [0, 1], [-25, 25]);

  const height = size === 'sm' ? 120 : 200;

  // Deterministic PRNG
  const rng = mulberry32(djb2(slug));
  const colors = ['var(--success)', 'var(--accent)', 'var(--warning)', 'var(--border)'];
  
  const bgNodes = Array.from({ length: 8 }, () => ({
    cx: rng() * 100, cy: rng() * 100, r: rng() * 6 + 2,
    color: colors[Math.floor(rng() * colors.length)]
  }));
  
  const midNodes = Array.from({ length: 6 }, () => ({
    cx: rng() * 80 + 10, cy: rng() * 80 + 10, r: rng() * 8 + 4,
    color: colors[Math.floor(rng() * colors.length)]
  }));

  const fgNodes = Array.from({ length: 4 }, () => ({
    cx: rng() * 60 + 20, cy: rng() * 60 + 20, r: rng() * 12 + 6,
    color: colors[Math.floor(rng() * colors.length)]
  }));

  const renderGraph = (nodes: any[], opacity: number, strokeW: number) => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
      {nodes.map((n, i) => {
        const next = nodes[(i + 1) % nodes.length];
        if (rng() > 0.3) {
          return <line key={`l-${i}`} x1={n.cx} y1={n.cy} x2={next.cx} y2={next.cy} stroke={n.color} strokeWidth={strokeW} opacity={opacity} />;
        }
        return null;
      })}
      {nodes.map((n, i) => (
        <circle key={`c-${i}`} cx={n.cx} cy={n.cy} r={n.r} fill="var(--panel-2)" stroke={n.color} strokeWidth={strokeW} opacity={opacity + 0.2} />
      ))}
    </svg>
  );

  useEffect(() => {
    if (reduced || isHovered) return;
    
    let frameId: number;
    // Base t on slug hash so cards animate differently
    let t = (rng() * 1000); 
    
    const animate = () => {
      t += 0.01;
      mouseX.set(0.5 + Math.sin(t) * 0.2);
      mouseY.set(0.5 + Math.cos(t * 0.8) * 0.2);
      frameId = requestAnimationFrame(animate);
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [reduced, isHovered, mouseX, mouseY]);

  return (
    <div 
      className="relative w-full overflow-hidden border-b border-border bg-panel-2" 
      style={{ height, transformStyle: 'preserve-3d' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={(e) => {
        if (reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => {
        setIsHovered(false);
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
    >
      <motion.div 
        className="absolute inset-0"
        style={{ x: reduced ? 0 : bgX, y: reduced ? 0 : bgY }}
      >
        {renderGraph(bgNodes, 0.2, 1)}
      </motion.div>
      <div className="absolute inset-0">
        {renderGraph(midNodes, 0.4, 2)}
      </div>
      <motion.div 
        className="absolute inset-0"
        style={{ x: reduced ? 0 : fgX, y: reduced ? 0 : fgY }}
      >
        {renderGraph(fgNodes, 0.8, 3)}
      </motion.div>
    </div>
  );
}
