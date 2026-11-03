import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  cursorColor?: string;
  animate?: boolean;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 16,
  className = '',
  cursorColor = '#d946ef',
  animate = true,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState<string>(() => (animate ? '' : text));
  const [isTyping, setIsTyping] = useState<boolean>(() => animate && text.length > 0);
  const targetTextRef = useRef<string>(text);
  targetTextRef.current = text;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      setIsTyping(false);
      onComplete?.();
      return;
    }

    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);

    let currentIndex = 0;
    // If text was extended, start typing from where we left off
    setDisplayedText((prev) => {
      if (text.startsWith(prev)) {
        currentIndex = prev.length;
        return prev;
      }
      currentIndex = 0;
      return '';
    });

    const typeNextChar = () => {
      const currentTarget = targetTextRef.current;
      const remaining = currentTarget.length - currentIndex;
      if (currentIndex < currentTarget.length) {
        // Dynamic step catch-up: if buffer is streaming fast, type more chars per step or reduce delay
        const stepSize = remaining > 25 ? 3 : remaining > 10 ? 2 : 1;
        currentIndex = Math.min(currentTarget.length, currentIndex + stepSize);
        setDisplayedText(currentTarget.slice(0, currentIndex));
        
        const char = currentTarget[currentIndex - 1];
        const stepSpeed = remaining > 15 ? Math.max(5, speed * 0.35) : (char === ' ' ? speed * 0.6 : speed);
        timerRef.current = setTimeout(typeNextChar, stepSpeed);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };

    timerRef.current = setTimeout(typeNextChar, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, animate, speed, onComplete]);

  return (
    <span className={`inline-block ${className}`}>
      <span>{displayedText}</span>
      {isTyping && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.55, ease: 'linear' }}
          className="inline-block ml-0.5 text-xs font-mono select-none"
          style={{ color: cursorColor }}
        >
          ▍
        </motion.span>
      )}
    </span>
  );
};
