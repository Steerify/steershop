import { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export const TypewriterEffect = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = '',
}: TypewriterEffectProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;

    const currentText = texts[currentIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        return;
      }

      const deleteTimer = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(deleteTimer);
    }

    if (displayText.length === currentText.length) {
      setIsPaused(true);
      return;
    }

    const typeTimer = setTimeout(() => {
      setDisplayText(currentText.slice(0, displayText.length + 1));
    }, typingSpeed);

    return () => clearTimeout(typeTimer);
  }, [displayText, currentIndex, isDeleting, isPaused, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {displayText}
      <span className="inline-block w-0.5 h-[1em] ml-1 bg-current animate-blink" />
    </span>
  );
};
