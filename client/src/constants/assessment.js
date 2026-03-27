export const ARCHETYPE_QUIZ = [
    {
        id: 1,
        question: "You have one unexpected free hour. What do you actually do?",
        options: [
            { text: "Move my body — workout, walk, or any physical activity", boosts: { str: 3, end: 1 } },
            { text: "Get ahead — plan, organize, or clear tasks", boosts: { dex: 3, int: 1 } },
            { text: "Read, journal, or learn something meaningful", boosts: { int: 2, wis: 2 } },
            { text: "Connect with someone — call or message a person I care about", boosts: { cha: 3, wis: 1 } }
        ]
    },
    {
        id: 2,
        question: "Your team/group is falling apart under pressure. What do you do?",
        options: [
            { text: "Step up and take charge — someone needs to lead", boosts: { cha: 3, str: 2 } },
            { text: "Stay calm and steady — your composure helps everyone", boosts: { end: 3, wis: 2 } },
            { text: "Quickly assess and propose the most logical solution", boosts: { int: 3, dex: 1 } },
            { text: "Focus on executing your part perfectly", boosts: { dex: 3, end: 1 } }
        ]
    },
    {
        id: 3,
        question: "What usually breaks your momentum when building a new habit or project?",
        options: [
            { text: "Losing the deeper meaning or purpose behind it", boosts: { wis: 3, end: 1 } },
            { text: "Chaos and lack of clear systems", boosts: { dex: 3, int: 1 } },
            { text: "Doing it completely alone with no support", boosts: { cha: 3, wis: 1 } },
            { text: "Getting distracted before it becomes automatic", boosts: { end: 3, dex: 1 } }
        ]
    },
    {
        id: 4,
        question: "You receive stinging but honest feedback from someone you respect. How do you respond?",
        options: [
            { text: "Sit with it, reflect deeply, and extract the real lesson", boosts: { wis: 3, int: 1 } },
            { text: "Feel it briefly then immediately turn it into action", boosts: { str: 3, end: 1 } },
            { text: "Analyze whether it's accurate and what data supports it", boosts: { int: 3, dex: 1 } },
            { text: "Think carefully how to respond without damaging the relationship", boosts: { cha: 3, wis: 1 } }
        ]
    },
    {
        id: 5,
        question: "If you had six months to become exceptional at one thing, what would you choose?",
        options: [
            { text: "Physical performance — strength, speed, or endurance", boosts: { str: 3, end: 2 } },
            { text: "A high-value technical skill (coding, finance, craftsmanship)", boosts: { int: 3, dex: 2 } },
            { text: "Self-mastery — emotional control, clarity, and inner peace", boosts: { wis: 3, end: 2 } },
            { text: "Communication and leadership — inspiring and moving people", boosts: { cha: 3, wis: 2 } }
        ]
    },
    {
        id: 6,
        question: "One week into a new habit and it's getting hard. What happens?",
        options: [
            { text: "I push through the discomfort — that’s when it counts", boosts: { str: 3, end: 2 } },
            { text: "I redesign the system so it’s easier to stick to", boosts: { dex: 3, int: 1 } },
            { text: "I reconnect with my deeper 'why' to pull me forward", boosts: { wis: 3, end: 1 } },
            { text: "I tell a friend or partner for accountability", boosts: { cha: 3, end: 1 } }
        ]
    },
    {
        id: 7,
        question: "At the end of a perfect week, what would make you feel most fulfilled?",
        options: [
            { text: "I trained hard and felt physically strong and alive", boosts: { str: 3, end: 1 } },
            { text: "I completed everything I planned with zero loose ends", boosts: { dex: 3, int: 1 } },
            { text: "I meditated daily and felt deeply at peace with myself", boosts: { wis: 3, end: 1 } },
            { text: "I had meaningful, real connections with people I care about", boosts: { cha: 3, wis: 1 } }
        ]
    },
    {
        id: 8,
        question: "What do you honestly believe is your biggest strength?",
        options: [
            { text: "I show up consistently, no matter what", boosts: { end: 3, str: 2 } },
            { text: "I think clearly even when others are panicking", boosts: { int: 3, wis: 1 } },
            { text: "I can read people and know exactly what to say", boosts: { cha: 3, wis: 1 } },
            { text: "I know myself deeply — my limits, values, and direction", boosts: { wis: 3, int: 1 } }
        ]
    },
    {
        id: 9,
        question: "When managing a tight budget for several months, what’s your natural instinct?",
        options: [
            { text: "Set a clear goal and commit through sheer discipline", boosts: { end: 3, str: 1 } },
            { text: "Build and follow a detailed tracking system", boosts: { dex: 3, int: 1 } },
            { text: "Research the smartest strategy first", boosts: { int: 3, wis: 1 } },
            { text: "Get an accountability partner to stay on track", boosts: { cha: 3, wis: 1 } }
        ]
    },
    {
        id: 10,
        question: "When you imagine your best self five years from now, what comes to mind first?",
        options: [
            { text: "A strong, healthy body I’m genuinely proud of", boosts: { str: 3, end: 2 } },
            { text: "Deep knowledge and real mastery in my field", boosts: { int: 3, wis: 2 } },
            { text: "A calm, unshakable inner peace", boosts: { wis: 3, end: 2 } },
            { text: "A powerful network of meaningful relationships", boosts: { cha: 3, wis: 2 } }
        ]
    }
];

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
        channels: ['creativity', 'mental_models', 'study_techniques', 'language_facts']
    },
    'Sentinel': {
        icon: 'security',
        flavor: "You are the shield. Your progress is built on unshakeable foundations.",
        channels: ['history_facts', 'economics', 'geography', 'ancient_civilizations']
    },
    'Alchemist': {
        icon: 'science',
        flavor: "You synthesize chaos into clarity. Knowledge is your primary currency.",
        channels: ['science_trivia', 'math_curiosities', 'ai_facts', 'psychology']
    },
    'Architect': {
        icon: 'architecture',
        flavor: "You build systems where others see mess. Efficiency is your masterpiece.",
        channels: ['productivity', 'mental_models', 'study_techniques', 'brain_science']
    },
    'Oracle': {
        icon: 'visibility',
        flavor: "You see the path before it exists. Patience is your greatest power.",
        channels: ['bible_verses', 'philosophers', 'human_behavior', 'ancient_civilizations']
    },
    'Druid': {
        icon: 'nature',
        flavor: "You grow with the cycles of time. Sustainability is your strength.",
        channels: ['biology', 'geography', 'stoicism', 'cultural_facts']
    },
    'Shadow Monk': {
        icon: 'nights_stay',
        flavor: "You move in silence. Focus is your weapon; distractions are your prey.",
        channels: ['stoicism', 'mental_models', 'study_techniques', 'brain_science']
    },
    'Commander': {
        icon: 'military_tech',
        flavor: "You ignite others. Your legacy is defined by the team you lead.",
        channels: ['leadership', 'productivity', 'startup_lessons', 'human_behavior']
    },
    'Bard': {
        icon: 'music_note',
        flavor: "You weave stories and connections. Influence is your true craft.",
        channels: ['human_behavior', 'cultural_facts', 'famous_quotes', 'language_facts']
    },
    'None': {
        icon: 'sensors',
        flavor: "Alignment pending. The system awaits your unique signature.",
        channels: ['productivity', 'stoicism', 'science_trivia', 'famous_quotes']
    }
};

export const ARCHETYPE_FEED_MAPPING = ARCHETYPE_PROTOCOLS;