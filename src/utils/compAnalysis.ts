import type { Champion, CompAnalysis, CompTag, AntiCompItem } from '../data/types';

export function analyzeComp(champions: Champion[]): CompAnalysis {
  if (champions.length === 0) {
    return emptyAnalysis();
  }

  const allTags = champions.flatMap(c => c.tags);
  const tagCounts: Partial<Record<CompTag, number>> = {};
  for (const t of allTags) {
    tagCounts[t] = (tagCounts[t] ?? 0) + 1;
  }

  const countTag = (t: CompTag) => tagCounts[t] ?? 0;

  const damageTypes = { AD: 0, AP: 0, Mixed: 0, True: 0 };
  for (const c of champions) damageTypes[c.damageType]++;

  const healingLevel = countTag('healer') >= 2 ? 'high' : countTag('healer') === 1 ? 'medium' : 'low';
  const engageLevel = (countTag('engage') + countTag('diver')) >= 3 ? 'high' : (countTag('engage') + countTag('diver')) >= 1 ? 'medium' : 'low';
  const tankLevel = countTag('tank') >= 2 ? 'high' : countTag('tank') === 1 ? 'medium' : 'low';
  const burstLevel = (countTag('burst') + countTag('assassin')) >= 2 ? 'high' : (countTag('burst') + countTag('assassin')) >= 1 ? 'medium' : 'low';
  const pokeLevel = countTag('poke') >= 2 ? 'high' : countTag('poke') === 1 ? 'medium' : 'low';

  const adTotal = damageTypes.AD + damageTypes.Mixed * 0.5;
  const apTotal = damageTypes.AP + damageTypes.Mixed * 0.5;
  const scalingLevel: CompAnalysis['scalingLevel'] =
    countTag('scaling') >= 2 ? 'late' : countTag('early-game') >= 2 ? 'early' : 'mid';

  const winConditions: string[] = [];
  const threats: string[] = [];

  if (engageLevel === 'high') winConditions.push('Full engage teamfight — stay grouped');
  if (pokeLevel === 'high') winConditions.push('Poke enemies to low HP before fights');
  if (countTag('split-pusher') >= 1) winConditions.push('Split push pressure to draw resources');
  if (scalingLevel === 'late') winConditions.push('Late game hypercarry — stall and scale');
  if (countTag('teamfight') >= 2) winConditions.push('AOE teamfight dominance');
  if (countTag('assassin') >= 2) winConditions.push('Pick off isolated targets early');

  if (healingLevel === 'high') threats.push('Massive sustain — need Grievous Wounds immediately');
  if (engageLevel === 'high') threats.push('Hard CC chains — build QSS / tenacity');
  if (burstLevel === 'high') threats.push('One-shot burst — build shields / defensive items');
  if (adTotal >= 3) threats.push('Heavy AD damage — stack armor');
  if (apTotal >= 3) threats.push('Heavy AP damage — stack magic resist');
  if (countTag('shielder') >= 2) threats.push('Shielding comps — build Serpent\'s Fang / Shadowflame');
  if (pokeLevel === 'high') threats.push('Sustained poke — short-trade items, health sustain');

  return {
    damageTypes,
    tags: Object.entries(tagCounts)
      .filter(([, v]) => v > 0)
      .map(([k]) => k as CompTag),
    engageLevel,
    healingLevel,
    tankLevel,
    burstLevel,
    pokeLevel,
    scalingLevel,
    winConditions,
    threats,
  };
}

export function getAntiCompItems(
  yourChamp: Champion,
  enemyComp: Champion[]
): AntiCompItem[] {
  const analysis = analyzeComp(enemyComp);
  const enemyTags = analysis.tags;

  const all = yourChamp.builds[0]?.antiComp ?? [];

  // Score each anti-comp item by how many enemy tags it addresses
  const scored = all.map(item => {
    const matchCount = item.vsTag.filter(tag => enemyTags.includes(tag)).length;
    return { ...item, score: matchCount };
  }).filter(i => i.score > 0);

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

export function getTopAntiCompItems(
  yourChamp: Champion,
  enemyComp: Champion[],
  max = 4
): AntiCompItem[] {
  const scored = getAntiCompItems(yourChamp, enemyComp);
  // If no matches, return the top items anyway
  if (scored.length === 0) {
    return yourChamp.builds[0]?.antiComp.slice(0, max) ?? [];
  }
  return scored.slice(0, max);
}

export function getBestRunes(yourChamp: Champion, enemyComp: Champion[]) {
  const analysis = analyzeComp(enemyComp);
  const enemyTags = analysis.tags;

  const runePages = yourChamp.runes;
  if (runePages.length === 1) return runePages[0];

  // Find the rune page whose vsCondition matches
  for (const page of runePages) {
    if (page.vsCondition && enemyTags.includes(page.vsCondition as CompTag)) {
      return page;
    }
  }
  return runePages[0];
}

export function getCompSummary(analysis: CompAnalysis): string {
  const parts: string[] = [];
  if (analysis.tankLevel === 'high') parts.push('Tank-heavy');
  if (analysis.healingLevel === 'high') parts.push('High healing/sustain');
  if (analysis.burstLevel === 'high') parts.push('Burst/assassin');
  if (analysis.pokeLevel === 'high') parts.push('Poke');
  if (analysis.engageLevel === 'high') parts.push('Hard engage');
  const adPct = Math.round(
    ((analysis.damageTypes.AD + analysis.damageTypes.Mixed * 0.5) /
      Math.max(1, Object.values(analysis.damageTypes).reduce((a, b) => a + b))) * 100
  );
  if (adPct > 70) parts.push('AD dominant');
  else if (adPct < 30) parts.push('AP dominant');
  else parts.push('Mixed damage');
  return parts.join(' · ') || 'Balanced';
}

function emptyAnalysis(): CompAnalysis {
  return {
    damageTypes: { AD: 0, AP: 0, Mixed: 0, True: 0 },
    tags: [],
    engageLevel: 'low',
    healingLevel: 'low',
    tankLevel: 'low',
    burstLevel: 'low',
    pokeLevel: 'low',
    scalingLevel: 'mid',
    winConditions: [],
    threats: [],
  };
}
