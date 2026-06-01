/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Intro from './components/Intro';
import DropZone from './components/DropZone';
import ControlPanel from './components/ControlPanel';
import PreviewGrid from './components/PreviewGrid';
import { ImageFileEntry, FormatMode, AspectRatioType, NamingMode } from './types';
import { buildZip } from './utils/zip';
import { renderToCanvas, canvasToBlob, MIME_MAP, sanitizeName } from './utils/image';

export default function App() {
  const [files, setFiles] = useState<ImageFileEntry[]>([]);
  const [aspect, setAspect] = useState<AspectRatioType>('1:1');
  const [anchorX, setAnchorX] = useState<number>(0.5);
  const [anchorY, setAnchorY] = useState<number>(0.5);
  const [quality, setQuality] = useState<number>(90);
  const [maxWidth, setMaxWidth] = useState<number>(1024);
  const [prefix, setPrefix] = useState<string>('thumb');
  const [naming, setNaming] = useState<NamingMode>('num');
  const [processing, setProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [panelFormat, setPanelFormat] = useState<FormatMode>('webp');

  // Theme support
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thumbgen_theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('thumbgen_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('thumbgen_theme', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  const handleFilesAdded = (fileList: FileList) => {
    const loadedCount = { success: 0, skipped: 0 };
    let filesLeftToLoad = 0;

    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        loadedCount.skipped++;
        return;
      }

      const isDuplicate = files.some(
        (f) =>
          f.name === file.name &&
          f.file.size === file.size &&
          f.file.lastModified === file.lastModified
      );
      if (isDuplicate) {
        loadedCount.skipped++;
        return;
      }

      filesLeftToLoad++;
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onerror = () => {
        URL.revokeObjectURL(url);
        filesLeftToLoad--;
        if (filesLeftToLoad === 0) {
          setStatus('');
        }
      };

      img.onload = () => {
        const newEntry: ImageFileEntry = {
          id: Math.random().toString(36).substring(2, 9) + Date.now(),
          file,
          img,
          url,
          name: file.name,
          canvas: null,
          outputDims: null,
        };

        setFiles((prev) => [...prev, newEntry]);
        loadedCount.success++;
        filesLeftToLoad--;

        setStatus(
          filesLeftToLoad === 0
            ? `${loadedCount.success} image${loadedCount.success > 1 ? 's' : ''} loaded.`
            : 'Loading...'
        );
      };

      img.src = url;
    });

    if (filesLeftToLoad === 0 && loadedCount.skipped > 0 && loadedCount.success === 0) {
      setStatus(`Skipped ${loadedCount.skipped} duplicate/unsupported files.`);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      const updated = prev.filter((f) => f.id !== id);
      setStatus(updated.length > 0 ? '' : '');
      return updated;
    });
  };

  const handleClearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setStatus('');
  };

  const handleAnchorChange = (x: number, y: number) => {
    setAnchorX(x);
    setAnchorY(y);
  };

  const handleExportZip = async () => {
    if (!files.length || processing) return;
    setProcessing(true);
    setStatus('Preparing files...');

    try {
      const activePrefix = prefix.trim() || 'thumb';
      const suffix = aspect === 'original' ? '' : `-${aspect.replace(':', 'x')}`;
      const today = new Date().toISOString().slice(0, 10);
      const mime = MIME_MAP[panelFormat as keyof typeof MIME_MAP] || 'image/webp';
      const ext = panelFormat === 'jpeg' ? 'jpg' : panelFormat;
      const zipName = `${activePrefix}-${today}.zip`;
      const zipEntries: { name: string; blob: Blob }[] = [];

      for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        setStatus(`Processing background thread ${i + 1}/${files.length}...`);

        const canvas = renderToCanvas(
          entry.img,
          aspect,
          maxWidth,
          anchorX,
          anchorY
        );

        const blob = await canvasToBlob(canvas, quality, mime);
        const base = sanitizeName(entry.name);
        const num = String(i + 1).padStart(2, '0');
        
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

        zipEntries.push({ name: filename, blob });
      }

      setStatus('Assembling ZIP archive...');
      const zipBlob = await buildZip(zipEntries);
      const url = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
        setStatus(`Exported: ${zipName}`);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err?.message || err}`);
    } finally {
      setProcessing(false);
    }
  };

  // Compute live queue file sizes in MB
  const totalSizeBytes = files.reduce((acc, f) => acc + f.file.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="h-screen w-full flex flex-col bg-app-bg text-panel-text select-none overflow-hidden font-sans">
      {/* 1. Header Row */}
      <Header isDark={isDark} onToggleTheme={handleToggleTheme} />

      {/* 2. Scrollable / Split Midpane Content Grid */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden min-h-0">
        
        {/* Left Side: Sidebar Panel Settings */}
        <aside className="w-full md:w-[280px] bg-panel-bg border-b md:border-b-0 md:border-r border-border-custom flex flex-col shrink-0 overflow-y-auto no-scrollbar p-5 gap-5 min-h-0">
          <ControlPanel
            format={panelFormat}
            setFormat={setPanelFormat}
            aspect={aspect}
            setAspect={setAspect}
            anchorX={anchorX}
            anchorY={anchorY}
            setAnchor={handleAnchorChange}
            quality={quality}
            setQuality={setQuality}
            maxWidth={maxWidth}
            setMaxWidth={setMaxWidth}
            prefix={prefix}
            setPrefix={setPrefix}
            naming={naming}
            setNaming={setNaming}
          />

          {/* Decorative/Info Stencil Intro Block at sidebar bottom */}
          <div className="mt-4 pt-2">
            <Intro />
          </div>
        </aside>

        {/* Right Side: Primary Board Workspace Pane with local DropZone and Thumbnail layouts */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-transparent">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
            
            {/* Interactive Upload Grid DropZone */}
            <DropZone onFilesAdded={handleFilesAdded} />

            {/* Thumbnail Preview Grid items */}
            {files.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-extrabold text-panel-text-light uppercase tracking-widest font-mono">
                    [QUEUE] Active Processing
                  </h2>
                  <span className="text-[10px] text-panel-text font-bold font-mono bg-card-bg border border-border-custom px-3 py-1 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.01)]">
                    {files.length} ITEMS LOADED
                  </span>
                </div>
                
                <PreviewGrid
                  files={files}
                  aspect={aspect}
                  anchorX={anchorX}
                  anchorY={anchorY}
                  maxWidth={maxWidth}
                  quality={quality}
                  format={panelFormat}
                  prefix={prefix}
                  naming={naming}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border-custom rounded-[24px] bg-card-bg p-12 text-center text-panel-text-light mt-2 shadow-card-shadow">
                {/* Simulated Glyph Element */}
                <div className="w-[72px] h-[72px] bg-pill-bg-inactive rounded-full border border-border-custom-muted flex items-center justify-center mb-4 text-panel-text-muted relative">
                  <div className="absolute w-2 h-2 rounded-full bg-[#ff0000] -top-1 -right-1 animate-pulse border border-border-custom" />
                  <div className="grid grid-cols-2 gap-1.5 opacity-60">
                    <div className="w-2.5 h-2.5 bg-panel-text-muted/40 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-panel-text-muted/40 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-panel-text-muted/40 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-[#ff0000]/60 rounded-full" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-panel-text font-mono uppercase tracking-widest mb-1">Queue Underflow</h3>
                <p className="text-xs text-panel-text-muted max-w-[280px] leading-relaxed">
                  Drop image assets inside the dashboard above or browse files to initialize processing threads.
                </p>
              </div>
            )}
          </div>
        </main>

      </div>

      {/* 3. Global App Footer Action Shelf */}
      <footer className="h-16 bg-panel-bg border-t border-border-custom px-6 md:px-8 flex items-center justify-between shrink-0 select-none">
        
        {/* Status bar details */}
        <div className="flex items-center gap-3 select-none">
          {/* Active pulsing red indicator if queue contains items */}
          <span className="relative flex h-2.5 w-2.5">
            {files.length > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0000] opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              files.length > 0 ? 'bg-[#ff0000]' : 'bg-panel-text-light'
            }`}></span>
          </span>
          
          <div className="text-[11px] font-bold text-panel-text-light uppercase tracking-widest font-mono">
            {status ? (
              <span className="text-panel-text font-extrabold">{status}</span>
            ) : files.length > 0 ? (
              <span>Queue: {files.length} ITEMS &bull; {totalSizeMB} MB TOTAL</span>
            ) : (
              <span>No ACTIVE FILES</span>
            )}
          </div>
        </div>

        {/* Global panel commands */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearAll}
            disabled={files.length === 0 || processing}
            className="px-5 py-2 text-xs font-bold text-panel-text-muted hover:text-panel-text bg-pill-bg-inactive hover:bg-border-custom rounded-full border border-border-custom hover:border-border-custom disabled:opacity-40 disabled:cursor-not-allowed select-none transition-all active:scale-[0.98] outline-none cursor-pointer"
          >
            Clear All
          </button>
          
          <button
            type="button"
            onClick={handleExportZip}
            disabled={files.length === 0 || processing}
            className="px-6 py-2 bg-panel-text hover:opacity-90 disabled:bg-pill-bg-inactive text-panel-bg disabled:text-panel-text-light text-xs font-bold rounded-full shadow-sm hover:shadow transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.98] uppercase tracking-widest font-mono"
          >
            {processing ? 'Processing...' : 'Export ZIP'}
          </button>
        </div>

      </footer>
    </div>
  );
}
