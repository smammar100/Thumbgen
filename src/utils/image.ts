/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AspectRatioType } from '../types';

export const MIME_MAP = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
} as const;

export interface CropResult {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface OutputDimensions {
  w: number;
  h: number;
}

export function getCropParams(
  srcW: number,
  srcH: number,
  aspect: AspectRatioType,
  anchorX: number,
  anchorY: number
): CropResult {
  if (aspect === 'original') {
    return { sx: 0, sy: 0, sw: srcW, sh: srcH };
  }
  
  const [tw, th] = aspect.split(':').map(Number);
  const ratio = tw / th;
  const srcRatio = srcW / srcH;
  
  let cropW: number;
  let cropH: number;
  
  if (srcRatio > ratio) {
    cropH = srcH;
    cropW = srcH * ratio;
  } else {
    cropW = srcW;
    cropH = srcW / ratio;
  }
  
  const cw = Math.round(cropW);
  const ch = Math.round(cropH);
  
  return {
    sx: Math.min(srcW - cw, Math.max(0, Math.round((srcW - cw) * anchorX))),
    sy: Math.min(srcH - ch, Math.max(0, Math.round((srcH - ch) * anchorY))),
    sw: cw,
    sh: ch,
  };
}

export function getOutputDims(
  sw: number,
  sh: number,
  maxWidth: number
): OutputDimensions {
  const width = Math.round(Math.min(sw, maxWidth));
  const height = Math.round(sh * (width / sw));
  return { w: width, h: height };
}

export function renderToCanvas(
  img: HTMLImageElement,
  aspect: AspectRatioType,
  maxWidth: number,
  anchorX: number,
  anchorY: number
): HTMLCanvasElement {
  const { sx, sy, sw, sh } = getCropParams(
    img.naturalWidth,
    img.naturalHeight,
    aspect,
    anchorX,
    anchorY
  );
  
  const { w, h } = getOutputDims(sw, sh, maxWidth);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D context unavailable');
  }

  const scale = sw / w;

  // For small reductions, standard scaling is crisp and high quality.
  if (scale <= 2) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    return canvas;
  }

  // To prevent browser aliasing/blur on large downscaling, downsample in half-steps
  let source = document.createElement('canvas');
  source.width = sw;
  source.height = sh;
  const srcCtx = source.getContext('2d');
  if (!srcCtx) {
    throw new Error('2D context unavailable');
  }
  srcCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  while (source.width / 2 > w) {
    const half = document.createElement('canvas');
    half.width = Math.max(w, Math.round(source.width / 2));
    half.height = Math.max(h, Math.round(source.height / 2));
    const hCtx = half.getContext('2d');
    if (hCtx) {
      hCtx.imageSmoothingEnabled = true;
      hCtx.imageSmoothingQuality = 'high';
      hCtx.drawImage(source, 0, 0, half.width, half.height);
    }
    source = half;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
  mime: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const q = mime === 'image/png' ? undefined : quality / 100;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`toBlob failed (${canvas.width}x${canvas.height})`));
        } else {
          resolve(blob);
        }
      },
      mime,
      q
    );
  });
}

export function sanitizeName(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, '') // slice extension
      .replace(/[\\/:*?"<>|]+/g, '-') // replace invalid path letters with -
      .replace(/\s+/g, '-') // replace spaces with -
      .trim() || 'image'
  );
}
