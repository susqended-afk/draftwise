export type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support';
export type DamageType = 'AD' | 'AP' | 'Mixed' | 'True';
export type CompTag =
  | 'tank' | 'fighter' | 'mage' | 'assassin' | 'marksman' | 'support'
  | 'healer' | 'shielder' | 'engage' | 'poke' | 'burst' | 'diver'
  | 'enchanter' | 'split-pusher' | 'teamfight' | 'scaling' | 'early-game';

export type RuneTree = 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';

export interface RunePage {
  keystone: string;
  primary: RuneTree;
  primaryRunes: string[];
  secondary: RuneTree;
  secondaryRunes: string[];
  shards: string[];
  label: string;
  vsCondition?: string;
}

export interface ItemBuild {
  starter: string[];
  core: string[];
  antiComp: AntiCompItem[];
  boots: string[];
  situational: string[];
  label?: string;
}

export interface AntiCompItem {
  item: string;
  reason: string;
  vsTag: CompTag[];
}

export interface Champion {
  id: string;
  name: string;
  roles: Role[];
  damageType: DamageType;
  tags: CompTag[];
  tier: 'S' | 'A' | 'B' | 'C';
  difficulty: 1 | 2 | 3;
  splash: string; // ddragon url
  icon: string;
  builds: ItemBuild[];
  runes: RunePage[];
  counters: string[];
  counteredBy: string[];
  synergyWith: string[];
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

export interface DraftSlot {
  champion: Champion | null;
  side: 'blue' | 'red';
  role?: Role;
  locked: boolean;
}

export interface CompAnalysis {
  damageTypes: { AD: number; AP: number; Mixed: number; True: number };
  tags: CompTag[];
  engageLevel: 'low' | 'medium' | 'high';
  healingLevel: 'low' | 'medium' | 'high';
  tankLevel: 'low' | 'medium' | 'high';
  burstLevel: 'low' | 'medium' | 'high';
  pokeLevel: 'low' | 'medium' | 'high';
  scalingLevel: 'early' | 'mid' | 'late';
  winConditions: string[];
  threats: string[];
}
