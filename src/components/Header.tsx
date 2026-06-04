/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import StarOnGithub from '@/components/ui/button-github';
import { Sun, Moon } from '@phosphor-icons/react';

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

      <div className="flex items-center gap-3 text-xs font-mono text-panel-text-muted">
        {/* Dynamic Light/Dark switch styled exactly like a tactile mechanical toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-custom hover:border-panel-text bg-input-bg text-panel-text hover:text-panel-text transition-all duration-200 text-[9px] font-mono tracking-widest font-bold cursor-pointer select-none active:scale-95 outline-none"
        >
          <span>THEME:</span>
          <span className="text-panel-text font-extrabold flex items-center gap-1.5 select-none">
            {isDark ? (
              <>
                <Moon size={12} weight="fill" className="text-panel-text" />
                <span>DARK</span>
              </>
            ) : (
              <>
                <Sun size={12} weight="bold" className="text-panel-text" />
                <span>LIGHT</span>
              </>
            )}
          </span>
        </button>

        <div className="hidden sm:block h-3 w-px bg-border-custom"></div>

        {/* GitHub Star Button */}
        <div className="scale-90 hover:scale-[0.93] transition-transform duration-200">
          <StarOnGithub />
        </div>
      </div>
    </header>
  );
}
