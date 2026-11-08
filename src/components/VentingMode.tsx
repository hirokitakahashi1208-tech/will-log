import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface VentingModeProps {
  onClose: () => void;
}

interface ActivePhrase {
  id: string;
  text: string;
  x: number;
  y: number;
  startTime: number;
}

interface CompletedPhrase {
  id: string;
  text: string;
  x: number;
  y: number;
  createdAt: number;
}

export function VentingMode({ onClose }: VentingModeProps) {
  const [activePhrase, setActivePhrase] = useState<ActivePhrase | null>(null);
  const [completedPhrases, setCompletedPhrases] = useState<CompletedPhrase[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle typing - create/update active phrase at random position
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentInput(newValue);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (newValue.length > 0) {
      // If this is a new phrase, create one at random position
      if (!activePhrase || activePhrase.text.length === 0) {
        setActivePhrase({
          id: Date.now().toString() + Math.random(),
          text: newValue,
          x: Math.random() * 70 + 15,
          y: Math.random() * 70 + 15,
          startTime: Date.now()
        });
      } else {
        // Update existing phrase
        setActivePhrase({
          ...activePhrase,
          text: newValue
        });
      }

      // Auto-complete if user stops typing for 1.5 seconds
      typingTimeoutRef.current = setTimeout(() => {
        if (activePhrase && newValue.trim().length > 0) {
          const completed: CompletedPhrase = {
            id: activePhrase.id,
            text: newValue,
            x: activePhrase.x,
            y: activePhrase.y,
            createdAt: Date.now()
          };
          setCompletedPhrases(prev => [...prev, completed]);
          setActivePhrase(null);
          setCurrentInput('');
        }
      }, 1500);
    } else {
      setActivePhrase(null);
    }
  };

  // Handle Enter key - complete the phrase
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput.trim().length > 0) {
      e.preventDefault();
      
      if (activePhrase) {
        const completed: CompletedPhrase = {
          id: activePhrase.id,
          text: currentInput.trim(),
          x: activePhrase.x,
          y: activePhrase.y,
          createdAt: Date.now()
        };
        setCompletedPhrases(prev => [...prev, completed]);
      }
      
      setActivePhrase(null);
      setCurrentInput('');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Remove fully faded completed phrases
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCompletedPhrases(prev => 
        prev.filter(phrase => now - phrase.createdAt < 800) // Remove after 0.8 seconds
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Get color for character based on distance from end
  const getCharColor = (distanceFromEnd: number) => {
    if (distanceFromEnd === 0) return '#FFFFFF'; // Last character - white
    if (distanceFromEnd === 1) return '#666666'; // -1 - medium grey
    if (distanceFromEnd === 2) return '#1A1A1A'; // -2 - very dark grey
    return '#000000'; // -3 and older - black (invisible)
  };

  // Get opacity for completed phrase based on age
  const getCompletedOpacity = (age: number) => {
    // Ultra rapid fade: 800ms total
    if (age < 150) return 1.0;
    if (age < 300) return 0.6;
    if (age < 500) return 0.3;
    if (age < 700) return 0.1;
    return 0.0;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-[#333333] hover:text-[#666666] transition-colors duration-200 z-10"
        aria-label="吐き出しモードを閉じる"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      {/* Active typing phrase with rapid color fade */}
      {activePhrase && activePhrase.text.length > 0 && (
        <div
          className="absolute font-mono text-xl pointer-events-none whitespace-nowrap"
          style={{
            left: `${activePhrase.x}%`,
            top: `${activePhrase.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {activePhrase.text.split('').map((char, index) => {
            const distanceFromEnd = activePhrase.text.length - 1 - index;
            const color = getCharColor(distanceFromEnd);
            
            return (
              <span
                key={`${activePhrase.id}-${index}`}
                style={{
                  color,
                  transition: 'color 0.1s linear'
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      )}

      {/* Completed phrases with rapid fade to black */}
      {completedPhrases.map(phrase => {
        const age = Date.now() - phrase.createdAt;
        const opacity = getCompletedOpacity(age);
        
        return (
          <div
            key={phrase.id}
            className="absolute font-mono text-xl pointer-events-none whitespace-nowrap"
            style={{
              left: `${phrase.x}%`,
              top: `${phrase.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity,
              transition: 'opacity 0.2s linear'
            }}
          >
            {/* ここを変更：ActivePhraseと同じように文字単位で色を計算して描画 */}
            {phrase.text.split('').map((char, index) => {
              const distanceFromEnd = phrase.text.length - 1 - index;
              const color = getCharColor(distanceFromEnd);
              
              return (
                <span
                  key={`${phrase.id}-${index}`}
                  style={{ color }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        );
      })}

      {/* Hidden input field */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => inputRef.current?.focus()}
        className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none cursor-default"
        placeholder=""
        autoComplete="off"
      />

      {/* Instructions (only when empty) */}
      {completedPhrases.length === 0 && !activePhrase && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3">
            <p className="text-[#333333] text-sm font-mono tracking-[0.25em]">
              /DEV/NULL
            </p>
            <p className="text-[#242424] text-xs font-mono">
              そのまま入力。Enterで消去。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
