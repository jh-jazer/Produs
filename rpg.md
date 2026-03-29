Here's the fully updated document with all perks integrated:

---

# RPG Archetype System — Full Design Document

---

## The 4 Axes

| Axis | A | B |
|---|---|---|
| 1 | STR dominant | WIS dominant |
| 2 | DEX dominant | INT dominant |
| 3 | END dominant | CHA dominant |
| 4 | END > DEX (Stable) | DEX > END (Adaptive) |

---

## Full Reference Table

| # | Name | Code | Dominant Stats | Apocalypse Role |
|---|---|---|---|---|
| 1 | Iron Fist | SDES | STR + DEX + END stable | Path clearer |
| 2 | Blade Dancer | SDEA | STR + DEX + END adaptive | Scout assassin |
| 3 | Warlord | SDCS | STR + DEX + CHA stable | Raid leader |
| 4 | Vanguard | SDCA | STR + DEX + CHA adaptive | Frontline diplomat |
| 5 | Sentinel | SIES | STR + INT + END stable | Last line of defense |
| 6 | Forge Master | SIEA | STR + INT + END adaptive | Builder engineer |
| 7 | Commander | SICS | STR + INT + CHA stable | Faction leader |
| 8 | Champion | SICA | STR + INT + CHA adaptive | Crisis leader |
| 9 | Shadow Monk | WDES | WIS + DEX + END stable | Ghost operative |
| 10 | Ghost | WDEA | WIS + DEX + END adaptive | Infiltrator |
| 11 | Diplomat | WDCS | WIS + DEX + CHA stable | Alliance builder |
| 12 | Bard | WDCA | WIS + DEX + CHA adaptive | Voice of the movement |
| 13 | Oracle | WIES | WIS + INT + END stable | Group compass |
| 14 | Druid | WIEA | WIS + INT + END adaptive | Tracker naturalist |
| 15 | Alchemist | WICS | WIS + INT + CHA stable | Medic strategist |
| 16 | Architect | WICA | WIS + INT + CHA adaptive | System designer |

---

## How the System Determines Your Archetype

The algorithm checks 4 questions in order:

Step 1 — Force vs Wisdom: Is STR higher than WIS? If yes, you are in the STR group (archetypes 1–8). If no, you are in the WIS group (archetypes 9–16).

Step 2 — Speed vs Knowledge: Is DEX higher than INT? If yes, you are in the DEX column (archetypes 1–4 or 9–12). If no, you are in the INT column (archetypes 5–8 or 13–16).

Step 3 — Endurance vs Charisma: Is END higher than CHA? If yes, you are in the END row. If no, you are in the CHA row.

Step 4 — Stable vs Adaptive: Is END higher than DEX? If yes, you are Stable. If no, you are Adaptive.

Four binary questions. One of 16 archetypes. No overlap, no ambiguity.

---

## Implementation Pseudocode

```javascript
function getArchetype(stats) {
  const { str, dex, end, int, wis, cha } = stats;

  const axis1 = str >= wis ? 'STR' : 'WIS';
  const axis2 = dex >= int ? 'DEX' : 'INT';
  const axis3 = end >= cha ? 'END' : 'CHA';
  const axis4 = end >= dex ? 'STABLE' : 'ADAPTIVE';

  const map = {
    'STR-DEX-END-STABLE':   'Iron Fist',
    'STR-DEX-END-ADAPTIVE': 'Blade Dancer',
    'STR-DEX-CHA-STABLE':   'Warlord',
    'STR-DEX-CHA-ADAPTIVE': 'Vanguard',
    'STR-INT-END-STABLE':   'Sentinel',
    'STR-INT-END-ADAPTIVE': 'Forge Master',
    'STR-INT-CHA-STABLE':   'Commander',
    'STR-INT-CHA-ADAPTIVE': 'Champion',
    'WIS-DEX-END-STABLE':   'Shadow Monk',
    'WIS-DEX-END-ADAPTIVE': 'Ghost',
    'WIS-DEX-CHA-STABLE':   'Diplomat',
    'WIS-DEX-CHA-ADAPTIVE': 'Bard',
    'WIS-INT-END-STABLE':   'Oracle',
    'WIS-INT-END-ADAPTIVE': 'Druid',
    'WIS-INT-CHA-STABLE':   'Alchemist',
    'WIS-INT-CHA-ADAPTIVE': 'Architect',
  };

  const key = `${axis1}-${axis2}-${axis3}-${axis4}`;
  return map[key];
}
```

---

## The 16 Archetypes

---

### 1. Iron Fist
**Code:** SDES — STR + DEX + END + Stable
**Stat Profile:** STR 92 / DEX 80 / END 95 / INT 40 / WIS 45 / CHA 40

**Lore:** Does not need a plan. Does not need a reason. Just needs a target and enough time. The Iron Fist is the purest expression of disciplined physical force — relentless, methodical, and impossible to stop.

**Apocalypse Role:** The one who clears the path. Every dangerous job, every physical barrier, every task that requires sustained brutal effort — this is their domain. The group does not survive without them.

**Real Life Habits:** Heavy training, strict sleep schedules, rigid nutrition plans, unbroken workout streaks

**Unlock Condition:** STR highest stat, DEX second highest, END above 70, END higher than DEX

**Perks:**
- Ironclad — STR XP gains multiplied by 1.5x permanently
- Unbroken — END XP gains multiplied by 1.4x permanently
- Pain is Data — Every time a workout streak reaches a new personal record length, bonus +50 STR XP
- The Wall — Streak protection once per month. One missed day does not break the streak.
- Weakness Offset — CHA gains 0.8x so social isolation does not completely cripple them

**5-Tier Evolution:**
- Tier 1 — Brawler
- Tier 2 — Iron Fist
- Tier 3 — The Relentless
- Tier 4 — Unstoppable Force
- Tier 5 — The Wall That Walks

---

### 2. Blade Dancer
**Code:** SDEA — STR + DEX + END + Adaptive
**Stat Profile:** STR 88 / DEX 95 / END 72 / INT 45 / WIS 48 / CHA 42

**Lore:** Moves faster than thought. Where Iron Fist bulldozes, Blade Dancer flows. Same physical dominance, completely different expression — fluid, precise, and gone before you realize what happened.

**Apocalypse Role:** Scout, assassin, first responder. Strikes clean and disappears. Never fights a battle they cannot win — because they have already read the terrain and planned three exits.

**Real Life Habits:** Cardio, speed training, daily planner completion, morning routines, athletic flexibility work

**Unlock Condition:** STR highest or second highest, DEX highest stat, END above 60, DEX higher than END

**Perks:**
- Flow State — DEX XP gains multiplied by 1.5x permanently
- Strike First — Completing all daily planner tasks before noon gives +20 bonus DEX XP
- Momentum — If STR and DEX both earn XP on the same day, both get an additional 1.2x multiplier stacked on top
- Reflex — Every 7-day DEX streak gives 1.25x STR XP for that entire week
- Weakness Offset — WIS gains 0.8x so they do not completely neglect reflection

**5-Tier Evolution:**
- Tier 1 — Street Brawler
- Tier 2 — Blade Dancer
- Tier 3 — Phantom Edge
- Tier 4 — Death's Silhouette
- Tier 5 — The Undying Blade

---

### 3. Warlord
**Code:** SDCS — STR + DEX + CHA + Stable
**Stat Profile:** STR 90 / DEX 78 / END 65 / INT 50 / WIS 55 / CHA 82

**Lore:** Built to lead through action. Does not inspire with words — inspires by being the first one through the door. People follow the Warlord not because they were told to but because they cannot help it.

**Apocalypse Role:** Raid leader. Plans the strike, leads the charge, brings everyone home. Combines physical dominance with magnetic command. The faction others fear and allies want on their side.

**Real Life Habits:** Team workouts, group challenges, linked partner habits, leadership in fitness, physical goal accountability

**Unlock Condition:** STR highest stat, CHA above 70, DEX second highest, END lower than DEX

**Perks:**
- War Cry — Any habit completed with a Link partner gives 1.4x CHA XP instead of base
- By Force — STR XP gains multiplied by 1.4x permanently
- Rally — When both linked partners hit their streak on the same day, both get +25 bonus STR XP
- Conquest — Every personal physical record broken gives +30 CHA XP in addition to STR XP
- Weakness Offset — INT gains 0.8x so they are not completely outthought

**5-Tier Evolution:**
- Tier 1 — Pack Leader
- Tier 2 — Warlord
- Tier 3 — Iron Banner
- Tier 4 — The Conqueror
- Tier 5 — King of the Battlefield

---

### 4. Vanguard
**Code:** SDCA — STR + DEX + CHA + Adaptive
**Stat Profile:** STR 85 / DEX 90 / END 55 / INT 52 / WIS 58 / CHA 88

**Lore:** The tip of the spear in every sense. Fast, strong, magnetic, and always moving. The Vanguard does not hold position — they create momentum and pull everyone else into it.

**Apocalypse Role:** The face of the group in dangerous territory. Negotiates from a position of obvious physical strength. Scouts new areas and returns with both information and new allies.

**Real Life Habits:** Partner workouts, social fitness goals, linked challenges, high-energy group habits, competitive streaks

**Unlock Condition:** STR highest or second highest, DEX highest or second, CHA above 75, DEX higher than END

**Perks:**
- First Blood — The first habit completed each day gives 1.5x XP regardless of stat
- Charge — DEX XP gains multiplied by 1.4x permanently
- Pull — CHA XP gains multiplied by 1.4x permanently
- Trailblazer — Every time the user tries a brand new habit for the first time, +40 bonus DEX XP
- Weakness Offset — END gains 0.8x because Vanguards struggle with long-term consistency

**5-Tier Evolution:**
- Tier 1 — The Eager
- Tier 2 — Vanguard
- Tier 3 — Spearhead
- Tier 4 — The Unstoppable
- Tier 5 — First of the New World

---

### 5. Sentinel
**Code:** SIES — STR + INT + END + Stable
**Stat Profile:** STR 85 / DEX 50 / END 95 / INT 72 / WIS 60 / CHA 48

**Lore:** Cannot be broken. Has studied every threat, prepared for every scenario, and built a body that can absorb whatever the world throws at it. The Sentinel does not react — they were already ready.

**Apocalypse Role:** The last line of defense. Holds the perimeter, manages resources under siege, and outlasts every threat. The group sleeps because the Sentinel does not.

**Real Life Habits:** Workout streaks, sleep discipline, nutrition consistency, reading about systems and strategy, long unbroken habit chains

**Unlock Condition:** STR highest or second highest, INT above 60, END highest stat, END higher than DEX

**Perks:**
- Fortified — END XP gains multiplied by 1.6x permanently — the highest END multiplier in the game
- Garrison — STR XP gains multiplied by 1.35x permanently
- Iron Memory — Streak protection twice per month instead of once
- Prepared Mind — INT XP gains multiplied by 1.25x because Sentinels study threats
- Weakness Offset — CHA gains 0.75x — Sentinels are the most self-sufficient and least social

**5-Tier Evolution:**
- Tier 1 — The Stubborn
- Tier 2 — Sentinel
- Tier 3 — Iron Bulwark
- Tier 4 — The Immovable
- Tier 5 — Eternal Fortress

---

### 6. Forge Master
**Code:** SIEA — STR + INT + END + Adaptive
**Stat Profile:** STR 82 / DEX 70 / END 80 / INT 78 / WIS 58 / CHA 45

**Lore:** Builds things that last. Combines physical capability with intellectual precision and tireless consistency. Where others theorize, the Forge Master makes. Where others quit, the Forge Master iterates.

**Apocalypse Role:** Builder and engineer. Constructs shelters, weapons, tools, and systems from available materials. The reason the group has walls, water, and working equipment.

**Real Life Habits:** Physical training, technical skill building, deep work sessions, course completions, consistent habit streaks in both body and mind

**Unlock Condition:** STR highest or second highest, INT above 65, END above 70, DEX higher than END

**Perks:**
- Masterwork — When STR and INT both earn XP on the same day, both get 1.3x stacked multiplier
- Iteration — Every completed course or book gives 1.4x INT XP instead of base
- The Grind — END XP gains multiplied by 1.35x permanently
- Blueprint — Completing a weekly review unlocks a 1.2x multiplier on all stats for the next 3 days
- Weakness Offset — CHA gains 0.8x — Forge Masters often work alone and need the nudge

**5-Tier Evolution:**
- Tier 1 — The Maker
- Tier 2 — Forge Master
- Tier 3 — Ironwright
- Tier 4 — The Architect of Steel
- Tier 5 — Builder of Civilizations

---

### 7. Commander
**Code:** SICS — STR + INT + CHA + Stable
**Stat Profile:** STR 80 / DEX 55 / END 75 / INT 72 / WIS 65 / CHA 92

**Lore:** No single stat is maxed. Every stat is formidable. The Commander earns authority through demonstrated capability — physically imposing, intellectually credible, and magnetically trustworthy. People follow because they have proven they should be followed.

**Apocalypse Role:** Faction leader. Organizes raids, allocates resources, mediates conflict, and builds the coalition that outlasts everything else. The apocalypse belongs to whoever can unite people — and that is the Commander.

**Real Life Habits:** Linked partner habits, leadership goals, physical consistency, reading and strategy, budget discipline, accountability circles

**Unlock Condition:** CHA highest stat, STR above 65, INT above 60, no stat below 50, END higher than DEX

**Perks:**
- Supreme Command — CHA XP gains multiplied by 1.5x permanently
- No Weak Flank — Any stat that falls below 40% of the user's highest stat gets a temporary 1.3x boost until it recovers. The Commander cannot afford weakness.
- United Front — When the linked partner completes any habit, the Commander gets +10 XP in CHA regardless of what the habit was
- Iron Will — STR XP gains multiplied by 1.35x permanently
- Weakness Offset — None. Commander is designed to be balanced. Their perk is the No Weak Flank mechanic instead.

**5-Tier Evolution:**
- Tier 1 — Squad Leader
- Tier 2 — Commander
- Tier 3 — Warlord
- Tier 4 — Iron Sovereign
- Tier 5 — The Undefeated King

---

### 8. Champion
**Code:** SICA — STR + INT + CHA + Adaptive
**Stat Profile:** STR 82 / DEX 78 / END 55 / INT 75 / WIS 60 / CHA 90

**Lore:** Born to perform when it matters most. The Champion rises under pressure — physically capable, strategically sharp, and irresistibly compelling. They do not maintain systems, they create moments.

**Apocalypse Role:** Crisis leader. When the plan falls apart and people are panicking, the Champion steps into the chaos and creates order through sheer force of presence and quick decisive thinking.

**Real Life Habits:** Partner sprints and challenges, group accountability, competitive learning, linked fitness goals, social habit streaks

**Unlock Condition:** CHA highest or second highest, STR highest or second highest, INT above 60, DEX higher than END

**Perks:**
- Clutch — Any habit completed after 9pm gives 1.4x XP — Champions perform when others have given up
- Rising Star — CHA XP gains multiplied by 1.45x permanently
- High Stakes — Every time the user sets and hits a personal goal, +50 bonus XP split between STR and CHA
- Burst — If 5 or more different habits are completed in a single day, all of them get a 1.3x XP bonus
- Weakness Offset — END gains 0.85x — Champions struggle with consistency but are rewarded for intensity

**5-Tier Evolution:**
- Tier 1 — Contender
- Tier 2 — Champion
- Tier 3 — The Proven
- Tier 4 — Legend in the Making
- Tier 5 — The Undisputed

---

### 9. Shadow Monk
**Code:** WDES — WIS + DEX + END + Stable
**Stat Profile:** STR 55 / DEX 82 / END 80 / INT 72 / WIS 95 / CHA 18

**Lore:** Has conquered the only enemy that truly matters — the self. Needs no one's approval, no external validation, no audience. The Shadow Monk's power is entirely internal and almost impossible to measure from the outside.

**Apocalypse Role:** Ghost operative. Survives alone where groups collapse. Self-sufficient, invisible, and terrifyingly prepared. The one person who was already ready before the world ended.

**Real Life Habits:** Meditation streaks, weekly self-reviews, planner precision, journal reflections, solo habit consistency

**Unlock Condition:** WIS highest stat, DEX above 65, END above 65, CHA below 40, END higher than DEX

**Perks:**
- Inner Sanctum — WIS XP gains multiplied by 1.6x permanently — the highest WIS multiplier in the game
- Discipline of Silence — Every day the Link Feature is not used, END gets +5 bonus XP. The Shadow Monk grows stronger in solitude.
- Ghost Protocol — DEX XP gains multiplied by 1.4x permanently
- Unwitnessed Mastery — Solo habit streaks of 30 or more days give 1.5x END XP instead of base
- Weakness Offset — None. The Shadow Monk is one of two archetypes with no CHA compensation. Their identity is built on not needing it.

**5-Tier Evolution:**
- Tier 1 — Introvert
- Tier 2 — Shadow Monk
- Tier 3 — The Unseen
- Tier 4 — Void Walker
- Tier 5 — He Who Needs No Witness

---

### 10. Ghost
**Code:** WDEA — WIS + DEX + END + Adaptive
**Stat Profile:** STR 50 / DEX 90 / END 70 / INT 75 / WIS 88 / CHA 22

**Lore:** Where Shadow Monk is still and stable, Ghost is fluid and untraceable. Moves through environments leaving no footprint. Adapts to any situation without losing their center. Wisdom guides their movement, not reaction.

**Apocalypse Role:** Infiltrator and survivor. Gets in, gets out, gets what the group needs without anyone knowing they were there. The person sent alone on the mission no one else comes back from.

**Real Life Habits:** Meditation, flexible routines, planner execution, journaling, adaptive habit systems, solo streaks

**Unlock Condition:** WIS highest stat, DEX highest or second highest, END above 55, CHA below 40, DEX higher than END

**Perks:**
- Phase — DEX XP gains multiplied by 1.5x permanently
- No Footprint — Switching between different habit types in the same day gives +15 bonus DEX XP for each switch up to 3 times
- Still Water — WIS XP gains multiplied by 1.4x permanently
- Vanish — Once per week, the Ghost can skip one planned task without it affecting their DEX streak
- Weakness Offset — CHA gains 0.75x — Ghosts avoid social habits but need minimal exposure

**5-Tier Evolution:**
- Tier 1 — The Quiet One
- Tier 2 — Ghost
- Tier 3 — No Trace
- Tier 4 — The Vanishing
- Tier 5 — Never There

---

### 11. Diplomat
**Code:** WDCS — WIS + DEX + CHA + Stable
**Stat Profile:** STR 38 / DEX 80 / END 72 / INT 68 / WIS 90 / CHA 85

**Lore:** Reads every room before entering it. Patient, perceptive, and precise with words. The Diplomat does not rush — they wait for the exact right moment and then act with surgical accuracy.

**Apocalypse Role:** Peace keeper and alliance builder. Prevents wars between survivor factions. Negotiates trade routes, resolves internal conflict, and maintains the social fabric that keeps groups from destroying themselves.

**Real Life Habits:** Gratitude journaling, partner accountability, weekly reviews, social goals, mindful communication habits, finance tracking

**Unlock Condition:** WIS highest stat, CHA above 70, DEX above 65, END higher than DEX

**Perks:**
- Read the Room — WIS XP gains multiplied by 1.5x permanently
- Perfect Timing — Habits completed at the same time of day two days in a row give 1.2x XP — consistency in timing matters to the Diplomat
- Alliance — CHA XP gains multiplied by 1.4x permanently
- Long Game — Finance-related habits give 1.3x WIS XP — Diplomats think in decades
- Weakness Offset — STR gains 0.85x — Diplomats are not fighters but they are not helpless

**5-Tier Evolution:**
- Tier 1 — The Listener
- Tier 2 — Diplomat
- Tier 3 — Silver Tongue
- Tier 4 — The Peacemaker
- Tier 5 — The One Who Stopped the War

---

### 12. Bard
**Code:** WDCA — WIS + DEX + CHA + Adaptive
**Stat Profile:** STR 35 / DEX 85 / END 48 / INT 72 / WIS 82 / CHA 95

**Lore:** Words are spells. Stories are weapons. The Bard understands that narrative is the most powerful force in any human system — and wields it with devastating precision and genuine warmth.

**Apocalypse Role:** The voice of the movement. Rallies broken survivors, rewrites the story of a defeated group, and turns strangers into believers. The one whose words outlast every physical structure.

**Real Life Habits:** Journaling, link feature habits, gratitude practice, reading, social streaks, creative writing

**Unlock Condition:** CHA highest stat, WIS above 70, DEX above 60, DEX higher than END

**Perks:**
- Spellbind — CHA XP gains multiplied by 1.55x permanently
- The Story — Every journal entry gives 1.4x INT XP instead of base — for the Bard, writing is thinking
- Ripple — When a linked partner levels up any stat, the Bard gets +20 CHA XP — their power grows through others' growth
- Verse — Completing 7 consecutive journal entries gives +60 WIS XP bonus
- Weakness Offset — END gains 0.8x — Bards are inconsistent but inspired

**5-Tier Evolution:**
- Tier 1 — Storyteller
- Tier 2 — Bard
- Tier 3 — Silver Tongue
- Tier 4 — Voice of Legends
- Tier 5 — The Word That Moves Worlds

---

### 13. Oracle
**Code:** WIES — WIS + INT + END + Stable
**Stat Profile:** STR 22 / DEX 38 / END 82 / INT 80 / WIS 98 / CHA 60

**Lore:** Operates on a frequency others cannot tune into. Has seen enough patterns, sat with enough silence, and built enough understanding to know how things end before they begin. The Oracle does not guess — they know.

**Apocalypse Role:** The group's compass. Predicts threats, identifies opportunities, and makes the calls that save everyone when all conventional logic has failed. Rare and irreplaceable.

**Real Life Habits:** Meditation streaks, weekly reviews, deep finance tracking, gratitude journaling, long-form reflection, unbroken mindfulness streaks

**Unlock Condition:** WIS highest stat, INT above 65, END above 70, CHA below 70, END higher than DEX

**Perks:**
- The Sight — WIS XP gains multiplied by 1.65x permanently — the highest single stat multiplier in the entire game
- Ancient Knowledge — INT XP gains multiplied by 1.4x permanently
- Foreseen — Completing a weekly review gives double the base WIS XP
- Inevitable — Any habit maintained for 100 or more days gives the Oracle 2.2x END XP instead of the standard 2x streak multiplier
- Weakness Offset — STR gains 0.7x — Oracles are the physically weakest archetype and this barely compensates. That is intentional.

**5-Tier Evolution:**
- Tier 1 — Dreamer
- Tier 2 — Oracle
- Tier 3 — The Farsighted
- Tier 4 — Keeper of Inevitable Truths
- Tier 5 — The One Who Already Knew

---

### 14. Druid
**Code:** WIEA — WIS + INT + END + Adaptive
**Stat Profile:** STR 65 / DEX 72 / END 85 / INT 75 / WIS 90 / CHA 52

**Lore:** Reads the world like a living system. Finds patterns in everything — nature, behavior, markets, habits. Nothing in the environment is noise to the Druid. Everything is signal.

**Apocalypse Role:** Tracker, forager, environmental strategist. Knows which plants are edible, which paths are safe, which weather patterns signal danger. The group never goes hungry or gets caught off guard.

**Real Life Habits:** Consistency streaks, sleep and nutrition tracking, mindfulness, finance pattern tracking, adaptive habit systems

**Unlock Condition:** WIS highest stat, INT above 60, END above 70, DEX higher than END

**Perks:**
- Root System — END XP gains multiplied by 1.5x permanently
- Living Cycle — WIS XP gains multiplied by 1.45x permanently
- Seasonal — Each calendar month the user completes fully — every tracked feature used at least once — gives +100 bonus END XP
- Symbiosis — When both STR and WIS earn XP on the same day, both get a 1.25x stacked bonus — the Druid bridges body and mind
- Weakness Offset — CHA gains 0.85x — Druids are not antisocial, just nature-focused

**5-Tier Evolution:**
- Tier 1 — Wanderer
- Tier 2 — Druid
- Tier 3 — Pattern Seer
- Tier 4 — Voice of the Wild
- Tier 5 — The Living Codex

---

### 15. Alchemist
**Code:** WICS — WIS + INT + CHA + Stable
**Stat Profile:** STR 30 / DEX 55 / END 75 / INT 92 / WIS 88 / CHA 70

**Lore:** Turns nothing into something. Synthesizes chaos into clarity. Every problem is just an unsolved equation and every equation has a solution — the Alchemist just has to find the right reagents.

**Apocalypse Role:** Medic, engineer, and strategist combined. Crafts medicine from raw materials, builds tools from scraps, and designs systems that make the group more capable than the sum of its parts.

**Real Life Habits:** Deep reading, journal entries, finance tracking, deep work sessions, meditation, course completions

**Unlock Condition:** INT highest or second highest, WIS highest or second highest, CHA above 55, END higher than DEX

**Perks:**
- Transmutation — INT XP gains multiplied by 1.55x permanently
- Formula — WIS XP gains multiplied by 1.4x permanently
- Synthesis — Every time the user completes both a journal entry and a finance log on the same day, they get +25 bonus INT XP — the Alchemist connects knowledge and resources
- Refinement — Every book or course completed permanently increases the INT multiplier by 0.02 up to a maximum of 1.75x
- Weakness Offset — STR gains 0.8x — Alchemists are scholars but not helpless

**5-Tier Evolution:**
- Tier 1 — Tinkerer
- Tier 2 — Alchemist
- Tier 3 — Formula Breaker
- Tier 4 — Grand Synthesist
- Tier 5 — Architect of Truth

---

### 16. Architect
**Code:** WICA — WIS + INT + CHA + Adaptive
**Stat Profile:** STR 32 / DEX 88 / END 50 / INT 92 / WIS 82 / CHA 75

**Lore:** Sees the full system before anyone else enters the room. Designs structures — physical, social, financial, behavioral — that outlast any individual. The Architect does not just solve problems. They build environments where problems cannot exist.

**Apocalypse Role:** Base designer, system builder, long-term planner. Turns a temporary camp into a functioning settlement. Sees 10 steps ahead and makes sure the group is already positioned there.

**Real Life Habits:** Daily planner mastery, course completions, journaling ideas, finance systems, partner goal design, adaptive routines

**Unlock Condition:** INT highest stat, WIS above 70, CHA above 60, DEX higher than END

**Perks:**
- Blueprint Mind — INT XP gains multiplied by 1.55x permanently
- The System — DEX XP gains multiplied by 1.45x permanently — Architects execute their plans with precision
- Compound Design — Every consecutive week the daily planner is completed gives an additional 0.05x DEX multiplier stacking up to a maximum of 1.8x — the Architect's system gets stronger the longer it runs
- Network Effect — CHA XP gains multiplied by 1.3x — Architects build social systems not just physical ones
- Weakness Offset — STR gains 0.8x — Architects are thinkers but their systems require physical maintenance

**5-Tier Evolution:**
- Tier 1 — Draftsman
- Tier 2 — Architect
- Tier 3 — System Lord
- Tier 4 — World Builder
- Tier 5 — The Eternal Planner

---

## Perk Reference Table

| Archetype | Primary Multiplier | Secondary Multiplier | Unique Mechanic | Weakness Offset |
|---|---|---|---|---|
| Iron Fist | STR 1.5x | END 1.4x | Streak milestone bonus +50 STR XP | CHA 0.8x |
| Blade Dancer | DEX 1.5x | STR 1.2x conditional | Same-day STR+DEX stack | WIS 0.8x |
| Warlord | CHA 1.4x | STR 1.4x | Partner physical bonus +25 STR XP | INT 0.8x |
| Vanguard | DEX 1.4x | CHA 1.4x | First habit of day 1.5x | END 0.8x |
| Sentinel | END 1.6x | STR 1.35x | Double streak protection | CHA 0.75x |
| Forge Master | INT 1.4x | END 1.35x | Weekly review 1.2x all stats 3 days | CHA 0.8x |
| Commander | CHA 1.5x | STR 1.35x | No Weak Flank auto-boost | None |
| Champion | CHA 1.45x | DEX 1.4x conditional | Late habit 1.4x after 9pm | END 0.85x |
| Shadow Monk | WIS 1.6x | DEX 1.4x | Solitude +5 END XP per day | None |
| Ghost | DEX 1.5x | WIS 1.4x | Habit switch +15 DEX XP x3 | CHA 0.75x |
| Diplomat | WIS 1.5x | CHA 1.4x | Finance gives 1.3x WIS XP | STR 0.85x |
| Bard | CHA 1.55x | INT 1.4x | Partner level-up +20 CHA XP | END 0.8x |
| Oracle | WIS 1.65x | INT 1.4x | Weekly review double WIS XP | STR 0.7x |
| Druid | END 1.5x | WIS 1.45x | Monthly completion +100 END XP | CHA 0.85x |
| Alchemist | INT 1.55x | WIS 1.4x | Journal + finance combo +25 INT XP | STR 0.8x |
| Architect | INT 1.55x | DEX 1.45x | Stacking planner multiplier up to 1.8x | STR 0.8x |

---

## Special Notes on Unique Mechanics

The Oracle has the highest single stat multiplier in the entire game at 1.65x WIS but the lowest STR offset at 0.7x. The tradeoff is real and intentional. Becoming an Oracle means accepting physical vulnerability as part of the identity.

The Shadow Monk and Ghost are the only two archetypes with no CHA compensation whatsoever. Their solitary nature is a core part of who they are, not a bug to be corrected.

The Shadow Monk is the only archetype in the game with a mechanic that rewards not using a feature. Every day the Link Feature goes unused, END grows. The Shadow Monk becomes stronger specifically through solitude.

The Architect's Compound Design perk is the only stacking multiplier in the game. A long-term Architect who never breaks their planner chain becomes statistically the most DEX-efficient archetype over time — but only if they never break the chain. One missed week resets the stack.

The Commander is the only archetype with no weakness offset. Instead their No Weak Flank perk auto-boosts any stat that falls too far behind. They are designed to be the most balanced archetype in the system and their mechanics enforce that identity.

The Alchemist's Refinement perk is the only permanent multiplier upgrade in the game. Every book or course completed pushes their INT multiplier higher, capping at 1.75x. A long-term Alchemist who reads consistently becomes the single highest INT earner in the entire game — surpassing even the Oracle's WIS multiplier at full stack.