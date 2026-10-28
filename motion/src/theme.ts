import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import {loadFont as loadLora} from '@remotion/google-fonts/Lora';
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import {FPS} from './timeline';

const oswald = loadOswald('normal', {weights: ['600', '700'], subsets: ['cyrillic', 'latin']}).fontFamily;
const lora = loadLora('normal', {weights: ['500'], subsets: ['cyrillic', 'latin']}).fontFamily;
loadLora('italic', {weights: ['500'], subsets: ['cyrillic', 'latin']});
const manrope = loadManrope('normal', {weights: ['600', '800'], subsets: ['cyrillic', 'latin']}).fontFamily;

// Look (dark/light) and motion speed are independent: calmFast is the light look with dynamic motion.
export type Variant = 'dynamic' | 'calm' | 'calmFast';
export type Theme = {
  dyn: boolean; fast: boolean; ink: string; sub: string; accent: string; alarm: string; good: string;
  card: string; line: string; head: string; body: string;
};

export const themes = {
  dynamic: {
    dyn: true, fast: true, ink: '#ffffff', sub: 'rgba(255,255,255,.62)', accent: '#8fb6ff', alarm: '#ff5b4f', good: '#4fe08a',
    card: 'rgba(13,16,23,.88)', line: 'rgba(255,255,255,.16)', head: oswald, body: manrope,
  },
  calm: {
    dyn: false, fast: false, ink: '#2b2723', sub: '#8a7f72', accent: '#5e7f69', alarm: '#b4613f', good: '#5e7f69',
    card: '#fbf8f2', line: '#e4dccf', head: lora, body: manrope,
  },
} as Record<Variant, Theme>;
themes.calmFast = {...themes.calm, fast: true};

// Cue context: local frame helpers for the cue being drawn.
export type Cx = {t: Theme; f: number; start: number; dur: number};
export const CueCtx = React.createContext<Cx>(null as unknown as Cx);
export const useCx = () => React.useContext(CueCtx);

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const calmEase = Easing.bezier(0.22, 1, 0.36, 1);

// Local frame of an absolute source time.
export const at = (cx: Cx, sec: number) => (sec - cx.start) * FPS;

// 0→1 entrance. Dynamic overshoots on a spring; calm eases in slowly.
export const enter = (cx: Cx, sec: number, delay = 0) => {
  const d = at(cx, sec) + delay;
  return cx.t.fast
    ? spring({frame: cx.f - d, fps: FPS, config: {damping: 11, stiffness: 240, mass: 0.55}})
    : interpolate(cx.f, [d, d + 22], [0, 1], {...clamp, easing: calmEase});
};

// 0→1 between two absolute times, eased.
export const span = (cx: Cx, a: number, b: number) =>
  interpolate(cx.f, [at(cx, a), at(cx, b)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});

export const appear = (t: Theme, p: number): React.CSSProperties =>
  t.fast
    ? {opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 36}px) scale(${0.8 + 0.2 * p})`}
    : {opacity: p, transform: `translateY(${(1 - p) * 14}px)`};

export const mix = (a: string, b: string, p: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.min(1, Math.max(0, p)))).join(',')})`;
};
