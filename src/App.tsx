import { useState, useMemo } from 'react';
import { CHAMPIONS } from './data/champions';
import type { Champion, Role } from './data/types';
import { analyzeComp, getTopAntiCompItems, getBestRunes, getCompSummary } from './utils/compAnalysis';
import { clsx } from 'clsx';

type Side = 'blue' | 'red';
type Screen = 'draft' | 'analysis';

const ROLES: Role[] = ['top', 'jungle', 'mid', 'adc', 'support'];
const ROLE_LABELS: Record<Role, string> = {
  top: 'TOP', jungle: 'JNG', mid: 'MID', adc: 'ADC', support: 'SUP',
};
const ROLE_ICONS: Record<Role, string> = {
  top: '⚔️', jungle: '🌿', mid: '🔥', adc: '🏹', support: '🛡️',
};

const TAG_COLORS: Record<string, string> = {
  tank: 'border-blue-500 text-blue-400 bg-blue-950/30',
  fighter: 'border-orange-500 text-orange-400 bg-orange-950/30',
  mage: 'border-purple-500 text-purple-400 bg-purple-950/30',
  assassin: 'border-red-500 text-red-400 bg-red-950/30',
  marksman: 'border-yellow-500 text-yellow-400 bg-yellow-950/30',
  support: 'border-green-500 text-green-400 bg-green-950/30',
  healer: 'border-emerald-500 text-emerald-400 bg-emerald-950/30',
  shielder: 'border-cyan-500 text-cyan-400 bg-cyan-950/30',
  engage: 'border-rose-500 text-rose-400 bg-rose-950/30',
  poke: 'border-amber-500 text-amber-400 bg-amber-950/30',
  burst: 'border-pink-500 text-pink-400 bg-pink-950/30',
  diver: 'border-red-400 text-red-300 bg-red-950/30',
  enchanter: 'border-teal-400 text-teal-300 bg-teal-950/30',
  'split-pusher': 'border-lime-400 text-lime-300 bg-lime-950/30',
  teamfight: 'border-violet-400 text-violet-300 bg-violet-950/30',
  scaling: 'border-sky-400 text-sky-300 bg-sky-950/30',
  'early-game': 'border-orange-400 text-orange-300 bg-orange-950/30',
};

const TIER_COLORS: Record<string, string> = {
  S: 'text-yellow-300 bg-yellow-900/40 border-yellow-500',
  A: 'text-green-300 bg-green-900/40 border-green-500',
  B: 'text-blue-300 bg-blue-900/40 border-blue-500',
  C: 'text-gray-300 bg-gray-800/40 border-gray-500',
};

function ChampionIcon({ champion, size = 'md', dimmed = false, onClick }: {
  champion: Champion;
  size?: 'sm' | 'md' | 'lg';
  dimmed?: boolean;
  onClick?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' }[size];
  return (
    <div
      className={clsx(
        'rounded overflow-hidden flex items-center justify-center relative',
        sizeClass,
        dimmed && 'opacity-40 grayscale',
        onClick && 'cursor-pointer hover:ring-2 hover:ring-lol-gold transition-all',
      )}
      onClick={onClick}
    >
      {!imgError ? (
        <img
          src={champion.icon}
          alt={champion.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-lol-bg-3 flex items-center justify-center text-lol-gold text-xs font-bold">
          {champion.name.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

function EmptySlot({ role, side, onClick, active }: {
  role: Role;
  side: Side;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded border transition-all duration-200 w-full',
        active
          ? side === 'blue'
            ? 'border-lol-blue bg-lol-blue-dark/50 glow-blue'
            : 'border-lol-red bg-lol-red-dark/50 glow-red'
          : 'border-lol-border bg-lol-bg-card hover:border-lol-gold/50',
      )}
    >
      <span className="text-lg leading-none">{ROLE_ICONS[role]}</span>
      <span className="text-xs font-medium text-lol-parchment/60 tracking-widest font-display">
        {ROLE_LABELS[role]}
      </span>
      {active && (
        <span className={clsx(
          'ml-auto text-xs font-bold animate-pulse',
          side === 'blue' ? 'text-lol-blue' : 'text-lol-red',
        )}>PICK</span>
      )}
    </button>
  );
}

function FilledSlot({ champion, role, side, onClick }: {
  champion: Champion;
  role: Role;
  side: Side;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-2 py-1.5 rounded border transition-all duration-200 w-full group',
        side === 'blue'
          ? 'border-lol-blue/40 bg-gradient-to-r from-lol-blue-dark/30 to-transparent hover:border-lol-blue'
          : 'border-lol-red/40 bg-gradient-to-l from-lol-red-dark/30 to-transparent hover:border-lol-red',
      )}
    >
      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
        {!imgError ? (
          <img
            src={champion.icon}
            alt={champion.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-lol-bg-3 flex items-center justify-center text-lol-gold text-xs font-bold">
            {champion.name.slice(0, 2)}
          </div>
        )}
      </div>
      <div className={clsx('flex flex-col min-w-0', side === 'red' && 'items-end')}>
        <span className="text-sm font-semibold text-lol-gold-light truncate leading-tight">
          {champion.name}
        </span>
        <span className="text-xs text-lol-parchment/50 font-display tracking-wider">
          {ROLE_LABELS[role]}
        </span>
      </div>
      <span className="ml-auto text-lg flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-lol-red">×</span>
    </button>
  );
}

function ChampionPickerModal({ side, role, onPick, onClose, banned }: {
  side: Side;
  role: Role;
  onPick: (c: Champion) => void;
  onClose: () => void;
  banned: Set<string>;
}) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CHAMPIONS.filter(c => {
      if (banned.has(c.id)) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (filterRole !== 'all' && !c.roles.includes(filterRole)) return false;
      return true;
    });
  }, [search, filterRole, banned]);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-2xl mx-4 p-4 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lol-gold text-lg tracking-wider text-shadow-gold">
            {side === 'blue' ? '🔵' : '🔴'} Pick for {ROLE_LABELS[role]}
          </h2>
          <button onClick={onClose} className="text-lol-parchment/50 hover:text-lol-red text-2xl leading-none">×</button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search champion..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          className="w-full bg-lol-bg-3 border border-lol-border rounded px-3 py-2 text-lol-gold-light placeholder-lol-parchment/30 mb-3 focus:outline-none focus:border-lol-gold text-sm"
        />

        {/* Role Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterRole('all')}
            className={clsx('text-xs px-3 py-1 rounded border transition-all', filterRole === 'all' ? 'border-lol-gold text-lol-gold bg-lol-gold-dark/30' : 'border-lol-border text-lol-parchment/60 hover:border-lol-gold/50')}
          >All</button>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={clsx('text-xs px-3 py-1 rounded border transition-all', filterRole === r ? 'border-lol-gold text-lol-gold bg-lol-gold-dark/30' : 'border-lol-border text-lol-parchment/60 hover:border-lol-gold/50')}
            >
              {ROLE_ICONS[r]} {ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Champion Grid */}
        <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => onPick(c)}
              className="flex flex-col items-center gap-1 p-1.5 rounded border border-lol-border hover:border-lol-gold bg-lol-bg-3/50 hover:bg-lol-gold-dark/20 transition-all group"
            >
              <ChampionIcon champion={c} size="md" />
              <span className="text-xs text-lol-parchment/80 group-hover:text-lol-gold text-center leading-tight truncate w-full">
                {c.name}
              </span>
              <span className={clsx('tag-pill', TIER_COLORS[c.tier], 'text-[10px] px-1')}>
                {c.tier}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-5 text-center text-lol-parchment/40 py-8 text-sm">
              No champions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompAnalysisPanel({ yourPicks, enemyPicks, yourChamp }: {
  yourPicks: Array<{ role: Role; champion: Champion | null }>;
  enemyPicks: Array<{ role: Role; champion: Champion | null }>;
  yourChamp: Champion | null;
}) {
  const enemyChamps = enemyPicks.map(p => p.champion).filter(Boolean) as Champion[];
  const analysis = useMemo(() => analyzeComp(enemyChamps), [enemyChamps]);
  const antiItems = useMemo(
    () => yourChamp ? getTopAntiCompItems(yourChamp, enemyChamps) : [],
    [yourChamp, enemyChamps],
  );
  const bestRunes = useMemo(
    () => yourChamp ? getBestRunes(yourChamp, enemyChamps) : null,
    [yourChamp, enemyChamps],
  );
  const summary = getCompSummary(analysis);

  if (enemyChamps.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-lol-parchment/50 text-sm">Add enemy champions to see comp analysis</p>
      </div>
    );
  }

  const dmgTotal = Object.values(analysis.damageTypes).reduce((a, b) => a + b, 0);
  const adPct = dmgTotal > 0 ? Math.round(((analysis.damageTypes.AD + analysis.damageTypes.Mixed * 0.5) / dmgTotal) * 100) : 0;
  const apPct = 100 - adPct;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Comp Summary */}
      <div className="card p-3">
        <div className="text-xs font-display text-lol-gold tracking-widest mb-2 uppercase">Enemy Comp</div>
        <p className="text-sm text-lol-gold-light font-semibold">{summary}</p>

        {/* Damage Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-lol-parchment/60 mb-1">
            <span>⚔️ AD {adPct}%</span>
            <span>✨ AP {apPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-lol-bg-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${adPct}%`, background: 'linear-gradient(90deg, #C89B3C, #F0E6D3)' }}
            />
          </div>
        </div>

        {/* Threat Bars */}
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {[
            { label: 'Engage', val: analysis.engageLevel },
            { label: 'Healing', val: analysis.healingLevel },
            { label: 'Tanks', val: analysis.tankLevel },
            { label: 'Burst', val: analysis.burstLevel },
            { label: 'Poke', val: analysis.pokeLevel },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-lol-parchment/60 w-14">{label}</span>
              <div className="flex gap-0.5">
                {(['low', 'medium', 'high'] as const).map(lvl => (
                  <div
                    key={lvl}
                    className={clsx(
                      'w-3 h-3 rounded-sm border',
                      val === 'high' || (val === 'medium' && lvl !== 'high') || (val === 'low' && lvl === 'low')
                        ? val === 'high' ? 'bg-lol-red border-lol-red'
                          : val === 'medium' ? 'bg-lol-gold border-lol-gold'
                          : 'bg-lol-blue border-lol-blue'
                        : 'bg-transparent border-lol-border',
                      ((val === 'medium' && lvl === 'high') || (val === 'low' && lvl !== 'low')) && 'bg-transparent border-lol-border',
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Threats */}
      {analysis.threats.length > 0 && (
        <div className="card p-3">
          <div className="text-xs font-display text-lol-red tracking-widest mb-2 uppercase">⚠ Threats</div>
          <ul className="space-y-1">
            {analysis.threats.map((t, i) => (
              <li key={i} className="text-xs text-lol-parchment/80 flex gap-2">
                <span className="text-lol-red flex-shrink-0">›</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Win Conditions */}
      {analysis.winConditions.length > 0 && (
        <div className="card p-3">
          <div className="text-xs font-display text-lol-green tracking-widest mb-2 uppercase">Enemy Win Conditions</div>
          <ul className="space-y-1">
            {analysis.winConditions.map((w, i) => (
              <li key={i} className="text-xs text-lol-parchment/80 flex gap-2">
                <span className="text-lol-gold flex-shrink-0">›</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Anti-Comp Items */}
      {yourChamp && antiItems.length > 0 && (
        <div className="card p-3">
          <div className="text-xs font-display text-lol-gold tracking-widest mb-2 uppercase">
            🗡 Items vs Enemy Comp
          </div>
          <div className="space-y-2">
            {antiItems.map((item, i) => (
              <div key={i} className="flex gap-2 p-2 bg-lol-bg-3/50 rounded border border-lol-border/50">
                <div className="w-8 h-8 bg-lol-gold-dark/30 border border-lol-gold/30 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold text-lol-gold">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-lol-gold-light">{item.item}</p>
                  <p className="text-xs text-lol-parchment/60">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Runes */}
      {yourChamp && bestRunes && (
        <div className="card p-3">
          <div className="text-xs font-display text-lol-gold tracking-widest mb-2 uppercase">
            ✦ Optimal Rune Page
          </div>
          <div className="mb-2">
            <span className="text-sm font-bold text-lol-gold">{bestRunes.keystone}</span>
            <span className="text-xs text-lol-parchment/50 ml-2">— {bestRunes.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-lol-blue font-display tracking-wider mb-1">{bestRunes.primary}</p>
              <ul className="space-y-0.5">
                {bestRunes.primaryRunes.map((r, i) => (
                  <li key={i} className="text-xs text-lol-parchment/70">› {r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-lol-purple font-display tracking-wider mb-1">{bestRunes.secondary}</p>
              <ul className="space-y-0.5">
                {bestRunes.secondaryRunes.map((r, i) => (
                  <li key={i} className="text-xs text-lol-parchment/70">› {r}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            {bestRunes.shards.map((s, i) => (
              <span key={i} className="text-xs bg-lol-bg-3 border border-lol-border rounded px-1.5 py-0.5 text-lol-parchment/60">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChampionDetailPanel({ champion, enemyComp }: { champion: Champion; enemyComp: Champion[] }) {
  const antiItems = getTopAntiCompItems(champion, enemyComp, 5);
  const bestRunes = getBestRunes(champion, enemyComp);
  const build = champion.builds[0];

  return (
    <div className="card p-4 animate-slide-up space-y-4">
      {/* Header */}
      <div className="flex gap-3 items-center">
        <ChampionIcon champion={champion} size="lg" />
        <div>
          <h2 className="text-xl font-display text-lol-gold text-shadow-gold">{champion.name}</h2>
          <div className="flex gap-1 mt-1 flex-wrap">
            {champion.tags.slice(0, 3).map(t => (
              <span key={t} className={clsx('tag-pill text-[10px]', TAG_COLORS[t] ?? 'border-lol-border text-lol-parchment/60')}>
                {t}
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            {champion.roles.map(r => (
              <span key={r} className="text-xs text-lol-parchment/50 font-display tracking-wider">
                {ROLE_ICONS[r]} {ROLE_LABELS[r]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="divider-gold" />

      {/* Core Build */}
      <div>
        <p className="text-xs font-display text-lol-gold tracking-widest mb-2">CORE BUILD</p>
        <div className="flex gap-1.5 flex-wrap">
          {build.core.map(item => (
            <span key={item} className="text-xs bg-lol-gold-dark/20 border border-lol-gold/30 rounded px-2 py-0.5 text-lol-parchment">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Anti-Comp Items */}
      {enemyComp.length > 0 && antiItems.length > 0 && (
        <div>
          <p className="text-xs font-display text-lol-red tracking-widest mb-2">VS ENEMY COMP</p>
          <div className="space-y-1.5">
            {antiItems.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-xs text-lol-gold w-4 flex-shrink-0">{i + 1}.</span>
                <div>
                  <span className="text-xs font-semibold text-lol-gold-light">{item.item}</span>
                  <span className="text-xs text-lol-parchment/50 ml-1">— {item.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rune Page */}
      <div>
        <p className="text-xs font-display text-lol-gold tracking-widest mb-2">RUNE PAGE</p>
        <p className="text-sm font-bold text-lol-gold mb-1">{bestRunes.keystone}</p>
        <p className="text-xs text-lol-parchment/50 mb-2">{bestRunes.label}</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-lol-blue font-display mb-1">{bestRunes.primary}</p>
            {bestRunes.primaryRunes.map(r => <p key={r} className="text-lol-parchment/60">· {r}</p>)}
          </div>
          <div>
            <p className="text-lol-purple font-display mb-1">{bestRunes.secondary}</p>
            {bestRunes.secondaryRunes.map(r => <p key={r} className="text-lol-parchment/60">· {r}</p>)}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div>
        <p className="text-xs font-display text-lol-gold tracking-widest mb-2">PRO TIPS</p>
        <ul className="space-y-1">
          {champion.tips.map((tip, i) => (
            <li key={i} className="text-xs text-lol-parchment/70 flex gap-2">
              <span className="text-lol-gold flex-shrink-0">›</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  const [bluePicks, setBluePicks] = useState<Array<Champion | null>>(Array(5).fill(null));
  const [redPicks, setRedPicks] = useState<Array<Champion | null>>(Array(5).fill(null));
  const [activeSlot, setActiveSlot] = useState<{ side: Side; index: number } | null>(null);
  const [selectedChamp, setSelectedChamp] = useState<Champion | null>(null);
  const [yourSide, setYourSide] = useState<Side>('blue');

  const yourPicks = yourSide === 'blue' ? bluePicks : redPicks;
  const enemyPicks = yourSide === 'blue' ? redPicks : bluePicks;
  const setYourPicks = yourSide === 'blue' ? setBluePicks : setRedPicks;
  const setEnemyPicks = yourSide === 'blue' ? setRedPicks : setBluePicks;

  const bannedIds = useMemo(() => {
    const all = [...bluePicks, ...redPicks].filter(Boolean) as Champion[];
    return new Set(all.map(c => c.id));
  }, [bluePicks, redPicks]);

  const yourChamps = yourPicks.filter(Boolean) as Champion[];
  const enemyChamps = enemyPicks.filter(Boolean) as Champion[];

  function handlePick(champion: Champion) {
    if (!activeSlot) return;
    const { side, index } = activeSlot;
    if (side === 'blue') {
      const next = [...bluePicks];
      next[index] = champion;
      setBluePicks(next);
    } else {
      const next = [...redPicks];
      next[index] = champion;
      setRedPicks(next);
    }
    setActiveSlot(null);
  }

  function handleRemove(side: Side, index: number) {
    if (side === 'blue') {
      const next = [...bluePicks];
      next[index] = null;
      setBluePicks(next);
    } else {
      const next = [...redPicks];
      next[index] = null;
      setRedPicks(next);
    }
    if (selectedChamp) setSelectedChamp(null);
  }

  function openSlot(side: Side, index: number) {
    const picks = side === 'blue' ? bluePicks : redPicks;
    if (picks[index]) {
      handleRemove(side, index);
    } else {
      setActiveSlot({ side, index });
    }
  }

  return (
    <div className="min-h-screen bg-lol-bg">
      {/* Top Nav */}
      <nav className="border-b border-lol-border bg-lol-bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-lol-gold-dark border border-lol-gold flex items-center justify-center">
              <span className="text-lol-gold text-sm font-display">D</span>
            </div>
            <h1 className="font-display text-lol-gold tracking-widest text-lg text-shadow-gold">
              DRAFTWISE
            </h1>
            <span className="text-xs text-lol-parchment/30 border border-lol-border/50 px-2 py-0.5 rounded">
              Season 2025
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-lol-parchment/50">Playing:</span>
            <div className="flex rounded border border-lol-border overflow-hidden">
              <button
                onClick={() => setYourSide('blue')}
                className={clsx(
                  'px-3 py-1 text-xs font-display tracking-wider transition-all',
                  yourSide === 'blue' ? 'bg-lol-blue-dark text-lol-blue glow-blue' : 'text-lol-parchment/50 hover:text-lol-blue',
                )}
              >🔵 BLUE</button>
              <button
                onClick={() => setYourSide('red')}
                className={clsx(
                  'px-3 py-1 text-xs font-display tracking-wider transition-all',
                  yourSide === 'red' ? 'bg-lol-red-dark text-lol-red glow-red' : 'text-lol-parchment/50 hover:text-lol-red',
                )}
              >🔴 RED</button>
            </div>
            <button
              onClick={() => { setBluePicks(Array(5).fill(null)); setRedPicks(Array(5).fill(null)); setSelectedChamp(null); }}
              className="btn-ghost text-xs"
            >Reset</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4">

          {/* ─── BLUE SIDE ─── */}
          <div className="col-span-3">
            <div className="mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lol-blue glow-blue" />
              <span className="font-display text-lol-blue tracking-widest text-sm uppercase">
                {yourSide === 'blue' ? 'Your Team' : 'Enemy Team'}
              </span>
            </div>
            <div className="space-y-1.5">
              {ROLES.map((role, i) => {
                const champ = bluePicks[i];
                return champ ? (
                  <FilledSlot
                    key={role}
                    champion={champ}
                    role={role}
                    side="blue"
                    onClick={() => { setSelectedChamp(champ); openSlot('blue', i); }}
                  />
                ) : (
                  <EmptySlot
                    key={role}
                    role={role}
                    side="blue"
                    active={activeSlot?.side === 'blue' && activeSlot.index === i}
                    onClick={() => openSlot('blue', i)}
                  />
                );
              })}
            </div>

            {/* Blue team bonus info */}
            {yourSide === 'blue' && yourChamps.length > 0 && (
              <div className="mt-3 card p-3">
                <p className="text-xs font-display text-lol-blue tracking-widest mb-2">YOUR SYNERGIES</p>
                {yourChamps.map(c => (
                  c.synergyWith.length > 0 && (
                    <p key={c.id} className="text-xs text-lol-parchment/60 mb-0.5">
                      <span className="text-lol-gold">{c.name}</span>{' '}→{' '}
                      {c.synergyWith.slice(0, 2).join(', ')}
                    </p>
                  )
                ))}
              </div>
            )}
          </div>

          {/* ─── CENTER PANEL ─── */}
          <div className="col-span-6 space-y-4">
            {/* Match Banner */}
            <div className="card p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-glow opacity-50" />
              <div className="absolute inset-0 bg-red-glow opacity-50" style={{ backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(232,64,87,0.15) 0%, transparent 70%)' }} />
              <div className="relative">
                <h2 className="font-display text-2xl tracking-widest text-lol-gold text-shadow-gold">
                  DRAFT PHASE
                </h2>
                <p className="text-xs text-lol-parchment/40 mt-1">
                  Select champions to see optimal items & runes
                </p>
              </div>
            </div>

            {/* Comp Analysis */}
            <CompAnalysisPanel
              yourPicks={ROLES.map((r, i) => ({ role: r, champion: yourPicks[i] }))}
              enemyPicks={ROLES.map((r, i) => ({ role: r, champion: enemyPicks[i] }))}
              yourChamp={selectedChamp}
            />

            {/* Champion Detail */}
            {selectedChamp && (
              <ChampionDetailPanel champion={selectedChamp} enemyComp={enemyChamps} />
            )}

            {/* Quick Pick Guide */}
            {!selectedChamp && yourChamps.length === 0 && (
              <div className="card p-6">
                <h3 className="font-display text-lol-gold text-center mb-4 tracking-wider">HOW TO USE</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { icon: '1️⃣', title: 'Pick Champions', desc: 'Click any slot to select your team and enemy team' },
                    { icon: '2️⃣', title: 'Set Your Side', desc: 'Choose Blue or Red to tell DraftWise which team is yours' },
                    { icon: '3️⃣', title: 'Get Recommendations', desc: 'See optimal items and runes based on the enemy comp' },
                  ].map(step => (
                    <div key={step.icon} className="space-y-2">
                      <div className="text-3xl">{step.icon}</div>
                      <p className="text-sm font-semibold text-lol-gold">{step.title}</p>
                      <p className="text-xs text-lol-parchment/50">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── RED SIDE ─── */}
          <div className="col-span-3">
            <div className="mb-3 flex items-center gap-2 justify-end">
              <span className="font-display text-lol-red tracking-widest text-sm uppercase">
                {yourSide === 'red' ? 'Your Team' : 'Enemy Team'}
              </span>
              <div className="w-2 h-2 rounded-full bg-lol-red glow-red" />
            </div>
            <div className="space-y-1.5">
              {ROLES.map((role, i) => {
                const champ = redPicks[i];
                return champ ? (
                  <div key={role} style={{ direction: 'rtl' }}>
                    <div style={{ direction: 'ltr' }}>
                      <button
                        onClick={() => { setSelectedChamp(champ); openSlot('red', i); }}
                        className={clsx(
                          'flex items-center gap-2 px-2 py-1.5 rounded border transition-all duration-200 w-full group',
                          'border-lol-red/40 bg-gradient-to-r from-lol-red-dark/30 to-transparent hover:border-lol-red',
                        )}
                      >
                        <span className="ml-auto text-lg flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-lol-red">×</span>
                        <div className="flex flex-col items-end min-w-0 flex-1">
                          <span className="text-sm font-semibold text-lol-gold-light truncate leading-tight">
                            {champ.name}
                          </span>
                          <span className="text-xs text-lol-parchment/50 font-display tracking-wider">
                            {ROLE_LABELS[role]}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img src={champ.icon} alt={champ.name} className="w-full h-full object-cover" />
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={role} className="flex justify-end">
                    <button
                      onClick={() => openSlot('red', i)}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-2 rounded border transition-all duration-200 w-full justify-end',
                        activeSlot?.side === 'red' && activeSlot.index === i
                          ? 'border-lol-red bg-lol-red-dark/50 glow-red'
                          : 'border-lol-border bg-lol-bg-card hover:border-lol-gold/50',
                      )}
                    >
                      {activeSlot?.side === 'red' && activeSlot.index === i && (
                        <span className="text-xs font-bold text-lol-red animate-pulse">PICK</span>
                      )}
                      <span className="text-xs font-medium text-lol-parchment/60 tracking-widest font-display">
                        {ROLE_LABELS[role]}
                      </span>
                      <span className="text-lg leading-none">{ROLE_ICONS[role]}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Enemy team bonus info */}
            {yourSide === 'blue' && enemyChamps.length > 0 && (
              <div className="mt-3 card p-3">
                <p className="text-xs font-display text-lol-red tracking-widest mb-2">ENEMY COUNTERS</p>
                {enemyChamps.map(c => (
                  c.counters && c.counters.length > 0 && (
                    <p key={c.id} className="text-xs text-lol-parchment/60 mb-0.5">
                      <span className="text-lol-gold">{c.name}</span>{' '}counters{' '}
                      {c.counters.slice(0, 2).join(', ')}
                    </p>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Champion Browser ─── */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-lol-gold tracking-widest text-sm uppercase">Champion Browser</h2>
            <div className="flex-1 divider-gold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ROLES.map(role => (
              <div key={role} className="card p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{ROLE_ICONS[role]}</span>
                  <span className="font-display text-lol-gold tracking-wider text-sm">{ROLE_LABELS[role]}</span>
                  <span className="text-xs text-lol-parchment/40 ml-auto">Tier ranking</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CHAMPIONS.filter(c => c.roles.includes(role))
                    .sort((a, b) => ['S', 'A', 'B', 'C'].indexOf(a.tier) - ['S', 'A', 'B', 'C'].indexOf(b.tier))
                    .map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChamp(c)}
                        className={clsx(
                          'flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition-all',
                          selectedChamp?.id === c.id
                            ? 'border-lol-gold bg-lol-gold-dark/30 text-lol-gold'
                            : 'border-lol-border text-lol-parchment/70 hover:border-lol-gold/50 hover:text-lol-gold',
                        )}
                      >
                        <ChampionIcon champion={c} size="sm" />
                        <span>{c.name}</span>
                        <span className={clsx('tag-pill text-[10px] px-1', TIER_COLORS[c.tier])}>{c.tier}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Champion Picker Modal */}
      {activeSlot && (
        <ChampionPickerModal
          side={activeSlot.side}
          role={ROLES[activeSlot.index]}
          onPick={handlePick}
          onClose={() => setActiveSlot(null)}
          banned={bannedIds}
        />
      )}
    </div>
  );
}
