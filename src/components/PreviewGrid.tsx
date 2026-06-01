/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageFileEntry, AspectRatioType } from '../types';
import { getCropParams, getOutputDims, renderToCanvas, canvasToBlob, MIME_MAP, sanitizeName } from '../utils/image';

interface PreviewGridProps {
  files: ImageFileEntry[];
  aspect: AspectRatioType;
  anchorX: number;
  anchorY: number;
  maxWidth: number;
  quality: number;
  format: string;
  prefix: string;
  naming: string;
  onRemoveFile: (id: string) => void;
}

export default function PreviewGrid({
  files,
  aspect,
  anchorX,
  anchorY,
  maxWidth,
  quality,
  format,
  prefix,
  naming,
  onRemoveFile,
}: PreviewGridProps) {

  const handleSingleDownload = async (entry: ImageFileEntry, idx: number) => {
    try {
      const mime = MIME_MAP[format as keyof typeof MIME_MAP] || 'image/webp';
      const ext = format === 'jpeg' ? 'jpg' : format;
      const suffix = aspect === 'original' ? '' : `-${aspect.replace(':', 'x')}`;
      const activePrefix = prefix.trim() || 'thumb';
      const base = sanitizeName(entry.name);
      
      const num = String(idx + 1).padStart(2, '0');
      let filename = '';

      if (naming === 'original') {
        filename = `${base}${suffix}.${ext}`;
      } else if (naming === 'num') {
        filename = `${activePrefix}-${num}${suffix}.${ext}`;
      } else if (naming === 'prefix-original') {
        filename = `${activePrefix}-${base}-${num}${suffix}.${ext}`;
      } else {
        filename = `${activePrefix}-${num}${suffix}.${ext}`;
      }

      const canvas = renderToCanvas(
        entry.img,
        aspect,
        maxWidth,
        anchorX,
        anchorY
      );

      const blob = await canvasToBlob(canvas, quality, mime);
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert(`Download failed: ${err?.message || err}`);
    }
  };

  return (
    <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 select-none mb-6">
      <AnimatePresence mode="popLayout">
        {files.map((entry, idx) => {
          const { sw, sh } = getCropParams(
            entry.img.naturalWidth,
            entry.img.naturalHeight,
            aspect,
            anchorX,
            anchorY
          );
          const { w, h } = getOutputDims(sw, sh, maxWidth);

          const isOriginalAspect = aspect === 'original';
          const arStyle = isOriginalAspect
            ? `${entry.img.naturalWidth} / ${entry.img.naturalHeight}`
            : aspect.replace(':', ' / ');

          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="group bg-card-bg rounded-3xl border border-border-custom overflow-hidden shadow-card-shadow flex flex-col justify-between hover:shadow-card-shadow-hover hover:border-panel-text transition-all duration-300"
            >
              {/* Image Preview Box */}
              <div
                className="bg-pill-bg-inactive relative overflow-hidden flex items-center justify-center select-none"
                style={{ aspectRatio: arStyle }}
              >
                {/* Visual crop masking */}
                <div className="absolute inset-0 w-full h-full bg-panel-text/[0.02] pointer-events-none z-10" />
                
                <img
                  src={entry.url}
                  alt={entry.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out select-none group-hover:scale-105"
                  style={{
                    objectPosition: `${anchorX * 100}% ${anchorY * 100}%`,
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* Stencil Grid Center Cross */}
                {!isOriginalAspect && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-35 transition-opacity duration-350 pointer-events-none z-10">
                    <div className="w-[1px] h-full border-l border-dashed border-white/65 absolute left-1/2 -translate-x-1/2" />
                    <div className="h-[1px] w-full border-t border-dashed border-white/65 absolute top-1/2 -translate-y-1/2" />
                  </div>
                )}

                {/* Overlay Action buttons in corner */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-20">
                  {/* Download single button */}
                  <button
                    type="button"
                    onClick={() => handleSingleDownload(entry, idx)}
                    title="Download this thumbnail"
                    className="p-1.5 bg-card-bg hover:bg-panel-text text-panel-text hover:text-panel-bg rounded-full border border-border-custom shadow-sm transition-all duration-155 scale-95 hover:scale-100 outline-none cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0L8 8m4 4V4" />
                    </svg>
                  </button>

                  {/* Trash single button */}
                  <button
                    type="button"
                    onClick={() => onRemoveFile(entry.id)}
                    title="Remove image"
                    className="p-1.5 bg-card-bg hover:bg-[#ff0000] text-panel-text hover:text-white rounded-full border border-border-custom shadow-sm transition-all duration-155 scale-95 hover:scale-100 outline-none cursor-pointer"
                  >
                    <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description Details Card Footer */}
              <div className="p-4 bg-card-bg select-none border-t border-border-custom-muted">
                <p className="text-xs font-bold text-panel-text truncate tracking-wide" title={entry.name}>
                  {entry.name}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-panel-text-light font-bold font-mono">
                    {w} &times; {h} PX
                  </span>
                  <span className="text-[9px] text-panel-text font-extrabold uppercase tracking-widest bg-pill-bg-inactive border border-border-custom-muted px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#ff0000]" />
                    READY
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
