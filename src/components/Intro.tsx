/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Intro() {
  return (
    <div className="p-5 bg-card-bg border border-border-custom rounded-[20px] select-none shadow-card-shadow transition-all duration-300">
      <h4 className="text-[10px] font-bold text-panel-text uppercase tracking-widest mb-3 flex items-center gap-2 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff0000]" />
        STAGED SAMPLING ENGINE
      </h4>
      <p className="text-xs text-panel-text-muted leading-relaxed font-sans mb-3 font-normal">
        Standard browser scaling often introduces blur or heavy aliasing when resizing images aggressively. 
        ThumbGen employs <strong className="text-panel-text font-semibold">staged half-step downsampling</strong>, preserving pixel edges, details, and color fidelity.
      </p>
      <div className="text-[10px] text-panel-text-light font-mono flex items-center gap-1.5 pt-1.5 border-t border-border-custom-muted">
        <span>●</span>
        <span>Zero server uploads. 100% on-device sandbox.</span>
      </div>
    </div>
  );
}
