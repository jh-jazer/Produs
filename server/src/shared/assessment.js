export const ASSESSMENT_STAGES = {
  PATH: 'PATH',
  TIER1: 'TIER1',
  STYLE: 'STYLE',
  ALIGNMENT: 'ALIGNMENT'
};

export const ARCHETYPE_QUIZ = [
  // ==================== SECTION 1: PATH (Q1-Q15) ====================
  { id: 1, section: 'PATH', weight: 2.0, question: "A distant fire is spreading slowly toward your area. You:", 
    options: [
      { text: "Study wind and terrain to predict its path", value: "Strategist" },
      { text: "Warn others and organize a response", value: "Visionary" },
      { text: "Establish barriers and controlled zones", value: "Warden" },
      { text: "Move early before it becomes a threat", value: "Scout" }
    ]
  },
  { id: 2, section: 'PATH', weight: 1.5, question: "A stranger arrives with unclear intentions. You:", 
    options: [
      { text: "Observe behavior before acting", value: "Strategist" },
      { text: "Welcome them cautiously", value: "Visionary" },
      { text: "Set strict boundaries immediately", value: "Warden" },
      { text: "Stay mobile and avoid dependence", value: "Scout" }
    ]
  },
  { id: 3, section: 'PATH', weight: 2.0, question: "Supplies are inconsistent week to week. You:", 
    options: [
      { text: "Analyze patterns in shortages", value: "Strategist" },
      { text: "Keep morale steady despite uncertainty", value: "Visionary" },
      { text: "Tighten control over distribution", value: "Warden" },
      { text: "Continuously search for new sources", value: "Scout" }
    ]
  },
  { id: 4, section: 'PATH', weight: 1.5, question: "You discover a partially ruined facility. You focus on:", 
    options: [
      { text: "Understanding how it was used", value: "Strategist" },
      { text: "Whether people can safely live there", value: "Visionary" },
      { text: "Securing and organizing the space", value: "Warden" },
      { text: "Entry/exit routes and escape options", value: "Scout" }
    ]
  },
  { id: 5, section: 'PATH', weight: 2.0, question: "Conflict breaks out in your group. You:", 
    options: [
      { text: "Identify root causes", value: "Strategist" },
      { text: "Calm both sides", value: "Visionary" },
      { text: "Enforce order", value: "Warden" },
      { text: "Step away and reassess options", value: "Scout" }
    ]
  },
  { id: 6, section: 'PATH', weight: 1.0, question: "You hear unusual sounds at night. You:", 
    options: [
      { text: "Track patterns over time", value: "Strategist" },
      { text: "Check on others’ reactions", value: "Visionary" },
      { text: "Increase security measures", value: "Warden" },
      { text: "Relocate if needed", value: "Scout" }
    ]
  },
  { id: 7, section: 'PATH', weight: 1.5, question: "A risky opportunity appears. You:", 
    options: [
      { text: "Evaluate long-term consequences", value: "Strategist" },
      { text: "Consider group impact", value: "Visionary" },
      { text: "Control how it’s handled", value: "Warden" },
      { text: "Act quickly before it disappears", value: "Scout" }
    ]
  },
  { id: 8, section: 'PATH', weight: 1.0, question: "A system fails unexpectedly. You:", 
    options: [
      { text: "Diagnose the failure", value: "Strategist" },
      { text: "Support affected people", value: "Visionary" },
      { text: "Restore structure and rules", value: "Warden" },
      { text: "Adapt and move forward", value: "Scout" }
    ]
  },
  { id: 9, section: 'PATH', weight: 2.0, question: "You enter unfamiliar territory. You:", 
    options: [
      { text: "Observe and gather data", value: "Strategist" },
      { text: "Stay close to others", value: "Visionary" },
      { text: "Establish control points", value: "Warden" },
      { text: "Explore freely", value: "Scout" }
    ]
  },
  { id: 10, section: 'PATH', weight: 1.0, question: "A plan goes wrong. You:", 
    options: [
      { text: "Adjust the strategy", value: "Strategist" },
      { text: "Keep people focused", value: "Visionary" },
      { text: "Reassert control", value: "Warden" },
      { text: "Change direction quickly", value: "Scout" }
    ]
  },
  { id: 11, section: 'PATH', weight: 1.5, question: "Resources are abundant temporarily. You:", 
    options: [
      { text: "Plan long-term use", value: "Strategist" },
      { text: "Share to strengthen unity", value: "Visionary" },
      { text: "Store and regulate strictly", value: "Warden" },
      { text: "Use it while available", value: "Scout" }
    ]
  },
  { id: 12, section: 'PATH', weight: 1.0, question: "You notice inefficiencies. You:", 
    options: [
      { text: "Redesign the system", value: "Strategist" },
      { text: "Help others cope", value: "Visionary" },
      { text: "Enforce better structure", value: "Warden" },
      { text: "Work around them", value: "Scout" }
    ]
  },
  { id: 13, section: 'PATH', weight: 1.5, question: "A new group approaches. You:", 
    options: [
      { text: "Assess intentions carefully", value: "Strategist" },
      { text: "Seek cooperation", value: "Visionary" },
      { text: "Prepare defenses", value: "Warden" },
      { text: "Stay ready to leave", value: "Scout" }
    ]
  },
  { id: 14, section: 'PATH', weight: 2.0, question: "Time pressure increases. You:", 
    options: [
      { text: "Prioritize critical decisions", value: "Strategist" },
      { text: "Keep people steady", value: "Visionary" },
      { text: "Maintain order", value: "Warden" },
      { text: "Act immediately", value: "Scout" }
    ]
  },
  { id: 15, section: 'PATH', weight: 1.0, question: "You succeed in a task. You:", 
    options: [
      { text: "Refine the method", value: "Strategist" },
      { text: "Share the success", value: "Visionary" },
      { text: "Standardize the process", value: "Warden" },
      { text: "Move to the next opportunity", value: "Scout" }
    ]
  },

  // ==================== SECTION 2: TIER 1 (Q16-Q23) ====================
  // Values: A, B, C, D (map to index 0, 1, 2, 3 in Path's Tier 1 list)
  { id: 16, section: 'TIER1', weight: 2.0, question: "Faced with a complex issue, you:", 
    options: [
      { text: "Plan multiple steps ahead", value: 0 },
      { text: "Build or modify something", value: 1 },
      { text: "Study patterns and signals", value: 2 },
      { text: "Organize structure and layout", value: 3 }
    ]
  },
  { id: 17, section: 'TIER1', weight: 1.5, question: "Your strength is:", 
    options: [
      { text: "Strategy", value: 0 },
      { text: "Creation", value: 1 },
      { text: "Insight", value: 2 },
      { text: "Structure", value: 3 }
    ]
  },
  { id: 18, section: 'TIER1', weight: 1.0, question: "You prefer to:", 
    options: [
      { text: "Direct outcomes", value: 0 },
      { text: "Improve tools", value: 1 },
      { text: "Understand behavior", value: 2 },
      { text: "Build stability", value: 3 }
    ]
  },
  { id: 19, section: 'TIER1', weight: 1.5, question: "In preparation, you:", 
    options: [
      { text: "Map scenarios", value: 0 },
      { text: "Prepare equipment", value: 1 },
      { text: "Gather information", value: 2 },
      { text: "Reinforce systems", value: 3 }
    ]
  },
  { id: 20, section: 'TIER1', weight: 2.0, question: "Others rely on you for:", 
    options: [
      { text: "Plans", value: 0 },
      { text: "Fixes", value: 1 },
      { text: "Analysis", value: 2 },
      { text: "Organization", value: 3 }
    ]
  },
  { id: 21, section: 'TIER1', weight: 1.5, question: "You approach problems by:", 
    options: [
      { text: "Anticipating outcomes", value: 0 },
      { text: "Creating solutions", value: 1 },
      { text: "Interpreting data", value: 2 },
      { text: "Structuring environments", value: 3 }
    ]
  },
  { id: 22, section: 'TIER1', weight: 1.0, question: "You value:", 
    options: [
      { text: "Control of direction", value: 0 },
      { text: "Practical capability", value: 1 },
      { text: "Understanding", value: 2 },
      { text: "Stability", value: 3 }
    ]
  },
  { id: 23, section: 'TIER1', weight: 1.0, question: "You improve survival by:", 
    options: [
      { text: "Planning ahead", value: 0 },
      { text: "Building tools", value: 1 },
      { text: "Reading situations", value: 2 },
      { text: "Strengthening systems", value: 3 }
    ]
  },

  // ==================== SECTION 3: STYLE (Q24-Q28) ====================
  { id: 24, section: 'STYLE', weight: 2.0, question: "Entering danger, you:", 
    options: [
      { text: "Move first to gain advantage", value: "Aggressive" },
      { text: "Secure position before acting", value: "Defensive" },
      { text: "Wait for the right moment", value: "Opportunist" }
    ]
  },
  { id: 25, section: 'STYLE', weight: 1.5, question: "When uncertain, you:", 
    options: [
      { text: "Take initiative", value: "Aggressive" },
      { text: "Reduce exposure", value: "Defensive" },
      { text: "Stay flexible", value: "Opportunist" }
    ]
  },
  { id: 26, section: 'STYLE', weight: 1.0, question: "Facing resistance, you:", 
    options: [
      { text: "Push through", value: "Aggressive" },
      { text: "Hold ground", value: "Defensive" },
      { text: "Redirect approach", value: "Opportunist" }
    ]
  },
  { id: 27, section: 'STYLE', weight: 2.0, question: "In conflict, you:", 
    options: [
      { text: "Engage quickly", value: "Aggressive" },
      { text: "Defend carefully", value: "Defensive" },
      { text: "Adapt continuously", value: "Opportunist" }
    ]
  },
  { id: 28, section: 'STYLE', weight: 1.5, question: "Under pressure, you:", 
    options: [
      { text: "Act decisively", value: "Aggressive" },
      { text: "Stabilize the situation", value: "Defensive" },
      { text: "Adjust dynamically", value: "Opportunist" }
    ]
  },

  // ==================== SECTION 4: ALIGNMENT (Q29-Q32) ====================
  { id: 29, section: 'ALIGNMENT', weight: 1.5, question: "You find hidden resources. You:", 
    options: [
      { text: "Use them for group benefit", value: "Good" },
      { text: "Keep them for controlled use", value: "Evil" }
    ]
  },
  { id: 30, section: 'ALIGNMENT', weight: 1.5, question: "Leadership should:", 
    options: [
      { text: "Serve the group", value: "Good" },
      { text: "Maintain control", value: "Evil" }
    ]
  },
  { id: 31, section: 'ALIGNMENT', weight: 2.0, question: "In scarcity, you:", 
    options: [
      { text: "Distribute fairly", value: "Good" },
      { text: "Prioritize strategically", value: "Evil" }
    ]
  },
  { id: 32, section: 'ALIGNMENT', weight: 1.0, question: "Trust is:", 
    options: [
      { text: "Built and shared", value: "Good" },
      { text: "Limited and managed", value: "Evil" }
    ]
  },
  // ==================== SECTION 5: SPECIALIST TRIALS (Q33+) ====================
  { id: 33, section: 'TRIAL', weight: 1.0, question: "A structural collapse is imminent in a sector you don't control. You:", 
    options: [
      { text: "Divert resources to shore up the foundation immediately", value: 150 },
      { text: "Evacuate the sector and salvage materials", value: 100 },
      { text: "Warn the locals and let them handle it", value: 50 },
      { text: "Ignore it and focus on your own borders", value: 0 }
    ]
  },
  { id: 34, section: 'TRIAL', weight: 1.0, question: "A rogue AI signal is interfering with your communications. Your move:", 
    options: [
      { text: "Isolate the frequency and trace it back to its source", value: 150 },
      { text: "Encrypt all outgoing transmissions", value: 100 },
      { text: "Reset the network and hope for the best", value: 50 },
      { text: "Abandon the frequency and use manual couriers", value: 0 }
    ]
  },
  { id: 35, section: 'TRIAL', weight: 1.0, question: "A hostile group offers a trade that is clearly a trap. You:", 
    options: [
      { text: "Accept, but set a counter-ambush at the trade site", value: 150 },
      { text: "Decline and prepare for their inevitable assault", value: 100 },
      { text: "Send a proxy to the trade", value: 50 },
      { text: "Block all contact with them", value: 0 }
    ]
  },
  { id: 36, section: 'TRIAL', weight: 1.0, question: "Your primary energy source is failing. You must choose:", 
    options: [
      { text: "Overclock the core while researching a backup", value: 150 },
      { text: "Ration power across all non-essential systems", value: 100 },
      { text: "Shut down one entire wing of your facility", value: 50 },
      { text: "Let it burn out and adapt to the dark", value: 0 }
    ]
  },
  { id: 37, section: 'TRIAL', weight: 1.0, question: "An unknown plague is spreading at your borders. You:", 
    options: [
      { text: "Establish a strict quarantine and research a cure", value: 150 },
      { text: "Burn the affected areas to stop the spread", value: 100 },
      { text: "Seal the borders and ignore the victims", value: 50 },
      { text: "Do nothing and hope for natural immunity", value: 0 }
    ]
  },
  { id: 38, section: 'TRIAL', weight: 1.0, question: "A deep-cover agent has been discovered in your inner circle. You:", 
    options: [
      { text: "Feed them false data to map their entire network", value: 150 },
      { text: "Publicly execute them as a warning to others", value: 100 },
      { text: "Quietly exile them and change all protocols", value: 50 },
      { text: "Pretend you didn't notice to avoid conflict", value: 0 }
    ]
  },
  { id: 39, section: 'TRIAL', weight: 1.0, question: "A massive storm is approaching your farms. You decide to:", 
    options: [
      { text: "Deploy atmospheric stabilizers to divert the front", value: 150 },
      { text: "Harvest everything early and store in bunkers", value: 100 },
      { text: "Reinforce the field barriers and pray", value: 50 },
      { text: "Abandon the harvest and flee to higher ground", value: 0 }
    ]
  },
  { id: 40, section: 'TRIAL', weight: 1.0, question: "Two allied groups are on the brink of war. Your intervention:", 
    options: [
      { text: "Forge a new treaty based on a common external threat", value: 150 },
      { text: "Act as a neutral mediator to reach a compromise", value: 100 },
      { text: "Support the stronger side to end it quickly", value: 50 },
      { text: "Stay out of it and profit from the weapon sales", value: 0 }
    ]
  }
];

export const RANK_THRESHOLDS = [
    { rank: 'F', points: 0 },
    { rank: 'E', points: 50 },
    { rank: 'D', points: 120 },
    { rank: 'C', points: 200 },
    { rank: 'B', points: 300 },
    { rank: 'A', points: 450 },
    { rank: 'S', points: 650 },
    { rank: 'SS', points: 900 },
    { rank: 'SSS', points: 1200 }
];

export function calculateMasteryRank(points) {
    let currentRank = 'F';
    for (const threshold of RANK_THRESHOLDS) {
        if (points >= threshold.points) {
            currentRank = threshold.rank;
        } else {
            break;
        }
    }
    return currentRank;
}

export const ARCHETYPE_MATRIX = {
  Strategist: {
    archetypes: ["Mastermind", "Tinkerer", "Analyst", "Architect"],
    Mastermind: {
      Aggressive: { good: "War Planner", evil: "Tyrant Schemer", label: "War Conductor" },
      Defensive: { good: "Bastion Strategist", evil: "Isolationist Controller", label: "Bastion Planner" },
      Opportunist: { good: "Adaptive Tactician", evil: "Manipulative Puppetmaster", label: "Scheme Weaver" }
    },
    Tinkerer: {
      Aggressive: { good: "Weapons Innovator", evil: "Mad Armorer", label: "Arms Prototyper" },
      Defensive: { good: "Survival Engineer", evil: "Hoarding Mechanist", label: "Systems Hardener" },
      Opportunist: { good: "Scrap Genius", evil: "Black Market Fabricator", label: "Jury-Rig Savant" }
    },
    Analyst: {
      Aggressive: { good: "Threat Predictor", evil: "Cold Calculator", label: "Threat Forecaster" },
      Defensive: { good: "Risk Minimizer", evil: "Paranoia Architect", label: "Risk Auditor" },
      Opportunist: { good: "Pattern Specialist", evil: "Data Manipulator", label: "Pattern Exploiter" }
    },
    Architect: {
      Aggressive: { good: "Siege Planner", evil: "Oppression Builder", label: "Siege Designer" },
      Defensive: { good: "Fortress Creator", evil: "Walled Dictator", label: "Fortress Engineer" },
      Opportunist: { good: "Flexible Constructor", evil: "Resource Hoarder", label: "Adaptive Builder" }
    }
  },
  Visionary: {
    archetypes: ["Inspirer", "Healer", "Peacemaker", "Dreamer"],
    Inspirer: {
      Aggressive: { good: "Rally Commander", evil: "Fanatic Leader", label: "War Orator" },
      Defensive: { good: "Hope Guardian", evil: "Cult Figure", label: "Morale Anchor" },
      Opportunist: { good: "Situational Motivator", evil: "Manipulative Icon", label: "Pulse Reader" }
    },
    Healer: {
      Aggressive: { good: "Combat Medic", evil: "Selective Savior", label: "Combat Surgeon" },
      Defensive: { good: "Lifeline Keeper", evil: "Dependency Maker", label: "Life Warden" },
      Opportunist: { good: "Resource Healer", evil: "Opportunistic Surgeon", label: "Triage Savant" }
    },
    Peacemaker: {
      Aggressive: { good: "Conflict Resolver", evil: "Authority Imposer", label: "Conflict Breaker" },
      Defensive: { good: "Harmony Keeper", evil: "Suppression Agent", label: "Accord Keeper" },
      Opportunist: { good: "Alliance Builder", evil: "Double Dealer", label: "Deal Broker" }
    },
    Dreamer: {
      Aggressive: { good: "Revolutionary Visionary", evil: "Radical Ideologue", label: "Reform Catalyst" },
      Defensive: { good: "Culture Preserver", evil: "Delusional Escapist", label: "Legacy Keeper" },
      Opportunist: { good: "Adaptive Idealist", evil: "False Prophet", label: "Vision Shaper" }
    }
  },
  Warden: {
    archetypes: ["Fortifier", "Quartermaster", "Enforcer", "Protector"],
    Fortifier: {
      Aggressive: { good: "Expansion Defender", evil: "Territory Tyrant", label: "Expansion Marshal" },
      Defensive: { good: "Wall Master", evil: "Isolation Warden", label: "Wall Keeper" },
      Opportunist: { good: "Adaptive Defender", evil: "Resource Blocker", label: "Barrier Shifter" }
    },
    Quartermaster: {
      Aggressive: { good: "War Supplier", evil: "Resource Controller", label: "War Provisioner" },
      Defensive: { good: "Efficiency Keeper", evil: "Hoarding Overseer", label: "Stockpile Keeper" },
      Opportunist: { good: "Trade Manager", evil: "Black Market Hoarder", label: "Trade Broker" }
    },
    Enforcer: {
      Aggressive: { good: "Strike Captain", evil: "Brutal Enforcer", label: "Strike Commander" },
      Defensive: { good: "Law Keeper", evil: "Oppressive Guard", label: "Code Enforcer" },
      Opportunist: { good: "Tactical Enforcer", evil: "Corrupt Officer", label: "Pressure Agent" }
    },
    Protector: {
      Aggressive: { good: "Frontline Defender", evil: "Zealous Defender", label: "Frontline Guardian" },
      Defensive: { good: "Shield Bearer", evil: "Overprotective Controller", label: "Shield Warden" },
      Opportunist: { good: "Reactive Defender", evil: "Selective Protector", label: "Reactive Sentinel" }
    }
  },
  Scout: {
    archetypes: ["Runner", "Improviser", "Pathfinder", "Adrenaline"],
    Runner: {
      Aggressive: { good: "Hit-and-Run Specialist", evil: "Reckless Sprinter", label: "Raid Sprinter" },
      Defensive: { good: "Evacuation Expert", evil: "Cowardly Escape Artist", label: "Evac Specialist" },
      Opportunist: { good: "Route Exploiter", evil: "Smuggler Runner", label: "Route Ghost" }
    },
    Improviser: {
      Aggressive: { good: "Combat Engineer", evil: "Chaos Maker", label: "Combat Crafter" },
      Defensive: { good: "Utility Builder", evil: "Scrap Hoarder", label: "Utility Fabricator" },
      Opportunist: { good: "Versatile Survivor", evil: "Unpredictable Saboteur", label: "Scrap Savant" }
    },
    Pathfinder: {
      Aggressive: { good: "Forward Scout", evil: "Risk Pusher", label: "Forward Vanguard" },
      Defensive: { good: "Safe Route Planner", evil: "Overcautious Guide", label: "Safe Route Keeper" },
      Opportunist: { good: "Terrain Specialist", evil: "Path Manipulator", label: "Terrain Exploiter" }
    },
    Adrenaline: {
      Aggressive: { good: "Shock Trooper", evil: "Thrill Killer", label: "Shock Rusher" },
      Defensive: { good: "Crisis Responder", evil: "Panic Reactor", label: "Crisis Stabilizer" },
      Opportunist: { good: "Chaos Operator", evil: "Danger Addict", label: "Chaos Rider" }
    }
  }
};

export function calculateScores(answers) {
  const stageResults = {
    PATH: {},
    TIER1: {},
    STYLE: {},
    ALIGNMENT: {}
  };

  let masteryPoints = 0;

  answers.forEach(({ id, value }) => {
    const q = ARCHETYPE_QUIZ.find(item => item.id === id);
    if (!q) return;

    if (q.section === 'TRIAL') {
        masteryPoints += parseInt(value);
        return;
    }

    const currentStage = q.section;
    stageResults[currentStage][value] = (stageResults[currentStage][value] || 0) + q.weight;
  });

  const getWinner = (results) => {
    if (Object.keys(results).length === 0) return null;
    return Object.entries(results).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const path = getWinner(stageResults.PATH);
  const t1Val = getWinner(stageResults.TIER1);
  const style = getWinner(stageResults.STYLE);
  const alignment = getWinner(stageResults.ALIGNMENT);

  let tier1 = null;
  if (path && t1Val !== null) {
      const tier1Index = parseInt(t1Val);
      tier1 = ARCHETYPE_MATRIX[path].archetypes[tier1Index];
  }

  let styleLabel = null;
  let finalLabel = null;

  if (path && tier1 && style) {
      const config = ARCHETYPE_MATRIX[path][tier1][style];
      styleLabel = config.label;
      if (alignment) {
          finalLabel = alignment === "Good" ? config.good : config.evil;
      }
  }

  return {
    path,
    tier1,
    style,
    alignment,
    styleLabel,
    finalLabel,
    masteryPoints,
    specialistRank: calculateMasteryRank(masteryPoints),
    stats: { 
        str: path === "Warden" ? 80 : 40,
        vit: path === "Warden" ? 80 : 40,
        agi: path === "Scout" ? 80 : 40,
        int: path === "Strategist" ? 80 : 40,
        wis: path === "Strategist" ? 80 : 40,
        luk: path === "Scout" ? 60 : 40
    }
  };
}
