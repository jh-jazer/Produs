export const ASSESSMENT_STAGES = {
  PATH: 'PATH',
  TIER1: 'TIER1',
  STYLE: 'STYLE',
  ALIGNMENT: 'ALIGNMENT'
};

export const ARCHETYPE_QUIZ = [
  // ==================== SECTION 1: PATH (Q1-Q15) ====================
  // ==================== SECTION 1: PATH (NARRATIVE) ====================
  {
    id: "1.0",
    title: "The Man in the Suit",
    section: "PATH",
    type: "WHY",
    weight: 1,
    story: "The air is still here. Not quiet — still. Like the world forgot to breathe. You are standing in a place that feels like somewhere you've been before, but the details won't hold. Walls that might be walls. A floor that might be ground. A light with no source, pale and flat, casting no shadows. And then you notice the fog — low, slow, curling at your ankles like it's been waiting for you. You are not alone. Across from you stands a man. He is tall. Composed. Dressed in a black formal suit that fits him too perfectly, like it was made for this exact moment. On his chest, a small white tag — the kind you'd find at a conference, or a hospital. It reads, in clean plain letters: DEATH. He doesn't smile. He doesn't threaten. He simply looks at you the way someone looks at a file they already know the ending of. When he speaks, his voice is low and unhurried, like he has said this ten thousand times and will say it ten thousand more. 'Before we continue,' he says, adjusting his cuff, 'I find it helps to start with something simple.' He tilts his head, almost gently. 'Do you remember how you died?'",
    question: "Do you remember how you died?",
    options: [
      {
        text: "I think… I just came from work… or school.",
        value: "Strategist",
        postText: "You do remember. Good. Now hold still — I have to clean your memory fresh.",
        nextId: "2.0"
      },
      {
        text: "I think I was… about to meet someone.",
        value: "Visionary",
        postText: "You do remember. Good. Now hold still — I have to clean your memory fresh.",
        nextId: "2.0"
      },
      {
        text: "I was… going to buy something important, I think.",
        value: "Warden",
        postText: "You do remember. Good. Now hold still — I have to clean your memory fresh.",
        nextId: "2.0"
      },
      {
        text: "I think I was… heading out on a trip.",
        value: "Scout",
        postText: "You do remember. Good. Now hold still — I have to clean your memory fresh.",
        nextId: "2.0"
      }
    ]
  },
  {
    id: "2.0",
    title: "The Room You Don't Remember",
    section: "PATH",
    type: "WHY",
    weight: 1,
    story: "Then — white. A blinding flash that swallows everything. The man, the fog, the stillness — all of it, gone. You open your eyes. The ceiling above you is unfamiliar. The sheets beneath you are unfamiliar. The smell of the room, the angle of the light bleeding through the curtains, the weight of the pillow under your head — none of it yours, and yet your body doesn't seem to care. Before your mind can ask a single question, your legs are already moving. You're standing. Walking. Your feet find the hallway without hesitation, then the kitchen. Your hands reach for the coffee maker like they've done it a thousand times. Water. Grounds. The quiet mechanical click of a button. You're making coffee. You don't know why. Or maybe — somewhere underneath all this forgetting — you do.",
    question: "Why did you make coffee?",
    options: [
      {
        text: "I needed to think. Coffee helps me think.",
        value: "Strategist",
        postText: "Of course. First the cup, then the plan. Some things don't change no matter where you wake up.",
        nextId: "3.0"
      },
      {
        text: "I wanted to smell something real. The aroma just… grounded me.",
        value: "Visionary",
        postText: "Not the coffee itself — just the proof that something warm and real still existed. That was enough to begin.",
        nextId: "3.0"
      },
      {
        text: "I needed to wake myself up. Get my head straight before anything else.",
        value: "Warden",
        postText: "Clarity before action. You've never trusted yourself half-awake. You needed to be fully present before you could face whatever this was.",
        nextId: "3.0"
      },
      {
        text: "I looked outside and it just… felt like a coffee kind of morning.",
        value: "Scout",
        postText: "You read the world before you read yourself. The light, the mood, the scene — and you matched it without thinking twice.",
        nextId: "3.0"
      }
    ]
  },
  {
    id: "3.0",
    title: "6AM",
    section: "PATH",
    type: "WHY",
    weight: 1,
    story: "You finish the last sip and set the cup down. The kitchen is quiet except for the faint hum of the refrigerator. You reach for your phone out of habit — 6:00 AM, the screen reads. A notification blinks at the top. A news alert. You tap it without thinking. The headline is vague but the tone is not — reports of chaos, scattered across different parts of the world. Unverified causes. Conflicting sources. The kind of story that wants you to panic before it gives you a reason to. You stare at it for a moment, then close it. Not your problem. Not yet. You scroll to your emails instead — the usual noise, nothing urgent — and by the time you set the phone face-down on the counter, something else has taken over. A pull. Quiet but insistent. Your legs want to move. You glance toward the door. You don't remember packing running shoes, but there they are, sitting by the entrance like they were always meant to be there. You're going to jog. You're already sure of it.",
    question: "Why are you going to jog?",
    options: [
      {
        text: "I want to map out the area. Get a feel for where I am.",
        value: "Strategist",
        postText: "You can't plan what you don't understand. The jog was never about the body — it was reconnaissance.",
        nextId: "4.0"
      },
      {
        text: "I need open air. Something about being outside feels important right now.",
        value: "Visionary",
        postText: "Walls have never been where your best thoughts live. You needed the sky above you before anything else could make sense.",
        nextId: "4.0"
      },
      {
        text: "Movement clears my head. I jog when something feels off.",
        value: "Warden",
        postText: "You felt it — that quiet wrongness underneath the morning. Your body knew before your mind did. Move first, worry after.",
        nextId: "4.0"
      },
      {
        text: "I just want to see what's out there.",
        value: "Scout",
        postText: "Simple as that. The world was right outside the door and you were never going to stay inside and wonder.",
        nextId: "4.0"
      }
    ]
  },
  {
    id: "4.0",
    title: "The Park",
    section: "PATH",
    type: "DECISION",
    weight: 4.0,
    story: "You lace up the shoes by the door. They fit perfectly — of course they do. You find a water bottle on the counter, already filled, as if someone knew. You grab it without questioning. Outside, the morning air hits you first — cool, carrying the faint smell of damp grass and something distant you can't name. The streets are calm. A few early risers, heads down, moving with purpose. You follow a pull you can't explain and end up at the park. The path curves through a stretch of trees, opens into a wide field, then loops back. You run it. Then again. Your breath finds a rhythm. Your legs stop complaining. For a while, there is nothing but the sound of your feet and the slow brightening of the sky above you. Then the rhythm breaks. Your lungs are burning. Your legs feel like concrete. You slow to a stop near a bench, hands on your knees, chest heaving. The park hums around you — birds, distant voices, the rustle of leaves. And now, with your body finally quiet, your mind starts to speak. You have to decide what comes next.",
    question: "What do you do after your run?",
    options: [
      {
        text: "That news alert is still nagging at me. I need to go home and look into it properly.",
        value: "Strategist",
        postText: "You couldn't let it go. You never can. An unanswered question is just a problem waiting to be solved.",
        nextId: "4.1"
      },
      {
        text: "I want to stay here a little longer. Watch the people. Maybe something will come back to me.",
        value: "Visionary",
        postText: "You turned outward instead of inward. Somewhere in the faces and the motion of strangers, you believed there was a mirror.",
        nextId: "4.2"
      },
      {
        text: "I should stop by the mall. Stock up. Something tells me I should be prepared.",
        value: "Warden",
        postText: "The instinct was quiet but certain. Before anything else — before answers, before rest — you needed to know you were ready.",
        nextId: "4.3"
      },
      {
        text: "I'm exhausted. But I want to go for another round anyway.",
        value: "Scout",
        postText: "Tired was never a good enough reason to stop. There was more path ahead and you were going to run it.",
        nextId: "4.4"
      }
    ]
  },
  {
    id: "4.1",
    title: "The Research",
    section: "PATH",
    type: "WHY",
    weight: 1,
    story: "You push through the door and drop onto the chair in front of your desk. Your legs are still burning. You don't care. You open the laptop and go straight for it — the news alert from this morning, the one you dismissed over coffee. It pulls up fast. Too fast. There is more now. Much more. Videos, posts, live streams, shaky phone footage uploaded minutes ago from cities you recognize and cities you don't. You watch. A man in a grocery store parking lot, moving wrong — too stiff, too direct, jaw working at nothing. Then he's on someone. A woman screaming. People running. Another clip — a street corner somewhere, three of them, clothes torn and dark with old blood, red streaming from their eyes like something ruptured deep inside. They look human. That's the part that keeps catching you. They look completely human except for the blood and the way they move, like they've forgotten what hesitation is. You replay a clip. A policeman, hands steady, fires twice into the chest of one of them. It stumbles. Keeps coming. He fires again. The shoulder. It doesn't stop. Then — the head. It drops. Immediately. No stagger, no slow fall. Just done. You rewind. Watch it again. And again. You sit back in your chair. The room is very quiet.",
    question: "Why does it have to be the head?",
    options: [
      {
        text: "Nothing else stopped them. Every shot to the body failed. The head was the only thing that worked every single time.",
        value: "Strategist",
        postText: "You didn't panic. You observed, you tested the pattern, and you found the rule. That is what you do. That is what will keep you alive.",
        nextId: null
      }
    ]
  },
  {
    id: "4.2",
    title: "The Park",
    section: "PATH",
    type: "WHY",
    weight: 1,
    story: "You sit on the bench and watch. Not out of sentiment — out of habit. The park, the people, the patterns of how strangers move around each other. Children are running between the play structures, shouting and laughing. A man passes by with a golden retriever on a leash, coughing — rough and wet. You track him without thinking. He walks toward the play area. Something about the way he moves catches your eye. Too rigid. Too fixed. Then he's at the kiddie house, fingers gripping the window frame, trying to force his way through. The children inside start screaming. You are already moving. You close the distance fast, eyes scanning the ground, and your hand finds a rock before your mind finishes the thought. The retriever has torn free of its leash and is barking furiously at its owner — and the man turns toward the sound. Toward the dog. You throw the rock hard. It connects with the side of his head. He turns. Now he sees you. The children's screaming fades as they scramble out and run. Good. The man starts toward you. You back up, keeping the distance, buying time — but your legs have nothing left in them. The morning's run catches up all at once and your knees buckle. The ground comes up fast. You look up and the man is right there, and you cannot move. Then a figure in a jacket steps in from the side — full gear, no hesitation — and smashes its head like it was nothing more than something in the way. The man drops. The figure is already walking away. The retriever stands over its owner, leash dragging in the dirt, barking now turned to a low confused whine. It looks at you. Still on the ground. Catching your breath. The leash is right there.",
    question: "Why did you take the leash?",
    options: [
      {
        text: "I understood what was happening. And I wasn't going to leave it standing there alone in the middle of it.",
        value: "Visionary",
        postText: "You saw the whole picture before most people would have blinked. The chaos coming, the dog with nowhere to go, and the one small decisive thing still in your hands.",
        nextId: null
      }
    ]
  },
  {
    id: "4.3",
    title: "The Mall",
    section: "PATH",
    type: "WHY",
    weight: 1,
    story: "The mall is already stirring when you arrive. Not busy — just the early kind of crowded, the kind that belongs to people with nowhere urgent to be. You nod at the security guard by the entrance. He nods back. You grab two carts without breaking stride and head straight for the non-perishables. You move with a list that exists only in your head — efficient, deliberate, no doubling back. Canned goods, dry staples, sealed containers. You check each one before it goes in. Dates, condition, packaging integrity. A cluster of items near the front of the shelf are close to expiration. You leave them and reach further back. A couple beside you picks up the ones you passed over. You watch them for a second. You can't help it. 'If I were you I would choose the ones on this section rather than those,' you say, keeping your voice even. 'Those are close to expiration.' They check. Their expressions shift. They thank you. You say you're welcome and keep moving. Both carts are nearly full by the time you reach the cashier. You set the first items on the belt and then it occurs to you — how exactly are you getting all of this home? You are still turning that problem over when the gunshots crack through the mall. Sharp. Loud. Close. Your head snaps toward the entrance. The security guard is firing at something in the doorway. Something large. A figure — if it can be called that — almost eight feet tall, muscle swollen past anything natural, arms raised and crossed over its head like a shield as it absorbs every shot to the chest without slowing. The guard empties into it. Nothing. The creature's left arm swings and connects. The guard's weapon spins through the air and skids across the floor. Directly toward you. You pick it up. No deliberation. No pause. The creature's arms are still raised, still guarding its head, and that tells you everything you need to know. You raise the gun. The first shot grazes its face — too low. You adjust. Three shots, tight, to the head. It goes down like a building coming apart. The mall goes completely silent. Dozens of eyes on you. Then, from outside — distant, layered, growing — a sound like nothing that belongs in a city morning.",
    question: "What do you do?",
    options: [
      {
        text: "More are coming. We need to blockade this place. Now.",
        value: "Warden",
        postText: "Probably the respect from taking it down — everyone just listened without question. And at least now I don't have to worry about getting my groceries home.",
        nextId: null
      }
    ]
  },
  {
    id: "4.4",
    title: "One More Round",
    section: "PATH",
    type: "WHY",
    weight: 1,
    story: "Your legs are done. Your lungs already made their case a loop ago. But the path is still there and so are you, so you run it again. And again. By the time you finally let yourself stop you are barely jogging — more like a controlled fall forward. Enough. You turn toward the park benches to sit down and that is when the children start screaming. Not playing. Not laughing too loud. Screaming and running, a wave of small bodies pouring away from the far end of the park, faces white, not looking back. You look where they came from. A man is crouched over a dog on the ground. The dog is not moving. The man is — his jaw, his hands, pulling. The dizziness from the run is already behind your eyes and what you are seeing pushes it forward fast. Your stomach turns. You plant your feet and breathe through it. Then a figure cuts across the park — jacket, full gear, moving with the kind of purpose that has no hesitation in it. One strike to the man's head. He drops. The figure doesn't slow down. Doesn't look at the dog. Doesn't look at anything except the park exit. Where you are standing. Still stunned. Still processing. 'Why did you kill that man?' The words are out before you decide to say them. The figure doesn't answer. Doesn't even glance at you. Just moves to pass. Your hand shoots out and grabs the jacket. It pulls back. A face turns toward you — and then a fist finds yours before you can read it. The ground comes up hard. You try to get up. Your arms push. Your head has other plans. The dizziness that's been waiting since the last loop closes in all at once and the world goes dark and quiet.",
    question: "...",
    options: [
      {
        text: "Wake up.",
        value: "Scout",
        postText: "You are inside a vehicle. The road is rough and loud and every bump pulls you back from the edge of sleep. You catch a glimpse of trees through the window moving fast. Your head throbs. Your eyes are already closing again.",
        nextId: null
      }
    ]
  },

  // ==================== SECTION 2: TIER 1 (Q16-Q23) ====================
  // Values: A, B, C, D (map to index 0, 1, 2, 3 in Path's Tier 1 list)
  { id: "16.0", section: 'TIER1', weight: 2.0, question: "Faced with a complex issue, you:", 
    options: [
      { text: "Plan multiple steps ahead", value: 0 },
      { text: "Build or modify something", value: 1 },
      { text: "Study patterns and signals", value: 2 },
      { text: "Organize structure and layout", value: 3 }
    ]
  },
  { id: "17.0", section: 'TIER1', weight: 1.5, question: "Your strength is:", 
    options: [
      { text: "Strategy", value: 0 },
      { text: "Creation", value: 1 },
      { text: "Insight", value: 2 },
      { text: "Structure", value: 3 }
    ]
  },
  { id: "18.0", section: 'TIER1', weight: 1.0, question: "You prefer to:", 
    options: [
      { text: "Direct outcomes", value: 0 },
      { text: "Improve tools", value: 1 },
      { text: "Understand behavior", value: 2 },
      { text: "Build stability", value: 3 }
    ]
  },
  { id: "19.0", section: 'TIER1', weight: 1.5, question: "In preparation, you:", 
    options: [
      { text: "Map scenarios", value: 0 },
      { text: "Prepare equipment", value: 1 },
      { text: "Gather information", value: 2 },
      { text: "Reinforce systems", value: 3 }
    ]
  },
  { id: "20.0", section: 'TIER1', weight: 2.0, question: "Others rely on you for:", 
    options: [
      { text: "Plans", value: 0 },
      { text: "Fixes", value: 1 },
      { text: "Analysis", value: 2 },
      { text: "Organization", value: 3 }
    ]
  },
  { id: "21.0", section: 'TIER1', weight: 1.5, question: "You approach problems by:", 
    options: [
      { text: "Anticipating outcomes", value: 0 },
      { text: "Creating solutions", value: 1 },
      { text: "Interpreting data", value: 2 },
      { text: "Structuring environments", value: 3 }
    ]
  },
  { id: "22.0", section: 'TIER1', weight: 1.0, question: "You value:", 
    options: [
      { text: "Control of direction", value: 0 },
      { text: "Practical capability", value: 1 },
      { text: "Understanding", value: 2 },
      { text: "Stability", value: 3 }
    ]
  },
  { id: "23.0", section: 'TIER1', weight: 1.0, question: "You improve survival by:", 
    options: [
      { text: "Planning ahead", value: 0 },
      { text: "Building tools", value: 1 },
      { text: "Reading situations", value: 2 },
      { text: "Strengthening systems", value: 3 }
    ]
  },

  // ==================== SECTION 3: STYLE (Q24-Q28) ====================
  { id: "24.0", section: 'STYLE', weight: 2.0, question: "Entering danger, you:", 
    options: [
      { text: "Move first to gain advantage", value: "Aggressive" },
      { text: "Secure position before acting", value: "Defensive" },
      { text: "Wait for the right moment", value: "Opportunist" }
    ]
  },
  { id: "25.0", section: 'STYLE', weight: 1.5, question: "When uncertain, you:", 
    options: [
      { text: "Take initiative", value: "Aggressive" },
      { text: "Reduce exposure", value: "Defensive" },
      { text: "Stay flexible", value: "Opportunist" }
    ]
  },
  { id: "26.0", section: 'STYLE', weight: 1.0, question: "Facing resistance, you:", 
    options: [
      { text: "Push through", value: "Aggressive" },
      { text: "Hold ground", value: "Defensive" },
      { text: "Redirect approach", value: "Opportunist" }
    ]
  },
  { id: "27.0", section: 'STYLE', weight: 2.0, question: "In conflict, you:", 
    options: [
      { text: "Engage quickly", value: "Aggressive" },
      { text: "Defend carefully", value: "Defensive" },
      { text: "Adapt continuously", value: "Opportunist" }
    ]
  },
  { id: "28.0", section: 'STYLE', weight: 1.5, question: "Under pressure, you:", 
    options: [
      { text: "Act decisively", value: "Aggressive" },
      { text: "Stabilize the situation", value: "Defensive" },
      { text: "Adjust dynamically", value: "Opportunist" }
    ]
  },

  // ==================== SECTION 4: ALIGNMENT (Q29-Q32) ====================
  { id: "29.0", section: 'ALIGNMENT', weight: 1.5, question: "You find hidden resources. You:", 
    options: [
      { text: "Use them for group benefit", value: "Good" },
      { text: "Keep them for controlled use", value: "Evil" }
    ]
  },
  { id: "30.0", section: 'ALIGNMENT', weight: 1.5, question: "Leadership should:", 
    options: [
      { text: "Serve the group", value: "Good" },
      { text: "Maintain control", value: "Evil" }
    ]
  },
  { id: "31.0", section: 'ALIGNMENT', weight: 2.0, question: "In scarcity, you:", 
    options: [
      { text: "Distribute fairly", value: "Good" },
      { text: "Prioritize strategically", value: "Evil" }
    ]
  },
  { id: "32.0", section: 'ALIGNMENT', weight: 1.0, question: "Trust is:", 
    options: [
      { text: "Built and shared", value: "Good" },
      { text: "Limited and managed", value: "Evil" }
    ]
  },
  // ==================== SECTION 5: SPECIALIST TRIALS (Q33+) ====================
  { id: "33.0", section: 'TRIAL', weight: 1.0, question: "A structural collapse is imminent in a sector you don't control. You:", 
    options: [
      { text: "Divert resources to shore up the foundation immediately", value: 150 },
      { text: "Evacuate the sector and salvage materials", value: 100 },
      { text: "Warn the locals and let them handle it", value: 50 },
      { text: "Ignore it and focus on your own borders", value: 0 }
    ]
  },
  { id: "34.0", section: 'TRIAL', weight: 1.0, question: "A rogue AI signal is interfering with your communications. Your move:", 
    options: [
      { text: "Isolate the frequency and trace it back to its source", value: 150 },
      { text: "Encrypt all outgoing transmissions", value: 100 },
      { text: "Reset the network and hope for the best", value: 50 },
      { text: "Abandon the frequency and use manual couriers", value: 0 }
    ]
  },
  { id: "35.0", section: 'TRIAL', weight: 1.0, question: "A hostile group offers a trade that is clearly a trap. You:", 
    options: [
      { text: "Accept, but set a counter-ambush at the trade site", value: 150 },
      { text: "Decline and prepare for their inevitable assault", value: 100 },
      { text: "Send a proxy to the trade", value: 50 },
      { text: "Block all contact with them", value: 0 }
    ]
  },
  { id: "36.0", section: 'TRIAL', weight: 1.0, question: "Your primary energy source is failing. You must choose:", 
    options: [
      { text: "Overclock the core while researching a backup", value: 150 },
      { text: "Ration power across all non-essential systems", value: 100 },
      { text: "Shut down one entire wing of your facility", value: 50 },
      { text: "Let it burn out and adapt to the dark", value: 0 }
    ]
  },
  { id: "37.0", section: 'TRIAL', weight: 1.0, question: "An unknown plague is spreading at your borders. You:", 
    options: [
      { text: "Establish a strict quarantine and research a cure", value: 150 },
      { text: "Burn the affected areas to stop the spread", value: 100 },
      { text: "Seal the borders and ignore the victims", value: 50 },
      { text: "Do nothing and hope for natural immunity", value: 0 }
    ]
  },
  { id: "38.0", section: 'TRIAL', weight: 1.0, question: "A deep-cover agent has been discovered in your inner circle. You:", 
    options: [
      { text: "Feed them false data to map their entire network", value: 150 },
      { text: "Publicly execute them as a warning to others", value: 100 },
      { text: "Quietly exile them and change all protocols", value: 50 },
      { text: "Pretend you didn't notice to avoid conflict", value: 0 }
    ]
  },
  { id: "39.0", section: 'TRIAL', weight: 1.0, question: "A massive storm is approaching your farms. You decide to:", 
    options: [
      { text: "Deploy atmospheric stabilizers to divert the front", value: 150 },
      { text: "Harvest everything early and store in bunkers", value: 100 },
      { text: "Reinforce the field barriers and pray", value: 50 },
      { text: "Abandon the harvest and flee to higher ground", value: 0 }
    ]
  },
  { id: "40.0", section: 'TRIAL', weight: 1.0, question: "Two allied groups are on the brink of war. Your intervention:", 
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

/**
 * UI Metadata and Flavor for Archetype Identity
 * Reconstructed based on system archetypes and tactical aesthetics.
 */
export const ARCHETYPE_PROTOCOLS = {
    'Strategist': {
        flavor: "A methodical thinker who sees several moves ahead. You break complex problems into clear steps, resist impulsive decisions, and find satisfaction in systems that run without friction. Precision is your default mode.",
        perk: "Path to the Cure",
        multipliers: { int: 1.5, wis: 1.5, str: 0.8, agi: 0.8, vit: 1.0, luk: 1.0 }
    },
    'Visionary': {
        flavor: "You lead with possibility, not precedent. People are drawn to your clarity of purpose and your ability to make the future feel real before it arrives. You create momentum by making others believe.",
        perk: "Unlocking the Golden Retriever Pet",
        multipliers: { int: 1.1, wis: 1.3, str: 0.7, agi: 1.0, vit: 0.9, luk: 1.5 }
    },
    'Warden': {
        flavor: "Reliable under pressure and loyal by nature. You build environments where others feel safe to perform their best. You don't seek the spotlight — you hold the foundation so others can stand on it.",
        perk: "People Respect",
        multipliers: { int: 0.8, wis: 1.0, str: 1.5, agi: 0.7, vit: 1.5, luk: 0.8 }
    },
    'Scout': {
        flavor: "Restless and perceptive, you operate best at the edge of the known. You spot what others overlook, adapt faster than most, and thrive when the situation demands improvisation over protocol.",
        perk: "Unlocking the Mysterious Ally",
        multipliers: { int: 1.0, wis: 0.8, str: 0.9, agi: 1.5, vit: 1.0, luk: 1.5 }
    },
    'None': {
        flavor: "No dominant trait has emerged yet — and that's a strength. You carry no fixed limitations and adapt to whatever the moment requires. Your path is wide open.",
        perk: "Blank Slate (Versatile Growth) | Potentiality Index (Fast Initial Levels) | Unbound (No Path Constraints)",
        multipliers: { int: 1.0, wis: 1.0, str: 1.0, agi: 1.0, vit: 1.0, luk: 1.0 }
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

  answers.forEach(({ id, value, weight, section }) => {
    // If we have weight and section in the answer (new DB-backed system), use them.
    // Otherwise, fallback to the static ARCHETYPE_QUIZ (legacy support during transition).
    let qWeight = weight;
    let qSection = section;

    if (qWeight === undefined || qSection === undefined) {
      const q = ARCHETYPE_QUIZ.find(item => item.id === id);
      if (!q) return;
      qWeight = q.weight;
      qSection = q.section;
    }

    if (qSection === 'TRIAL') {
        masteryPoints += parseInt(value);
        return;
    }

    stageResults[qSection][value] = (stageResults[qSection][value] || 0) + qWeight;
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

  const protocol = ARCHETYPE_PROTOCOLS[path] || ARCHETYPE_PROTOCOLS['None'];
  let styleLabel = null;
  let finalLabel = null;

  if (path && tier1 && style) {
      const config = ARCHETYPE_MATRIX[path][tier1][style];
      styleLabel = config.label;
      if (alignment) {
          finalLabel = alignment === "Good" ? config.good : config.evil;
      } else {
          finalLabel = styleLabel; // Fallback to style label if alignment is missing
      }
  } else {
      finalLabel = path; // Minimum fallback to the base Path name (e.g. Scout)
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
        str: Math.round(50 * protocol.multipliers.str),
        vit: Math.round(50 * protocol.multipliers.vit),
        agi: Math.round(50 * protocol.multipliers.agi),
        int: Math.round(50 * protocol.multipliers.int),
        wis: Math.round(50 * protocol.multipliers.wis),
        luk: Math.round(50 * protocol.multipliers.luk)
    }
  };
}
