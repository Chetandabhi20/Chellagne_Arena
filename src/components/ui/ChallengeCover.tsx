import { useReducedMotion } from '../../hooks';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const ChallengeCover = ({ slug, size = 'sm' }: { slug: string, size?: 'sm' | 'lg' }) => {
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const bgX = useTransform(mouseX, [0, 1], [5, -5]);
  const bgY = useTransform(mouseY, [0, 1], [5, -5]);
  const fgX = useTransform(mouseX, [0, 1], [-10, 10]);
  const fgY = useTransform(mouseY, [0, 1], [-10, 10]);

  const height = size === 'sm' ? 120 : 200;

  return (
    <div 
      className="relative w-full overflow-hidden bg-panel-2 border-b border-border" 
      style={{ height, perspective: 1000 }}
      onMouseMove={(e) => {
        if (reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseX.set((e.clientY - rect.top) / rect.height);
      }}
      onMouseLeave={() => {
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
      data-slug={slug}
    >
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ x: reduced ? 0 : bgX, y: reduced ? 0 : bgY }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" className="text-border opacity-50">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
         <svg width="60" height="60" viewBox="0 0 100 100" className="text-muted opacity-80">
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ x: reduced ? 0 : fgX, y: reduced ? 0 : fgY }}
      >
        <svg width="40" height="40" viewBox="0 0 100 100" className="text-accent">
          <path d="M10 90 L50 10 L90 90 Z" fill="currentColor" />
        </svg>
      </motion.div>
    </div>
  );
};
