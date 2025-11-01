import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FAF3E0] text-[#2D2424] z-50">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <img
          src="/brew-logo.png"
          alt="Brew Finder"
          className="w-24 h-24 rounded-full object-cover shadow-md mb-4"
        />
        <h1 className="text-3xl font-bold text-[#6F4E37] font-serif">Brew Finder</h1>
        <p className="text-[#3E2723] mt-2 text-sm italic">
          “Find your perfect cup — one café at a time.”
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-3/4 bg-[#D4A373]/30 h-2 rounded-full overflow-hidden mt-8">
        <div
          className="h-full bg-[#6F4E37] transition-all duration-200"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Loading Percentage */}
      <p className="text-[#4B3832] mt-3 text-sm">{progress}%</p>

      {/* Subtle Footer */}
      <p className="absolute bottom-8 text-xs text-[#6F4E37]/70">
        Brewed with ❤️ for coffee lovers
      </p>
    </div>
  );
};
