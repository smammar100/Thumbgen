/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FormatMode = 'webp' | 'jpeg' | 'png';

export type AspectRatioType = '1:1' | '16:9' | '4:3' | '3:4' | '40:21' | 'original';

export type NamingMode = 'num' | 'prefix-original' | 'original' | 'custom';

export interface ImageFileEntry {
  id: string;
  file: File;
  img: HTMLImageElement;
  url: string;
  name: string;
  canvas: HTMLCanvasElement | null;
  outputDims: { w: number; h: number } | null;
}

export interface GeneratorState {
  files: ImageFileEntry[];
  aspect: AspectRatioType;
  anchorX: number;
  anchorY: number;
  quality: number;
  maxWidth: number;
  prefix: string;
  naming: NamingMode;
  format: FormatMode;
  processing: boolean;
  status: string;
}
