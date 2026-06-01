/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { FormatMode, AspectRatioType, NamingMode } from '../types';

interface ControlPanelProps {
  format: FormatMode;
  setFormat: (f: FormatMode) => void;
  aspect: AspectRatioType;
  setAspect: (a: AspectRatioType) => void;
  anchorX: number;
  anchorY: number;
  setAnchor: (x: number, y: number) => void;
  quality: number;
  setQuality: (q: number) => void;
  maxWidth: number;
  setMaxWidth: (w: number) => void;
  prefix: string;
  setPrefix: (p: string) => void;
  naming: NamingMode;
  setNaming: (n: NamingMode) => void;
}

const ASPECT_OPTIONS: { label: string; value: AspectRatioType }[] = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: 'OG (40:21)', value: '40:21' },
  { label: 'Original', value: 'original' },
];

const ANCHOR_GRID = [
  { label: 'Top left', ax: 0, ay: 0 },
  { label: 'Top center', ax: 0.5, ay: 0 },
  { label: 'Top right', ax: 1, ay: 0 },
  { label: 'Mid left', ax: 0, ay: 0.5 },
  { label: 'Mid center', ax: 0.5, ay: 0.5 },
  { label: 'Mid right', ax: 1, ay: 0.5 },
  { label: 'Bot left', ax: 0, ay: 1 },
  { label: 'Bot center', ax: 0.5, ay: 1 },
  { label: 'Bot right', ax: 1, ay: 1 },
];

export default function ControlPanel({
  format,
  setFormat,
  aspect,
  setAspect,
  anchorX,
  anchorY,
  setAnchor,
  quality,
  setQuality,
  maxWidth,
  setMaxWidth,
  prefix,
  setPrefix,
  naming,
  setNaming,
}: ControlPanelProps) {
  const [localWidth, setLocalWidth] = useState(maxWidth.toString());

  useEffect(() => {
    setLocalWidth(maxWidth.toString());
  }, [maxWidth]);

  const handleWidthChange = (val: string) => {
    setLocalWidth(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 64 && parsed <= 8192) {
      setMaxWidth(parsed);
    }
  };

  const handleWidthBlur = () => {
    let parsed = parseInt(localWidth, 10);
    if (isNaN(parsed) || parsed < 64) {
      parsed = 64;
    } else if (parsed > 8192) {
      parsed = 8192;
    }
    setLocalWidth(parsed.toString());
    setMaxWidth(parsed);
  };

  const getExampleFilename = () => {
    const activePrefix = prefix.trim() || 'thumb';
    const suffix = aspect === 'original' ? '' : `-${aspect.replace(':', 'x')}`;
    const ext = format === 'jpeg' ? 'jpg' : format;

    if (naming === 'original') {
      return `image${suffix}.${ext}`;
    } else if (naming === 'num') {
      return `${activePrefix}-01${suffix}.${ext}`;
    } else if (naming === 'prefix-original') {
      return `${activePrefix}-image-01${suffix}.${ext}`;
    }
    return `image.${ext}`;
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      {/* SECTION: Format Mode */}
      <section className="bg-card-bg p-5 rounded-[20px] border border-border-custom shadow-card-shadow">
        <h3 className="text-[10px] font-bold text-panel-text-light uppercase tracking-widest mb-3 font-mono">
          [01] Output Format
        </h3>
        <div className="flex bg-pill-bg-inactive p-1 rounded-xl">
          {(['webp', 'jpeg', 'png'] as FormatMode[]).map((fmt) => {
            const isActive = format === fmt;
            const label = fmt === 'jpeg' ? 'JPG' : fmt === 'webp' ? 'WebP' : 'PNG';
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 outline-none ${
                  isActive
                    ? 'bg-pill-bg-active text-pill-text-active shadow-sm cursor-default'
                    : 'text-panel-text-muted hover:text-panel-text cursor-pointer hover:bg-panel-bg/30'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {format === 'webp' && (
          <p className="text-[10px] text-panel-text-light leading-normal mt-2.5 font-mono">
            ● Fully optimized WebP compression. Stays sharp at minimal bytes.
          </p>
        )}
      </section>

      {/* SECTION: Aspect Ratio */}
      <section className="bg-card-bg p-5 rounded-[20px] border border-border-custom shadow-card-shadow">
        <h3 className="text-[10px] font-bold text-panel-text-light uppercase tracking-widest mb-3 font-mono">
          [02] Aspect Ratio
        </h3>
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
          {ASPECT_OPTIONS.map((opt) => {
            const isActive = aspect === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAspect(opt.value)}
                className={`py-2 text-[11px] font-medium rounded-xl border transition-all duration-200 outline-none flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'border-panel-text bg-pill-bg-active text-pill-text-active shadow-md font-bold cursor-default'
                    : 'border-border-custom hover:border-panel-text text-panel-text-muted hover:bg-pill-bg-inactive cursor-pointer'
                }`}
              >
                {isActive && <span className="w-1 h-1 rounded-full bg-[#ff0000]" />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION: Crop Anchor Point */}
      <section className="bg-card-bg p-5 rounded-[20px] border border-border-custom shadow-card-shadow">
        <h3 className="text-[10px] font-bold text-panel-text-light uppercase tracking-widest mb-3.5 font-mono">
          [03] Anchor Grid
        </h3>
        <div className="grid grid-cols-3 w-[112px] justify-items-center items-center gap-2 mx-auto bg-pill-bg-inactive p-3 rounded-xl border border-border-custom-muted relative">
          {ANCHOR_GRID.map((opt, idx) => {
            const isActive = anchorX === opt.ax && anchorY === opt.ay;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setAnchor(opt.ax, opt.ay)}
                title={opt.label}
                aria-label={opt.label}
                className={`w-[18px] h-[18px] rounded-full transition-all duration-200 outline-none ${
                  isActive
                    ? 'bg-[#ff0000] scale-110 shadow-md ring-4 ring-red-100/40 cursor-default'
                    : 'bg-border-custom hover:bg-panel-text-muted hover:scale-105 cursor-pointer'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* SECTION: Quality Indicator Slider */}
      {format !== 'png' && (
        <section className="bg-card-bg p-5 rounded-[20px] border border-border-custom shadow-card-shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-bold text-panel-text-light uppercase tracking-widest font-mono">
              [04] Quality
            </h3>
            <span className="text-xs font-bold text-[#ff0000] bg-rose-500/10 border border-[#ff0000]/15 px-2 py-0.5 rounded-lg font-mono">
              {quality}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-[#ff0000]"
          />
        </section>
      )}

      {/* SECTION: Max Width */}
      <section className="bg-card-bg p-5 rounded-[20px] border border-border-custom shadow-card-shadow">
        <h3 className="text-[10px] font-bold text-panel-text-light uppercase tracking-widest mb-3 font-mono">
          [05] Output Width
        </h3>
        <div className="relative flex items-center">
          <input
            type="text"
            pattern="[0-9]*"
            value={localWidth}
            onChange={(e) => handleWidthChange(e.target.value)}
            onBlur={handleWidthBlur}
            className="w-full pl-4 pr-10 py-2 border border-border-custom bg-input-bg rounded-xl text-sm font-semibold focus:ring-1 focus:ring-panel-text focus:border-panel-text text-panel-text outline-none transition-all font-mono"
          />
          <span className="absolute right-4 text-xs text-panel-text-light font-mono font-bold select-none uppercase">
            px
          </span>
        </div>
      </section>

      {/* SECTION: Naming Mode Custom Style */}
      <section className="bg-card-bg p-5 rounded-[20px] border border-border-custom shadow-card-shadow">
        <h3 className="text-[10px] font-bold text-panel-text-light uppercase tracking-widest mb-3 font-mono">
          [06] Naming Rules
        </h3>
        <div className="flex bg-pill-bg-inactive p-1 rounded-xl mb-3.5">
          {(['num', 'prefix-original', 'original'] as NamingMode[]).map((mode) => {
            const isActive = naming === mode;
            let text = '#';
            if (mode === 'num') text = 'Pfx + #';
            else if (mode === 'prefix-original') text = 'Pfx + Name';
            else if (mode === 'original') text = 'Original';

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setNaming(mode)}
                className={`flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all text-center truncate ${
                  isActive
                    ? 'bg-pill-bg-active text-pill-text-active shadow-sm cursor-default'
                    : 'text-panel-text-muted hover:text-panel-text hover:bg-panel-bg/30 cursor-pointer'
                }`}
              >
                {text}
              </button>
            );
          })}
        </div>

        {/* Prefix Input box */}
        {naming !== 'original' && (
          <div className="flex flex-col gap-1.5 animate-fadeIn mb-3.5">
            <label className="text-[9px] text-panel-text-light font-bold uppercase tracking-wider font-mono" htmlFor="sidebar_prefix_input">
              Prefix Label
            </label>
            <input
              type="text"
              id="sidebar_prefix_input"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="thumb"
              className="w-full px-3.5 py-2 border border-border-custom bg-input-bg text-panel-text rounded-xl text-xs font-semibold focus:ring-1 focus:ring-panel-text focus:border-panel-text outline-none transition-all font-mono"
            />
          </div>
        )}

        <div className="p-3 bg-pill-bg-inactive rounded-xl border border-border-custom-muted">
          <p className="text-[9px] text-panel-text-light uppercase font-mono tracking-wider mb-1.5">Preview Filename</p>
          <p className="text-[11px] font-mono font-bold text-panel-text break-all select-all">
            {getExampleFilename()}
          </p>
        </div>
      </section>
    </div>
  );
}
