/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="h-16 bg-panel-bg border-b border-border-custom flex items-center justify-between px-6 shrink-0 select-none">
      <div className="flex items-center gap-4">
        {/* Emblem Logo Graphic - Nothing Inspired: Pure black/white circle with a single pulsing red dot */}
        <div className="w-9 h-9 bg-panel-text rounded-full flex items-center justify-center relative shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]">
          <div className="grid grid-cols-3 gap-0.5">
            {[...Array(9)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${i === 8 ? 'bg-[#ff0000] animate-pulse' : 'bg-panel-bg/30'}`} 
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-[0.2em] text-panel-text uppercase font-display leading-tight">
            THUMBGEN
          </h1>
          <span className="text-[9px] font-mono tracking-widest text-panel-text-light uppercase font-light">
            NDOT v2.4 EDITION
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-panel-text-muted">
        <span className="hidden sm:inline-flex items-center gap-1.5">
          ENGINE: <span className="text-panel-text font-bold tracking-wider">LOCAL</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0000] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff0000]"></span>
          </span>
        </span>
        
        <div className="hidden sm:block h-3 w-px bg-border-custom"></div>

        {/* Dynamic Light/Dark switch styled exactly like a tactile mechanical toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-custom hover:border-panel-text bg-input-bg text-panel-text hover:text-panel-text transition-all duration-200 text-[9px] font-mono tracking-widest font-bold cursor-pointer select-none active:scale-95 outline-none"
        >
          <span>THEME:</span>
          <span className="text-panel-text font-extrabold flex items-center gap-1">
            {isDark ? 'DARK' : 'LIGHT'}
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#ff0000]' : 'bg-panel-text'}`} />
          </span>
        </button>

        <div className="hidden sm:block h-3 w-px bg-border-custom"></div>
        <span className="flex items-center gap-1">
          SESSION: 
          <span className="text-panel-text bg-pill-bg-inactive px-1.5 py-0.5 rounded font-bold border border-border-custom text-[10px]">
            TG-8821
          </span>
        </span>
      </div>
    </header>
  );
}
