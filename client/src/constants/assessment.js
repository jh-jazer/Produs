export const ARCHETYPE_QUIZ = [
  // ==================== STRENGTH (STR) ====================
  { id: 1,  question: "I consistently push myself to achieve challenging goals.", trait: "str", reverse: false },
  { id: 2,  question: "I often lose motivation and don't finish what I start.", trait: "str", reverse: true },
  { id: 3,  question: "Discipline and hard work are very important to me.", trait: "str", reverse: false },
  { id: 4,  question: "I take pride in enduring discomfort to reach my goals.", trait: "str", reverse: false },
  { id: 5,  question: "I tend to quit when things get really difficult.", trait: "str", reverse: true },

  // ==================== ENDURANCE (END) ====================
  { id: 6,  question: "I stay calm under pressure when others get stressed.", trait: "end", reverse: false },
  { id: 7,  question: "Setbacks affect me deeply for a long time.", trait: "end", reverse: true },
  { id: 8,  question: "I recover quickly from disappointments or failures.", trait: "end", reverse: false },
  { id: 9,  question: "I worry a lot about things that could go wrong.", trait: "end", reverse: true },
  { id: 10, question: "I can remain steady even in chaotic situations.", trait: "end", reverse: false },

  // ==================== INTELLECT (INT) ====================
  { id: 11, question: "I love exploring complex ideas and deep topics.", trait: "int", reverse: false },
  { id: 12, question: "Learning new skills and knowledge excites me.", trait: "int", reverse: false },
  { id: 13, question: "I get bored easily with simple or superficial things.", trait: "int", reverse: false },
  { id: 14, question: "I rarely seek out new information just for curiosity.", trait: "int", reverse: true },
  { id: 15, question: "I enjoy thinking about theories and possibilities.", trait: "int", reverse: false },

  // ==================== DEXTERITY (DEX) ====================
  { id: 16, question: "I naturally create systems and routines to stay organized.", trait: "dex", reverse: false },
  { id: 17, question: "I adapt quickly when plans suddenly change.", trait: "dex", reverse: false },
  { id: 18, question: "Disorganized spaces or schedules bother me a lot.", trait: "dex", reverse: false },
  { id: 19, question: "I prefer going with the flow instead of planning everything.", trait: "dex", reverse: true },
  { id: 20, question: "Keeping track of details and logistics is one of my strengths.", trait: "dex", reverse: false },

  // ==================== CHARISMA (CHA) ====================
  { id: 21, question: "I feel energized when interacting with groups of people.", trait: "cha", reverse: false },
  { id: 22, question: "I can easily read people's emotions and respond well.", trait: "cha", reverse: false },
  { id: 23, question: "I prefer staying in the background rather than leading.", trait: "cha", reverse: true },
  { id: 24, question: "Making new connections comes naturally to me.", trait: "cha", reverse: false },
  { id: 25, question: "I am comfortable taking charge and motivating others.", trait: "cha", reverse: false },

  // ==================== WISDOM (WIS) ====================
  { id: 26, question: "I regularly reflect on my purpose and personal growth.", trait: "wis", reverse: false },
  { id: 27, question: "Spending time alone thinking or meditating recharges me.", trait: "wis", reverse: false },
  { id: 28, question: "I rarely think about the deeper meaning behind my actions.", trait: "wis", reverse: true },
  { id: 29, question: "I carefully consider feedback to improve myself.", trait: "wis", reverse: false },
  { id: 30, question: "I have a strong sense of what truly matters in life.", trait: "wis", reverse: false }
];

export function calculateScores(answers) {
  const scores = { str: 0, end: 0, int: 0, dex: 0, cha: 0, wis: 0 };

  answers.forEach(({ id, score }) => {
    const q = ARCHETYPE_QUIZ.find(item => item.id === id);
    if (!q) return;

    let points = score;
    if (q.reverse) points = 6 - score;

    scores[q.trait] += points;
  });

  // Convert to percentage (max = 25 points per trait with 5 questions)
  Object.keys(scores).forEach(key => {
    scores[key] = Math.round((scores[key] / 25) * 100);
  });

  return scores;
}

export const INTEREST_ORBS = [
    { id: 'deep_work', name: 'Deep Work', icon: 'psychology', color: '#00B7FF' },
    { id: 'fitness', name: 'Physical Prowess', icon: 'fitness_center', color: '#FF3B30' },
    { id: 'creative', name: 'Creative Flow', icon: 'palette', color: '#AF52DE' },
    { id: 'finance', name: 'Wealth Mastery', icon: 'payments', color: '#34C759' },
    { id: 'mental_toughness', name: 'Mental Armor', icon: 'shield', color: '#5856D6' },
    { id: 'learning', name: 'Archival Learning', icon: 'menu_book', color: '#FF9500' },
    { id: 'biotech', name: 'System Bio-hacking', icon: 'biotech', color: '#32ADE6' },
    { id: 'leadership', name: 'Strategic Command', icon: 'groups', color: '#FF2D55' }
];

export const ARCHETYPE_PROTOCOLS = {
    'Iron Fist': {
        icon: 'sports_mma',
        flavor: "Relentless, methodical, and impossible to stop. You clear the path through disciplined physical force.",
        statProfile: { str: 92, dex: 80, end: 95, int: 40, wis: 45, cha: 40 },
        evolution: ["Brawler", "Iron Fist", "The Relentless", "Unstoppable Force", "The Wall That Walks"],
        multipliers: { str: 1.5, end: 1.4, cha: 0.8 },
        perk: "Ironclad: STR XP x1.5 | Unbroken: END XP x1.4 | The Wall: Monthly Streak Protection.",
        channels: ['history_facts', 'biography_lessons', 'philosophy', 'productivity']
    },
    'Blade Dancer': {
        icon: 'fluid',
        flavor: "Fluid, precise, and faster than thought. You read the terrain and strike with surgical accuracy.",
        statProfile: { str: 88, dex: 95, end: 72, int: 45, wis: 48, cha: 42 },
        evolution: ["Street Brawler", "Blade Dancer", "Phantom Edge", "Death's Silhouette", "The Undying Blade"],
        multipliers: { dex: 1.5, str: 1.2, wis: 0.8 },
        perk: "Flow State: DEX XP x1.5 | Strike First: Morning Planner Bonus | Momentum: Multi-stat Stacking.",
        channels: ['creativity', 'mental_models', 'study_techniques', 'language_facts']
    },
    'Warlord': {
        icon: 'military_tech',
        flavor: "Built to lead through action. You inspire by being the first through the door.",
        statProfile: { str: 90, dex: 78, end: 65, int: 50, wis: 55, cha: 82 },
        evolution: ["Pack Leader", "Warlord", "Iron Banner", "The Conqueror", "King of the Battlefield"],
        multipliers: { cha: 1.4, str: 1.4, int: 0.8 },
        perk: "War Cry: Link Partner Bonus x1.4 | By Force: STR XP x1.4 | Conquest: Personal Record Bonus.",
        channels: ['leadership', 'strategy_lessons', 'economics', 'human_behavior']
    },
    'Vanguard': {
        icon: 'explore',
        flavor: "The tip of the spear. You create momentum and pull everyone else into it.",
        statProfile: { str: 85, dex: 90, end: 55, int: 52, wis: 58, cha: 88 },
        evolution: ["The Eager", "Vanguard", "Spearhead", "The Unstoppable", "First of the New World"],
        multipliers: { dex: 1.4, cha: 1.4, end: 0.8 },
        perk: "First Blood: Daily First Habit x1.5 | Charge: DEX XP x1.4 | Pull: CHA XP x1.4.",
        channels: ['leadership', 'productivity', 'startup_lessons', 'language_facts']
    },
    'Sentinel': {
        icon: 'shield_with_heart',
        flavor: "The last line of defense. You have studied every threat and built a body that cannot be broken.",
        statProfile: { str: 85, dex: 50, end: 95, int: 72, wis: 60, cha: 48 },
        evolution: ["The Stubborn", "Sentinel", "Iron Bulwark", "The Immovable", "Eternal Fortress"],
        multipliers: { end: 1.6, str: 1.35, int: 1.25, cha: 0.75 },
        perk: "Fortified: END XP x1.6 | Garrison: STR XP x1.35 | Iron Memory: 2x Streak Protection.",
        channels: ['history_facts', 'economics', 'geography', 'ancient_civilizations']
    },
    'Forge Master': {
        icon: 'handyman',
        flavor: "Builder and engineer. You combine physical capability with intellectual precision to create things that last.",
        statProfile: { str: 82, dex: 70, end: 80, int: 78, wis: 58, cha: 45 },
        evolution: ["The Maker", "Forge Master", "Ironwright", "The Architect of Steel", "Builder of Civilizations"],
        multipliers: { int: 1.4, end: 1.35, cha: 0.8 },
        perk: "Masterwork: STR+INT stacking | Iteration: Course Bonus x1.4 | Blueprint: Weekly Review boost.",
        channels: ['science_trivia', 'math_curiosities', 'ai_facts', 'psychology']
    },
    'Commander': {
        icon: 'account_balance',
        flavor: "Formidable across every axis. You earn authority through demonstrated capability.",
        statProfile: { str: 80, dex: 55, end: 75, int: 72, wis: 65, cha: 92 },
        evolution: ["Squad Leader", "Commander", "Warlord", "Iron Sovereign", "The Undefeated King"],
        multipliers: { cha: 1.5, str: 1.35 },
        perk: "Supreme Command: CHA XP x1.5 | No Weak Flank: Automatic recovery for falling stats.",
        channels: ['leadership', 'startup_lessons', 'economics', 'human_behavior']
    },
    'Champion': {
        icon: 'grade',
        flavor: "Crisis leader. You step into the chaos and create order through sheer force of presence.",
        statProfile: { str: 82, dex: 78, end: 55, int: 75, wis: 60, cha: 90 },
        evolution: ["Contender", "Champion", "The Proven", "Legend in the Making", "The Undisputed"],
        multipliers: { cha: 1.45, dex: 1.4, end: 0.85 },
        perk: "Clutch: Late Night XP x1.4 | Rising Star: CHA XP x1.45 | Burst: Multi-habit day bonus.",
        channels: ['creativity', 'leadership', 'productivity', 'mental_models']
    },
    'Shadow Monk': {
        icon: 'nights_stay',
        flavor: "Master of the self. Your power is entirely internal and requires no witness.",
        statProfile: { str: 55, dex: 82, end: 80, int: 72, wis: 95, cha: 18 },
        evolution: ["Introvert", "Shadow Monk", "The Unseen", "Void Walker", "He Who Needs No Witness"],
        multipliers: { wis: 1.6, dex: 1.4 },
        perk: "Inner Sanctum: WIS XP x1.6 | Discipline of Silence: Solo growth bonus.",
        channels: ['stoicism', 'mental_models', 'study_techniques', 'brain_science']
    },
    'Ghost': {
        icon: 'visibility_off',
        flavor: "Untraceable survivor. You adapt to any situation without losing your center.",
        statProfile: { str: 50, dex: 90, end: 70, int: 75, wis: 88, cha: 22 },
        evolution: ["The Quiet One", "Ghost", "No Trace", "The Vanishing", "Never There"],
        multipliers: { dex: 1.5, wis: 1.4, cha: 0.75 },
        perk: "Phase: DEX XP x1.5 | No Footprint: Switch bonus | Vanish: Weekly free skip.",
        channels: ['stoicism', 'metal_models', 'ai_facts', 'brain_science']
    },
    'Diplomat': {
        icon: 'handshake',
        flavor: "Peace keeper and alliance builder. You resolve conflict through surgical verbal precision.",
        statProfile: { str: 38, dex: 80, end: 72, int: 68, wis: 90, cha: 85 },
        evolution: ["The Listener", "Diplomat", "Silver Tongue", "The Peacemaker", "The One Who Stopped the War"],
        multipliers: { wis: 1.5, cha: 1.4, str: 0.85 },
        perk: "Read the Room: WIS XP x1.5 | Timing: Rhythmic bonus | Long Game: Finance wisdom.",
        channels: ['economics', 'human_behavior', 'philosophers', 'ancient_civilizations']
    },
    'Bard': {
        icon: 'music_note',
        flavor: "The voice of legends. You understand that narrative is the most powerful force in any system.",
        statProfile: { str: 35, dex: 85, end: 48, int: 72, wis: 82, cha: 95 },
        evolution: ["Storyteller", "Bard", "Silver Tongue", "Voice of Legends", "The Word That Moves Worlds"],
        multipliers: { cha: 1.55, int: 1.4, end: 0.8 },
        perk: "Spellbind: CHA XP x1.55 | The Story: Journal bonus | Ripple: Partner growth gain.",
        channels: ['human_behavior', 'cultural_facts', 'famous_quotes', 'language_facts']
    },
    'Oracle': {
        icon: 'visibility',
        flavor: "The group's compass. You see patterns and endings before others even see the beginning.",
        statProfile: { str: 22, dex: 38, end: 82, int: 80, wis: 98, cha: 60 },
        evolution: ["Dreamer", "Oracle", "The Farsighted", "Keeper of Inevitable Truths", "The One Who Already Knew"],
        multipliers: { wis: 1.65, int: 1.4, str: 0.7 },
        perk: "The Sight: WIS XP x1.65 | Ancient Knowledge: INT XP x1.4 | Inevitable: 100-day streak x2.2.",
        channels: ['bible_verses', 'philosophers', 'human_behavior', 'ancient_civilizations']
    },
    'Druid': {
        icon: 'nature',
        flavor: "System tracker. You find patterns in nature and behavior, reading the world as a living system.",
        statProfile: { str: 65, dex: 72, end: 85, int: 75, wis: 90, cha: 52 },
        evolution: ["Wanderer", "Druid", "Pattern Seer", "Voice of the Wild", "The Living Codex"],
        multipliers: { end: 1.5, wis: 1.45, cha: 0.85 },
        perk: "Root System: END XP x1.5 | Living Cycle: WIS XP x1.45 | Symbiosis: Hybrid bonus.",
        channels: ['biology', 'geography', 'stoicism', 'cultural_facts']
    },
    'Alchemist': {
        icon: 'science',
        flavor: "Master of synthesis. You turn raw data and scrap materials into clarity and medicine.",
        statProfile: { str: 30, dex: 55, end: 75, int: 92, wis: 88, cha: 70 },
        evolution: ["Tinkerer", "Alchemist", "Formula Breaker", "Grand Synthesist", "Architect of Truth"],
        multipliers: { int: 1.55, wis: 1.4, str: 0.8 },
        perk: "Transmutation: INT XP x1.55 | Formula: WIS XP x1.4 | Refinement: Permanent INT growth.",
        channels: ['science_trivia', 'math_curiosities', 'ai_facts', 'psychology']
    },
    'Architect': {
        icon: 'architecture',
        flavor: "System designer. Your structures outlast any individual, physical or behaviorally.",
        statProfile: { str: 32, dex: 88, end: 50, int: 92, wis: 82, cha: 75 },
        evolution: ["Draftsman", "Architect", "System Lord", "World Builder", "The Eternal Planner"],
        multipliers: { int: 1.55, dex: 1.45, str: 0.8 },
        perk: "Blueprint Mind: INT XP x1.55 | The System: DEX XP x1.45 | Compound Design: Power-stacking.",
        channels: ['productivity', 'mental_models', 'study_techniques', 'brain_science']
    },
    'None': {
        icon: 'sensors',
        flavor: "Alignment pending. The system awaits your unique signature.",
        statProfile: { str: 10, dex: 10, end: 10, int: 10, wis: 10, cha: 10 },
        evolution: ["Unawakened", "Awakening", "Searching", "Aligned", "Mastered"],
        multipliers: { str: 0.20, dex: 0.20, end: 0.20, int: 0.20, wis: 0.20, cha: 0.20 },
        perk: "Versatile: Small bonus to everything, flexible growth.",
        channels: ['productivity', 'stoicism', 'science_trivia', 'famous_quotes']
    }
};

export function getArchetype(stats) {
    const { str, dex, end, int, wis, cha } = stats;

    const axis1 = str >= wis ? 'STR' : 'WIS';
    const axis2 = dex >= int ? 'DEX' : 'INT';
    const axis3 = end >= cha ? 'END' : 'CHA';
    const axis4 = end >= dex ? 'STABLE' : 'ADAPTIVE';

    const map = {
        'STR-DEX-END-STABLE': 'Iron Fist',
        'STR-DEX-END-ADAPTIVE': 'Blade Dancer',
        'STR-DEX-CHA-STABLE': 'Warlord',
        'STR-DEX-CHA-ADAPTIVE': 'Vanguard',
        'STR-INT-END-STABLE': 'Sentinel',
        'STR-INT-END-ADAPTIVE': 'Forge Master',
        'STR-INT-CHA-STABLE': 'Commander',
        'STR-INT-CHA-ADAPTIVE': 'Champion',
        'WIS-DEX-END-STABLE': 'Shadow Monk',
        'WIS-DEX-END-ADAPTIVE': 'Ghost',
        'WIS-DEX-CHA-STABLE': 'Diplomat',
        'WIS-DEX-CHA-ADAPTIVE': 'Bard',
        'WIS-INT-END-STABLE': 'Oracle',
        'WIS-INT-END-ADAPTIVE': 'Druid',
        'WIS-INT-CHA-STABLE': 'Alchemist',
        'WIS-INT-CHA-ADAPTIVE': 'Architect',
    };

    const key = `${axis1}-${axis2}-${axis3}-${axis4}`;
    return map[key] || 'Shadow Monk';
};

export const ARCHETYPE_FEED_MAPPING = ARCHETYPE_PROTOCOLS;