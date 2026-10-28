import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {Cue, DYNAMIC_TRIM, FPS, SOURCE_FRAMES, cues, sentenceStarts} from './timeline';
import {CueCtx, Theme, Variant, appear, enter, span, themes, useCx} from './theme';
import {heroes} from './Gfx';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// Layout (1080×1920). TikTok UI covers roughly the top 230 px, bottom 500 px and a right rail.
// The face starts at y≈515 and burned-in captions sit at y≈1265, so graphics live above the head.
const CARD = {left: 60, width: 960};
const DYN = {top: 236, height: 264};
const CALM = {title: 236, top: 330, height: 250, frame: {left: 76, top: 440, width: 928, scale: 0.86, crop: 180}};

const Rich: React.FC<{text: string; t: Theme}> = ({text, t}) => <>
  {text.split('*').map((s, i) => i % 2
    ? <span key={i} style={{color: t.accent, fontStyle: t.dyn ? 'normal' : 'italic'}}>{s}</span>
    : <span key={i}>{s}</span>)}
</>;

const CueView: React.FC<{cue: Cue; t: Theme; start: number; dur: number}> = ({cue, t, start, dur}) => {
  // The opening cue is pre-rolled so the hook is already on screen in the very first frame.
  const f = useCurrentFrame() + (cue.at === 0 ? 14 : 0);
  const Hero = heroes[cue.kind];
  const out = interpolate(f, [dur - (t.fast ? 5 : 12), dur], [1, 0], clamp);
  return <CueCtx.Provider value={{t, f, start, dur}}><CueBody cue={cue} out={out} Hero={Hero} /></CueCtx.Provider>;
};

const CueBody: React.FC<{cue: Cue; out: number; Hero: React.FC<{cue: Cue}>}> = ({cue, out, Hero}) => {
  const cx = useCx(); const {t} = cx;
  if (t.dyn) {
    const p = enter(cx, cx.start);
    return <div style={{
      position: 'absolute', ...CARD, ...DYN, borderRadius: 26, background: t.card, padding: '16px 30px 14px',
      display: 'flex', flexDirection: 'column', boxShadow: '0 14px 40px rgba(0,0,0,.35)',
      opacity: Math.min(1, p * 2) * out, transform: `translateY(${(1 - p) * -50}px) scale(${0.94 + 0.06 * out})`,
    }}>
      <div style={{fontFamily: t.head, fontWeight: 700, fontSize: 48, lineHeight: '56px', color: t.ink, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap'}}><Rich text={cue.title} t={t} /></div>
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{width: 900, height: 160}}><Hero cue={cue} /></div></div>
    </div>;
  }
  const p = enter(cx, cx.start);
  return <div style={{opacity: out}}>
    <div style={{position: 'absolute', ...CARD, top: CALM.title, textAlign: 'center', fontFamily: t.head, fontWeight: 500, fontSize: 58, lineHeight: '72px', color: t.ink, whiteSpace: 'nowrap', ...appear(t, p)}}>
      <Rich text={cue.title} t={t} />
    </div>
    <div style={{position: 'absolute', ...CARD, top: CALM.top + 25, height: 200, display: 'flex', justifyContent: 'center'}}><div style={{width: 900, height: 200}}><Hero cue={cue} /></div></div>
  </div>;
};

// Speech bubble that points at the comment button for the final ask.
const CommentNudge: React.FC<{t: Theme; at: number}> = ({t, at}) => {
  const f = useCurrentFrame();
  const cx = {t, f, start: at, dur: 999};
  const p = enter(cx, at);
  const draw = span(cx, at + 0.3, at + 1.0);
  const box = t.dyn ? {left: 750, top: 520} : {left: 738, top: 596};
  const tip = t.dyn ? 'M930 712 C 1010 820, 1015 980, 965 1120' : 'M920 770 C 1000 860, 1015 1000, 965 1130';
  const ink = t.dyn ? '#ffffff' : t.accent;
  return <AbsoluteFill>
    <svg width="1080" height="1920" style={{position: 'absolute'}}>
      <path d={tip} fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <path d={t.dyn ? 'M942 1098l23 22 12-30' : 'M942 1108l23 22 12-30'} fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity={draw > 0.95 ? 1 : 0} />
    </svg>
    <div style={{
      position: 'absolute', ...box, width: 316, padding: '18px 24px', borderRadius: '28px 28px 28px 6px', background: t.dyn ? '#ffffff' : t.card,
      boxShadow: '0 10px 28px rgba(0,0,0,.25)', fontFamily: t.body, fontWeight: 800, fontSize: 31, lineHeight: 1.15, color: t.dyn ? '#11141b' : t.ink,
      opacity: Math.min(1, p * 2), transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: '0 100%',
    }}>Напишите,<br />как получилось</div>
  </AbsoluteFill>;
};

type Sfx = [number, string, number];
const sfxFor = (cue: Cue, dyn: boolean): Sfx[] => {
  if (!dyn) return ['tabs', 'check', 'steps', 'head', 'cta'].includes(cue.kind) ? [[cue.at, 'chime', 0.16]] : [];
  const e = cue.ev; const list: Sfx[] = [[Math.max(cue.at, DYNAMIC_TRIM / FPS), 'whoosh', 0.22]];
  const add = (s: number, n: string, v = 0.28) => list.push([s, n, v]);
  switch (cue.kind) {
    case 'days': add(e[1], 'pop'); add(e[2], 'whoosh', 0.18); break;
    case 'neq': add(e[0], 'pop'); add(e[1], 'pop'); add(e[2], 'pop', 0.35); break;
    case 'tabs': add(e[1], 'tick', 0.22); add(e[2], 'rise', 0.22); break;
    case 'cpu': add(e[1], 'rise', 0.26); break;
    case 'check': e.forEach((s) => add(s, 'pop')); break;
    case 'load': add(e[0], 'pop'); add(e[1], 'pop'); add(e[2], 'whoosh', 0.18); break;
    case 'toggle': add(e[1], 'ding', 0.3); break;
    case 'steps': e.forEach((s) => add(s, 'tick', 0.3)); break;
    case 'flow': add(e[0], 'pop'); add(e[2], 'pop'); break;
    case 'chips': e.forEach((s) => add(s, 'pop')); break;
    case 'head': add(e[1], 'whoosh', 0.16); add(e[3], 'ding', 0.3); break;
    case 'cpuDrop': add(e[0], 'down', 0.3); break;
    case 'cta': add(e[1], 'pop', 0.32); break;
  }
  return list;
};

// Dynamic framing: alternate 100% / 109% on each sentence, plus an impact zoom on frame 0.
const punch = (f: number, trim: number) => {
  const sec = f / FPS + trim / FPS;
  const i = sentenceStarts.filter((s) => s <= sec).length - 1;
  const scaleOf = (k: number) => (k % 2 ? 1.09 : 1);
  const s0 = (sentenceStarts[i] ?? 0) * FPS - trim;
  const z = i < 1 ? 1 : interpolate(f, [s0, s0 + 4], [scaleOf(i - 1), scaleOf(i)], {...clamp, easing: Easing.out(Easing.cubic)});
  return z * interpolate(f, [0, 10], [1.16, 1], {...clamp, easing: Easing.out(Easing.cubic)});
};

// Light card gives a short spring kick whenever a new cue lands (fast motion only).
const cardBump = (f: number, trim: number) => {
  const starts = cues.map((c) => Math.max(0, Math.round(c.at * FPS) - trim)).filter((s) => s > 0 && s <= f);
  if (!starts.length) return 1;
  const p = spring({frame: f - starts[starts.length - 1], fps: FPS, config: {damping: 10, stiffness: 260, mass: 0.5}});
  return 0.965 + 0.035 * p;
};

export const Edit: React.FC<{variant: Variant}> = ({variant}) => {
  const f = useCurrentFrame();
  const t = themes[variant];
  const trim = t.fast ? DYNAMIC_TRIM : 0;
  const total = SOURCE_FRAMES - trim;
  const fr = (sec: number) => Math.max(0, Math.round(sec * FPS) - trim);
  const cta = cues[cues.length - 1];
  const {frame} = CALM;
  return <AbsoluteFill style={{background: t.dyn ? '#000' : '#eee7db'}}>
    {t.dyn ? <>
      <AbsoluteFill style={{transform: `scale(${punch(f, trim)})`, transformOrigin: '50% 27%'}}>
        <Video src={staticFile('source.mp4')} trimBefore={trim} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,.28) 0px, rgba(0,0,0,.12) 520px, rgba(0,0,0,0) 640px)'}} />
    </> : <>
      <svg width="1080" height="1920" style={{position: 'absolute', opacity: 0.07}}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /></filter>
        <rect width="1080" height="1920" filter="url(#grain)" />
      </svg>
      <div style={{position: 'absolute', left: frame.left, top: frame.top, width: frame.width, height: 1920 - frame.top + 40, borderRadius: 40, overflow: 'hidden', boxShadow: '0 18px 50px rgba(70,50,30,.22)'}}>
        <div style={{position: 'absolute', left: 0, top: -frame.crop * frame.scale, width: frame.width, height: 1920 * frame.scale,
          transform: `scale(${t.fast ? punch(f, trim) : 1 + 0.035 * (f / total)})`, transformOrigin: t.fast ? '50% 27%' : '50% 30%'}}>
          <Video src={staticFile('source.mp4')} trimBefore={trim} style={{width: '100%', height: '100%'}} />
        </div>
      </div>
      <div style={{position: 'absolute', ...CARD, top: CALM.top, height: CALM.height, borderRadius: 28, background: t.card, boxShadow: '0 10px 30px rgba(60,40,20,.14)',
        ...(t.fast ? {transform: `scale(${cardBump(f, trim)})`} : {opacity: interpolate(f, [0, 18], [0, 1], clamp)})}} />
    </>}
    {cues.map((cue) => {
      const start = Math.max(cue.at, trim / FPS);
      const from = fr(start); const dur = fr(cue.to) - from;
      return <Sequence key={cue.at} name={cue.title.replace(/\*/g, '')} from={from} durationInFrames={dur} layout="none">
        <CueView cue={cue} t={t} start={start} dur={dur} />
      </Sequence>;
    })}
    <Sequence from={fr(cta.ev[1])} layout="none"><CommentNudge t={t} at={cta.ev[1]} /></Sequence>
    {cues.flatMap((cue) => sfxFor(cue, t.fast)).filter(([s]) => s * FPS >= trim).map(([s, n, v], i) =>
      <Sequence key={i} from={fr(s)} durationInFrames={90} layout="none"><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};

export const durationOf = (v: Variant) => SOURCE_FRAMES - (themes[v].fast ? DYNAMIC_TRIM : 0);
