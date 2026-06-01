/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';

interface DropZoneProps {
  onFilesAdded: (files: FileList) => void;
}

export default function DropZone({ onFilesAdded }: DropZoneProps) {
  const [isOver, setIsOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (e.dataTransfer?.files) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleZoneClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'LABEL' && target.tagName !== 'INPUT') {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload images"
      className={`relative w-full border border-dashed rounded-[24px] bg-card-bg p-10 flex flex-col items-center justify-center text-center shrink-0 cursor-pointer transition-all duration-300 select-none ${
        isOver
          ? 'border-panel-text bg-pill-bg-inactive/40 scale-[0.99] shadow-inner'
          : 'border-border-custom hover:border-panel-text hover:shadow-card-shadow'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      onKeyDown={handleKeyDown}
    >
      {/* Nothing dot design element helper layout */}
      <div className="w-12 h-12 bg-panel-text rounded-full flex items-center justify-center mb-4 border border-border-custom transition-transform duration-300 hover:scale-105 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <svg className="w-5 h-5 text-panel-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <p className="text-sm font-semibold text-panel-text tracking-wide font-sans">
        Drag images here or{' '}
        <span
          className="text-panel-text underline cursor-pointer hover:text-panel-text-muted font-bold decoration-panel-text/30 underline-offset-4"
          onClick={() => fileInputRef.current?.click()}
        >
          browse files
        </span>
      </p>
      
      <p className="text-xs text-panel-text-light mt-2 font-mono leading-normal tracking-wide">
        JPG, PNG, WebP &bull; Max 50MB &bull; Multiple files OK
      </p>

      <input
        type="file"
        id="file_input"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
