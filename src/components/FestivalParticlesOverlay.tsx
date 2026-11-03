import React, { useEffect, useRef } from 'react';
import { FestivalThemeConfig } from '../services/festivalCelebrationService';

interface FestivalParticlesOverlayProps {
  festival: FestivalThemeConfig | null;
  enabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'star' | 'heart' | 'petal';
  wobble: number;
}

export const FestivalParticlesOverlay: React.FC<FestivalParticlesOverlayProps> = ({
  festival,
  enabled
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled || !festival) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palettes per particle type
    const getColors = (): string[] => {
      switch (festival.particlesType) {
        case 'tricolor_confetti':
          // Tiranga: Saffron, White, Emerald Green, Navy Ashoka Blue, Gold
          return ['#FF9933', '#FFFFFF', '#138808', '#000080', '#FBBF24'];
        case 'diwali_sparklers':
          return ['#F59E0B', '#FBBF24', '#FDE047', '#EA580C', '#FEF08A'];
        case 'holi_gulal':
          return ['#EC4899', '#06B6D4', '#EAB308', '#8B5CF6', '#10B981', '#F43F5E'];
        case 'falling_snow':
          return ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#F1F5F9'];
        case 'floating_hearts':
          return ['#F43F5E', '#EC4899', '#FB7185', '#FDA4AF', '#FFFFFF'];
        case 'royal_fireworks':
          return ['#F59E0B', '#06B6D4', '#A855F7', '#38BDF8', '#FCD34D'];
        case 'sakura_petals':
        default:
          return ['#FDA4AF', '#FB7185', '#F43F5E', '#FFFFFF'];
      }
    };

    const colors = getColors();
    const particleCount = window.innerWidth < 640 ? 30 : 50;
    const particles: Particle[] = [];

    const createParticle = (isInit = false): Particle => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      let shape: Particle['shape'] = 'rect';
      
      if (festival.particlesType === 'floating_hearts') {
        shape = 'heart';
      } else if (festival.particlesType === 'falling_snow' || festival.particlesType === 'diwali_sparklers') {
        shape = Math.random() > 0.4 ? 'circle' : 'star';
      } else if (festival.particlesType === 'sakura_petals') {
        shape = 'petal';
      } else {
        // Confetti / Gulal
        shape = Math.random() > 0.5 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star';
      }

      return {
        x: Math.random() * width,
        y: isInit ? Math.random() * height : -20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: festival.particlesType === 'floating_hearts' 
          ? -(Math.random() * 1.5 + 0.8) // float upwards
          : Math.random() * 1.8 + 1.2, // fall downwards
        size: Math.random() * 7 + 4,
        color,
        alpha: Math.random() * 0.7 + 0.3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        shape,
        wobble: Math.random() * Math.PI * 2
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    const drawHeart = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
      c.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();
    };

    const drawStar = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        c.lineTo(Math.cos((18 + i * 72) * 0.0174533) * size, -Math.sin((18 + i * 72) * 0.0174533) * size);
        c.lineTo(Math.cos((54 + i * 72) * 0.0174533) * (size / 2), -Math.sin((54 + i * 72) * 0.0174533) * (size / 2));
      }
      c.closePath();
      c.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.wobble += 0.03;
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Reset if out of viewport
        if (festival.particlesType === 'floating_hearts') {
          if (p.y < -30) {
            particles[i] = createParticle(false);
            particles[i].y = height + 20;
          }
        } else {
          if (p.y > height + 30 || p.x < -30 || p.x > width + 30) {
            particles[i] = createParticle(false);
          }
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;

        // Sparkle shadow for Indian Tiranga / Diwali
        if (festival.isIndianNational || festival.id === 'diwali') {
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
        }

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(ctx, p.size);
        } else if (p.shape === 'heart') {
          drawHeart(ctx, p.size);
        } else if (p.shape === 'petal') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Rect / ribbon confetti
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [festival, enabled]);

  if (!enabled || !festival) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45] w-full h-full"
      style={{ opacity: 0.92 }}
    />
  );
};
