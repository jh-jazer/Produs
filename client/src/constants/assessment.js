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
    'Blade Dancer': {
        icon: 'fluid',
        flavor: "Momentum is your ally. You strike fast and finish what you start.",
        multipliers: { str: 0.45, dex: 0.35, end: 0.15 },
        perk: "Momentum Mastery: Bonus when maintaining streaks. Faster habit building.",
        channels: ['creativity', 'mental_models', 'study_techniques', 'language_facts']
    },
    'Sentinel': {
        icon: 'security',
        flavor: "You are the shield. Your progress is built on unshakeable foundations.",
        multipliers: { end: 0.50, str: 0.30, dex: 0.20 },
        perk: "Iron Guard: Extremely high resilience to setbacks and burnout.",
        channels: ['history_facts', 'economics', 'geography', 'ancient_civilizations']
    },
    'Alchemist': {
        icon: 'science',
        flavor: "You synthesize chaos into clarity. Knowledge is your primary currency.",
        multipliers: { int: 0.45, wis: 0.40, cha: 0.20 },
        perk: "Synthesis: Excellent at combining ideas and turning knowledge into results.",
        channels: ['science_trivia', 'math_curiosities', 'ai_facts', 'psychology']
    },
    'Architect': {
        icon: 'architecture',
        flavor: "You build systems where others see mess. Efficiency is your masterpiece.",
        multipliers: { dex: 0.50, int: 0.35, str: 0.15 },
        perk: "System Builder: Bonus to creating and optimizing systems/routines.",
        channels: ['productivity', 'mental_models', 'study_techniques', 'brain_science']
    },
    'Oracle': {
        icon: 'visibility',
        flavor: "You see the path before it exists. Patience is your greatest power.",
        multipliers: { wis: 0.50, int: 0.35, end: 0.20 },
        perk: "Foresight: Strong intuition and long-term decision making.",
        channels: ['bible_verses', 'philosophers', 'human_behavior', 'ancient_civilizations']
    },
    'Druid': {
        icon: 'nature',
        flavor: "You grow with the cycles of time. Sustainability is your strength.",
        multipliers: { wis: 0.45, end: 0.40, int: 0.20 },
        perk: "Natural Flow: Sustainable growth, better recovery, and balance.",
        channels: ['biology', 'geography', 'stoicism', 'cultural_facts']
    },
    'Shadow Monk': {
        icon: 'nights_stay',
        flavor: "You move in silence. Focus is your weapon; distractions are your prey.",
        multipliers: { dex: 0.45, wis: 0.40, end: 0.25 },
        perk: "Inner Focus: Superior concentration and resistance to distractions.",
        channels: ['stoicism', 'mental_models', 'study_techniques', 'brain_science']
    },
    'Commander': {
        icon: 'military_tech',
        flavor: "You ignite others. Your legacy is defined by the team you lead.",
        multipliers: { cha: 0.45, str: 0.40, end: 0.25 },
        perk: "Leadership Aura: Bonus to motivating others and building teams.",
        channels: ['leadership', 'productivity', 'startup_lessons', 'human_behavior']
    },
    'Bard': {
        icon: 'music_note',
        flavor: "You weave stories and connections. Influence is your true craft.",
        multipliers: { cha: 0.50, wis: 0.35, int: 0.20 },
        perk: "Inspiration: Strong at storytelling, influence, and emotional connection.",
        channels: ['human_behavior', 'cultural_facts', 'famous_quotes', 'language_facts']
    },
    'None': {
        icon: 'sensors',
        flavor: "Alignment pending. The system awaits your unique signature.",
        multipliers: { str: 0.20, dex: 0.20, end: 0.20, int: 0.20, wis: 0.20, cha: 0.20 },
        perk: "Versatile: Small bonus to everything, flexible growth.",
        channels: ['productivity', 'stoicism', 'science_trivia', 'famous_quotes']
    }
};

export const ARCHETYPE_FEED_MAPPING = ARCHETYPE_PROTOCOLS;