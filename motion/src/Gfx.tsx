import React from 'react';
import {interpolate} from 'remotion';
import {Cue} from './timeline';
import {appear, at, enter, mix, span, useCx} from './theme';

// Hero graphics. Each one lays out inside a 900×H box (H = 160 dynamic, 200 calm).

const Row: React.FC<{children: React.ReactNode; gap?: number; style?: React.CSSProperties}> = ({children, gap = 24, style}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap, width: '100%', height: '100%', ...style}}>{children}</div>
);

const Num: React.FC<{v: number; color: string; size?: number}> = ({v, color, size = 76}) => {
  const {t} = useCx();
  return <div style={{fontFamily: t.head, fontWeight: 700, fontSize: size, color, minWidth: size * 1.9, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{Math.round(v)}%</div>;
};

const Battery: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const p = span(cx, cue.ev[0], cue.ev[1]);
  const v = interpolate(p, [0, 1], [100, 12]);
  const c = p < 0.5 ? mix(t.good, t.dyn ? '#ffc94a' : '#c99a3e', p * 2) : mix(t.dyn ? '#ffc94a' : '#c99a3e', t.alarm, p * 2 - 1);
  const blink = p > 0.95 && Math.floor(cx.f / (t.fast ? 6 : 14)) % 2 === 0 ? 0.45 : 1;
  return <Row gap={36} style={appear(t, enter(cx, cx.start))}>
    <div style={{position: 'relative', width: 330, height: 128, border: `7px solid ${t.ink}`, borderRadius: 26, padding: 10}}>
      <div style={{width: `${v}%`, height: '100%', background: c, borderRadius: 13, opacity: blink}} />
      <div style={{position: 'absolute', right: -24, top: 36, width: 14, height: 42, background: t.ink, borderRadius: 4}} />
    </div>
    <Num v={v} color={c} />
  </Row>;
};

const Chip: React.FC<{label: string; p: number; dashed?: boolean; color?: string}> = ({label, p, dashed, color}) => {
  const {t} = useCx();
  return <div style={{
    ...appear(t, p), fontFamily: t.head, fontWeight: 700, fontSize: 52, color: color ?? t.ink, padding: '14px 30px',
    border: `4px ${dashed ? 'dashed' : 'solid'} ${color ?? t.ink}`, borderRadius: 22, letterSpacing: 1,
  }}>{label}</div>;
};

const Days: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const strike = span(cx, cue.ev[2], cue.ev[2] + 0.4);
  return <Row gap={18} style={{position: 'relative'}}>
    <Chip label="СБ" p={enter(cx, cue.ev[0])} />
    <Chip label="ВС" p={enter(cx, cue.ev[0], 4)} />
    <Chip label="+ПН" p={enter(cx, cue.ev[1])} dashed color={t.accent} />
    <Chip label="+ВТ" p={enter(cx, cue.ev[1], 5)} dashed color={t.accent} />
    <svg style={{position: 'absolute', left: 0, top: 0}} width="900" height="100%" viewBox="0 0 900 160" preserveAspectRatio="none">
      <path d="M90 92 C300 60 600 110 810 70" stroke={t.alarm} strokeWidth="9" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
    </svg>
  </Row>;
};

const Pill: React.FC<{label: string; state: string; color: string; p: number; pulse?: boolean}> = ({label, state, color, p, pulse}) => {
  const cx = useCx(); const {t} = cx;
  const glow = pulse ? 0.55 + 0.45 * Math.sin(cx.f / (t.fast ? 2.5 : 6)) : 1;
  return <div style={{...appear(t, p), display: 'flex', flexDirection: 'column', gap: 6, padding: '18px 30px', borderRadius: 24, border: `3px solid ${t.line}`, minWidth: 330}}>
    <div style={{fontFamily: t.body, fontWeight: 600, fontSize: 28, color: t.sub}}>{label}</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: t.head, fontWeight: 700, fontSize: 50, color: t.ink}}>
      <div style={{width: 22, height: 22, borderRadius: 11, background: color, opacity: glow}} />{state}
    </div>
  </div>;
};

const Neq: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  return <Row gap={28}>
    <Pill label="тело" state="стоп" color={t.good} p={enter(cx, cue.ev[0])} />
    <div style={{...appear(t, enter(cx, cue.ev[2])), fontFamily: t.head, fontWeight: 700, fontSize: 110, color: t.alarm, lineHeight: 1}}>≠</div>
    <Pill label="голова" state="в работе" color={t.alarm} p={enter(cx, cue.ev[1])} pulse />
  </Row>;
};

const Meter: React.FC<{v: number; color: string; w?: number}> = ({v, color, w = 520}) => {
  const {t} = useCx();
  return <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
    <div style={{fontFamily: t.body, fontWeight: 800, fontSize: 26, color: t.sub, letterSpacing: 3}}>CPU</div>
    <div style={{width: w, height: 46, borderRadius: 12, background: t.line, overflow: 'hidden', display: 'flex', gap: 4, padding: 5}}>
      {Array.from({length: 20}, (_, i) => <div key={i} style={{flex: 1, borderRadius: 4, background: color, opacity: i < (v / 100) * 20 ? 1 : 0.08}} />)}
    </div>
    <Num v={v} color={color} size={64} />
  </div>;
};

const jitter = (f: number) => 2 * Math.sin(f * 0.9) + 1.3 * Math.sin(f * 2.3);

const Tabs: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const names = ['Почта', 'Отчёт', 'Чат', 'Задачи'];
  const load = span(cx, cue.ev[2], cue.ev[2] + 0.9);
  return <div style={{...appear(t, enter(cx, cx.start)), width: 900, height: '100%', borderRadius: 18, border: `3px solid ${t.line}`, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
    <div style={{height: 64, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 16px', background: t.line}}>
      {names.map((n, i) => {
        const open = enter(cx, cue.ev[0], i * 4);
        const close = span(cx, cue.ev[1] + i * 0.18, cue.ev[1] + i * 0.18 + 0.25);
        return <div key={n} style={{
          width: 196 * (1 - close), opacity: open * (1 - close), overflow: 'hidden', whiteSpace: 'nowrap', height: 54,
          borderRadius: '12px 12px 0 0', background: t.dyn ? '#232a38' : '#fffdf9', display: 'flex', alignItems: 'center', gap: 10,
          padding: close < 1 ? '0 16px' : 0, fontFamily: t.body, fontWeight: 800, fontSize: 28, color: t.ink,
        }}>{n}<span style={{marginLeft: 'auto', color: t.sub}}>×</span></div>;
      })}
    </div>
    <div style={{flex: 1, position: 'relative'}}>
      <div style={{position: 'absolute', inset: '18px 28px', display: 'flex', flexDirection: 'column', gap: 12, opacity: enter(cx, cue.ev[0], 6) * (1 - span(cx, cue.ev[1], cue.ev[1] + 0.8))}}>
        {[78, 92, 64].map((w) => <div key={w} style={{width: `${w}%`, height: 12, borderRadius: 6, background: t.line}} />)}
      </div>
      <Row style={{position: 'absolute', inset: 0, opacity: load}}><Meter v={interpolate(load, [0, 1], [10, 92]) + jitter(cx.f) * load} color={mix(t.accent, t.alarm, load)} w={460} /></Row>
    </div>
  </div>;
};

const Cpu: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const p = span(cx, cue.ev[1], cue.ev[2] + 0.2);
  return <Row style={appear(t, enter(cx, cue.ev[0]))}><Meter v={interpolate(p, [0, 1], [35, 97]) + jitter(cx.f) * p} color={mix(t.accent, t.alarm, p)} /></Row>;
};

const CpuDrop: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const p = span(cx, cue.ev[0], cue.ev[1]);
  return <Row style={appear(t, enter(cx, cx.start))}><Meter v={interpolate(p, [0, 1], [97, 6]) + jitter(cx.f) * (1 - p)} color={mix(t.alarm, t.good, p)} /></Row>;
};

const Tick: React.FC<{p: number; size?: number; color?: string}> = ({p, size = 44, color}) => {
  const {t} = useCx();
  return <svg width={size} height={size} viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="none" stroke={color ?? t.accent} strokeWidth="4" />
    <path d="M12 23l7 7 14-15" fill="none" stroke={color ?? t.accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} /></svg>;
};

const Check: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const items = cue.items ?? [];
  if (t.dyn) {
    // One question at a time with a 1/3 counter.
    const i = cue.ev.filter((e) => at(cx, e) <= cx.f).length - 1;
    if (i < 0) return <Row style={{fontFamily: t.head, fontWeight: 700, fontSize: 64, color: t.sub, letterSpacing: 18}}>· · ·</Row>;
    const p = enter(cx, cue.ev[i]);
    return <Row gap={30} key={i}>
      <div style={{...appear(t, p), fontFamily: t.head, fontWeight: 700, fontSize: 96, color: t.accent}}>{i + 1}/3</div>
      <div style={{...appear(t, enter(cx, cue.ev[i], 3)), fontFamily: t.body, fontWeight: 800, fontSize: 42, color: t.ink, width: 640, lineHeight: 1.12}}>{items[i]}</div>
    </Row>;
  }
  return <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, height: '100%', paddingLeft: 40}}>
    {items.map((q, i) => <div key={q} style={{...appear(t, enter(cx, cue.ev[i])), display: 'flex', alignItems: 'center', gap: 20, fontFamily: t.body, fontWeight: 600, fontSize: 34, color: t.ink}}>
      <Tick p={span(cx, cue.ev[i] + 0.5, cue.ev[i] + 1.1)} />{q}
    </div>)}
  </div>;
};

const Load: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const widths = [300, 250, 280, 210];
  const heavy = span(cx, cue.ev[2], cue.ev[2] + 0.6);
  const sag = 8 + 26 * span(cx, cue.ev[0], cue.ev[2] + 0.6);
  const beam = mix(t.dyn ? '#ffffff' : '#2b2723', t.alarm, heavy);
  return <svg width="900" height="100%" viewBox="0 0 900 160">
    {widths.map((w, i) => {
      const p = enter(cx, cue.ev[0] + (i * (cue.ev[1] - cue.ev[0])) / 3);
      const y = 112 - (i + 1) * 30 + sag * 0.8 - (1 - p) * 120;
      return <rect key={i} x={450 - w / 2 + (i % 2 ? 14 : -10)} y={y} width={w} height={26} rx={7} fill={i % 2 ? t.accent : mix(t.accent, t.alarm, heavy)} opacity={Math.min(1, p * 2)} />;
    })}
    <path d={`M150 ${116} Q450 ${116 + sag * 1.6} 750 ${116}`} stroke={beam} strokeWidth="10" strokeLinecap="round" fill="none" />
    <path d="M150 116 l-26 34 h52Z M750 116 l-26 34 h52Z" fill={t.sub} />
  </svg>;
};

const Toggle: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const off = t.fast ? enter(cx, cue.ev[1]) : span(cx, cue.ev[1], cue.ev[1] + 0.6);
  const c = mix(t.alarm, t.good, off);
  return <Row gap={34} style={appear(t, enter(cx, cue.ev[0]))}>
    <div style={{fontFamily: t.head, fontWeight: 700, fontSize: 62, color: t.ink}}>РАБОТА</div>
    <div style={{width: 210, height: 104, borderRadius: 52, background: c, position: 'relative'}}>
      <div style={{position: 'absolute', top: 10, left: 10 + 106 * (1 - off), width: 84, height: 84, borderRadius: 42, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,.25)'}} />
    </div>
    <div style={{fontFamily: t.head, fontWeight: 700, fontSize: 62, color: c, width: 190}}>{off > 0.5 ? 'ВЫКЛ' : 'ВКЛ'}</div>
    <Tick p={span(cx, cue.ev[1] + 0.25, cue.ev[1] + 0.7)} size={64} color={t.good} />
  </Row>;
};

// One step at a time with a segmented 5-step progress bar.
const Steps: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const items = cue.items ?? [];
  const i = cue.ev.filter((e) => at(cx, e) <= cx.f).length - 1;
  return <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 22}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 26, height: 96}} key={i}>
      {i >= 0 && <>
        <div style={{...appear(t, enter(cx, cue.ev[i])), width: 92, height: 92, borderRadius: 46, background: t.accent, color: t.dyn ? '#0d1017' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.head, fontWeight: 700, fontSize: 54}}>{i + 1}</div>
        <div style={{...appear(t, enter(cx, cue.ev[i], 3)), fontFamily: t.body, fontWeight: 800, fontSize: 52, color: t.ink}}>{items[i]}</div>
      </>}
    </div>
    <div style={{display: 'flex', gap: 10}}>
      {items.map((s, k) => <div key={s} style={{flex: 1, height: 12, borderRadius: 6, background: t.line, overflow: 'hidden'}}>
        <div style={{width: `${100 * span(cx, cue.ev[k], cue.ev[k] + 0.25)}%`, height: '100%', background: t.accent}} />
      </div>)}
    </div>
  </div>;
};

const Box: React.FC<{label: string; p: number; color: string}> = ({label, p, color}) => {
  const {t} = useCx();
  return <div style={{...appear(t, p), fontFamily: t.head, fontWeight: 700, fontSize: t.dyn ? 50 : 46, color, padding: '20px 30px', borderRadius: 22, border: `4px solid ${color}`}}>{label}</div>;
};

const Flow: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const p = span(cx, cue.ev[1], cue.ev[2]);
  return <Row gap={0}>
    <Box label={t.dyn ? 'ДЕЙСТВИЕ' : 'действие'} p={enter(cx, cue.ev[0])} color={t.ink} />
    <svg width="170" height="60" viewBox="0 0 170 60">
      <path d="M14 30H150M132 14l18 16-18 16" stroke={t.accent} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
    <Box label={t.dyn ? 'СПОКОЙСТВИЕ' : 'спокойствие'} p={enter(cx, cue.ev[2])} color={t.good} />
  </Row>;
};

const icons: Record<string, string> = {
  гулять: 'M24 8a5 5 0 1 0 0.1 0M22 18l-6 14 8 4 2 16M24 22l8 10 8-2M20 34l-8 16',
  книга: 'M6 12c8-4 14-4 20 2v34c-6-6-12-6-20-2ZM46 12c-8-4-14-4-20 2v34c6-6 12-6 20-2Z',
  друг: 'M16 10a6 6 0 1 0 0.1 0M36 10a6 6 0 1 0 0.1 0M4 46c0-12 6-18 12-18s12 6 12 18M24 46c0-12 6-18 12-18s12 6 12 18',
};

const Chips: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  return <Row gap={20}>
    {(cue.items ?? []).map((s, i) => <div key={s} style={{
      ...appear(t, enter(cx, cue.ev[i])), display: 'flex', alignItems: 'center', gap: 14, padding: '18px 28px', borderRadius: 60,
      border: `3px solid ${t.line}`, fontFamily: t.body, fontWeight: 800, fontSize: 40, color: t.ink,
    }}>
      <svg width="52" height="56" viewBox="0 0 52 56"><path d={icons[s]} fill="none" stroke={t.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>{s}
    </div>)}
  </Row>;
};

const Head: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const strike = span(cx, cue.ev[1], cue.ev[1] + 0.35);
  const ok = span(cx, cue.ev[3], cue.ev[3] + 0.5);
  return <Row gap={34}>
    <div style={{position: 'relative', ...appear(t, enter(cx, cue.ev[0]))}}>
      <Box label={t.dyn ? 'ВЫХОДНОЙ' : 'выходной'} p={1} color={mix(t.dyn ? '#ffffff' : '#2b2723', t.dyn ? '#80858f' : '#8a7f72', strike)} />
      <div style={{position: 'absolute', left: -10, right: -10, top: '50%', height: 7, borderRadius: 4, background: t.alarm, transform: `scaleX(${strike})`, transformOrigin: 'left'}} />
    </div>
    <svg width="90" height="40" viewBox="0 0 90 40" style={{opacity: enter(cx, cue.ev[2])}}><path d="M6 20h70M62 8l14 12-14 12" stroke={t.sub} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
    <div style={{...appear(t, enter(cx, cue.ev[2])), display: 'flex', alignItems: 'center', gap: 16}}>
      <svg width="120" height="130" viewBox="0 0 120 130">
        <path d="M34 122V98C14 88 8 66 12 48 18 20 42 6 66 8c26 2 44 22 44 48 0 12-4 20-2 26l8 14-12 4v12c0 8-8 12-18 10H76v10" fill="none" stroke={t.ink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <g transform="translate(40 30)"><path d="M6 22l12 12 22-24" fill="none" stroke={t.good} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ok} /></g>
      </svg>
      <div style={{fontFamily: t.body, fontWeight: 800, fontSize: 34, color: mix(t.dyn ? '#ffffff' : '#2b2723', t.good, ok), width: 220, lineHeight: 1.1, opacity: 0.3 + 0.7 * ok}}>работа закончена</div>
    </div>
  </Row>;
};

const Cta: React.FC<{cue: Cue}> = ({cue}) => {
  const cx = useCx(); const {t} = cx;
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return <Row gap={14}>
    {days.map((d, i) => {
      const p = enter(cx, cue.ev[0] + i * 0.13);
      const fill = span(cx, cue.ev[0] + 0.3 + i * 0.13, cue.ev[0] + 0.5 + i * 0.13);
      return <div key={d} style={{...appear(t, p), width: 108, height: 108, borderRadius: 54, border: `4px solid ${t.accent}`, background: mix(t.dyn ? '#0d1017' : '#fbf8f2', t.accent, fill),
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.head, fontWeight: 700, fontSize: 36, color: fill > 0.5 ? '#fff' : t.ink}}>{d}</div>;
    })}
  </Row>;
};

export const heroes: Record<Cue['kind'], React.FC<{cue: Cue}>> = {
  battery: Battery, days: Days, neq: Neq, tabs: Tabs, cpu: Cpu, check: Check, load: Load,
  toggle: Toggle, steps: Steps, flow: Flow, chips: Chips, head: Head, cpuDrop: CpuDrop, cta: Cta,
};
