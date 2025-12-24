// src/components/TypewriterHero.tsx
'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, ShoppingBag, Store, Link as LinkIcon, Globe } from 'lucide-react';

const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_BETWEEN = 1500;

const platforms = [
  { text: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
  { text: 'Instagram DMs', icon: ShoppingBag, color: 'text-pink-500' },
  { text: 'Facebook Marketplace', icon: Store, color: 'text-blue-500' },
  { text: 'a Generic Link-in-Bio', icon: LinkIcon, color: 'text-purple-500' },
  { text: 'a Complicated Website', icon: Globe, color: 'text-amber-500' },
];

const TypewriterHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const currentPlatform = platforms[currentIndex];
    const targetText = currentPlatform.text;
    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentText === targetText) {
      // Finished typing, pause then start deleting
      setIsPaused(true);
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, PAUSE_BETWEEN);
    } else if (isDeleting && currentText === '') {
      // Finished deleting, move to next platform
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % platforms.length);
    } else {
      // Typing or deleting
      const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;
      const nextText = isDeleting
        ? targetText.substring(0, currentText.length - 1)
        : targetText.substring(0, currentText.length + 1);

      timeout = setTimeout(() => setCurrentText(nextText), speed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentIndex]);

  const CurrentIcon = platforms[currentIndex].icon;

  return (
    <div className="inline-flex items-center justify-center min-h-[4rem] md:min-h-[5rem]">
      <span className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mr-3">
        More Than Just
      </span>
      <div className="relative inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-xl min-w-[250px] md:min-w-[300px]">
        <CurrentIcon className={`w-6 h-6 mr-2 ${platforms[currentIndex].color}`} />
        <span className={`font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold ${platforms[currentIndex].color}`}>
          {currentText}
          <span className="ml-1 animate-pulse">|</span>
        </span>
      </div>
    </div>
  );
};

export default TypewriterHero;