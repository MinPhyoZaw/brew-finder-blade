import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // No progress bar: we keep a short timeout before calling onComplete
  useEffect(() => {
    const t = setTimeout(onComplete, 800);
    return () => clearTimeout(t);
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
  <h1 className="text-3xl font-bold text-[#6F4E37] logo-font">Brew Finder</h1>
        <p className="text-[#3E2723] mt-2 text-sm italic">
          “Find your perfect cup — one café at a time.”
        </p>
      </div>

      {/* Static splash (no progress bar) */}
      <div className="mt-8" />

      {/* Subtle Footer */}
      <p className="absolute bottom-8 text-xs text-[#6F4E37]/70">
        Brewed with ❤️ for coffee lovers
      </p>
    </div>
  );
};
