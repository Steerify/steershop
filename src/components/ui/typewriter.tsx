import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  words: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
  cursorClassName?: string;
}

export function Typewriter({
  words,
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 1500,
  className,
  cursorClassName = "bg-primary"
}: TypewriterProps) {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentIndex % words.length];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % words.length);
    } else {
      const delay = isDeleting ? deleteSpeed : speed;
      timeout = setTimeout(() => {
        setCurrentText(
          isDeleting
            ? currentWord.substring(0, currentText.length - 1)
            : currentWord.substring(0, currentText.length + 1)
        );
      }, delay);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentIndex, words, speed, deleteSpeed, pauseTime]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      {currentText}
      <span className={cn("ml-1 w-[3px] h-8 animate-pulse", cursorClassName)} />
    </span>
  );
}