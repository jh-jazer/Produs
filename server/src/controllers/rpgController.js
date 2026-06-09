import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';
import { calculateScores, calculateMasteryRank } from '../shared/assessment.js'; 
import NarrativeQuestion from '../models/NarrativeQuestion.js';
import Message from '../models/Message.js';

// @route   GET /api/rpg/history
// @desc    Get recent XP activity history
// @access  Private
export const getActivityHistory = async (req, res) => {
    try {
        const history = await Activity.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json(history);
    } catch (error) {
        console.error('Failed to fetch activity history:', error);
        res.status(500).json({ message: 'Server error during history retrieval.' });
    }
};

// @route   POST /api/rpg/mark-read
// @desc    Mark all activities as read
// @access  Private
export const markActivitiesRead = async (req, res) => {
    try {
        await Activity.updateMany({ user: req.user._id, read: false }, { read: true });
        res.json({ message: 'All activities marked read.' });
    } catch (error) {
        console.error('Failed to mark activities read:', error);
        res.status(500).json({ message: 'Server error marking activities read.' });
    }
};

// @route   POST /api/rpg/log-activity
// @desc    Create a custom activity log (e.g. daily/streak rewards claimed)
// @access  Private
export const logActivity = async (req, res) => {
    try {
        const { type, action, stat, amount } = req.body;
        const newAct = await Activity.create({
            user: req.user._id,
            type: type || 'system',
            action: action || 'Sync activity',
            stat: stat || 'none',
            amount: amount || 0
        });
        res.status(201).json(newAct);
    } catch (error) {
        console.error('Failed to write activity:', error);
        res.status(500).json({ message: 'Failed to record activity log.' });
    }
};

// @route   POST /api/rpg/daily-quiz
// @desc    Complete daily reflection quiz
// @access  Private
export const completeDailyQuiz = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const today = new Date().toISOString().split('T')[0];

        if (user.rpg.dailyQuiz && user.rpg.dailyQuiz.lastCompleted === today) {
            return res.status(400).json({ message: 'Daily quiz already completed for today.' });
        }

        // Award XP for Wisdom/Reflection (+25 XP)
        const result = await awardXP(user, 'wis', 25);
        
        // Mark as completed
        user.rpg.dailyQuiz = { lastCompleted: today };
        
        const { syncUserEnergy } = await import('../utils/rpgUtils.js');
        syncUserEnergy(user);
        await user.save();

        res.json({
            message: 'Daily reflection synchronized.',
            xpAwarded: result.xpAwarded,
            leveledUp: result.leveledUp,
            stats: user.rpg.stats,
            guardianLevel: user.guardianLevel || 0,
            guardianExp: user.guardianExp || 0
        });
    } catch (error) {
        console.error('Daily quiz completion failed:', error);
        res.status(500).json({ message: 'Server error during daily quiz sync.' });
    }
};

// @route   POST /api/rpg/sync-neural
// @desc    Synchronize a level-unlocked neural question
// @access  Private
export const syncNeural = async (req, res) => {
    try {
        const { questionId, value } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.rpg.pendingQuestions.some(id => String(id) === String(questionId))) {
            console.error(`[SYNC_ERROR] Sequence Mismatch. Attempted: ${questionId}. Pending:`, user.rpg.pendingQuestions);
            return res.status(400).json({ message: 'Synchronization sequence invalid or already complete.' });
        }

        // 1. Validate Question & Option
        const questionRef = await NarrativeQuestion.findOne({ questionId });
        if (!questionRef) {
            console.error(`[SYNC_ERROR] Node ${questionId} not found`);
            return res.status(404).json({ message: 'Sync Node Offline' });
        }

        const selectedOption = questionRef.options.find(opt => {
            const dbVal = String(opt.value || "").trim().toLowerCase();
            const dbText = String(opt.text || "").trim().toLowerCase();
            const reqVal = String(value || "").trim().toLowerCase();
            
            // Match against value OR text (as a fallback for older data nodes)
            return dbVal === reqVal || dbText === reqVal;
        });

        if (!selectedOption) {
            console.error(`[SYNC_ERROR] Mismatch at Node ${questionId}. Provided: [${value}]. Valid Options:`, 
                questionRef.options.map(o => `V:${o.value}|T:${o.text}`)
            );
            return res.status(400).json({ 
                message: 'Invalid Neural Choice',
                debug: { sent: value, expected: questionRef.options.map(o => o.value) }
            });
        }

        // 1. Persist the answer with weight from DB
        user.rpg.completedAnswers.push({ 
            id: questionId, 
            value, 
            weight: questionRef.weight, 
            section: questionRef.section,
            timestamp: new Date() 
        });
        
        // Force string comparison for the filter
        user.rpg.pendingQuestions = user.rpg.pendingQuestions.filter(id => String(id) !== String(questionId));
        
        // Finalize Transition IDs
        let nextId = selectedOption.nextId ? String(selectedOption.nextId) : null;
        let nextExists = null;

        if (nextId) {
            const cleanNextId = String(nextId).trim().toLowerCase();
            const numericNextId = parseFloat(cleanNextId);
            
            // Normalize IDs: "2.0" -> "2", "2.0.0" -> "2.0.0"
            const normalizedId = !isNaN(numericNextId) ? String(numericNextId) : cleanNextId;
            
            console.log(`[SYNC_TRACE] Node ${questionId} searching for nextId: [${cleanNextId}] | Normalized: [${normalizedId}]`);

            // Hybrid Lookup: Check for exact string, normalized numeric string, or regex-normalized ID
            nextExists = await NarrativeQuestion.findOne({ 
                $or: [
                    { questionId: cleanNextId },
                    { questionId: normalizedId },
                    { questionId: normalizedId + ".0" }, // For "2" -> "2.0"
                    { questionId: { $regex: new RegExp(`^${cleanNextId.replace('.', '\\.')}$`, 'i') } }
                ].filter(clause => clause.questionId !== null)
            });
            
            if (nextExists) {
                const verifiedId = nextExists.questionId;
                if (!user.rpg.pendingQuestions.includes(verifiedId)) {
                    user.rpg.pendingQuestions.unshift(verifiedId);
                    console.log(`[SYNC_LINK] Node ${questionId} -> ${verifiedId} (Verified).`);
                }
            } else {
                console.warn(`[SYNC_WARNING] Node ${questionId} points to missing nextId: [${cleanNextId}].`);
            }
        }
        const results = calculateScores(user.rpg.completedAnswers);
        
        // 4. Update Identity Slices (Only if already awakened, otherwise wait for Handshake)
        let oldRank = user.rpg.specialistRank || 'F';
        let newRank = oldRank;

        if (user.guardianLevel > 0) {
            user.rpg.path = results.path;
            user.rpg.tier1 = results.tier1;
            user.rpg.style = results.style;
            user.rpg.alignment = results.alignment;
            user.rpg.styleLabel = results.styleLabel;
            user.rpg.finalLabel = results.finalLabel || results.styleLabel || results.tier1 || results.path;
            
            // 5. Handle Mastery & Ranks
            oldRank = user.rpg.specialistRank || 'F';
            user.rpg.masteryPoints = results.masteryPoints;
            newRank = calculateMasteryRank(user.rpg.masteryPoints);
            user.rpg.specialistRank = newRank;

            // 6. Record Speed Records (SSS)
            if (newRank === 'SSS' && !user.rpg.levelReachedSSS) {
                user.rpg.levelReachedSSS = user.guardianLevel;
            }
        }

        // 7. Handle Initial Awakening (Handled via Handshake now)
        // Level 1 transformation and Path assignment are triggered by the NEURAL_HANDSHAKE ceremony.

        user.markModified('rpg');
        const { syncUserEnergy } = await import('../utils/rpgUtils.js');
        syncUserEnergy(user);
        await user.save();

        // Diagnostic Trace
        const narrativeCount = await NarrativeQuestion.countDocuments();
        const debug = {
            receivedId: questionId,
            cleanNextId: nextId,
            foundNext: !!nextExists,
            totalNodes: narrativeCount,
            userPendingLength: user.rpg.pendingQuestions.length
        };

        // Safety check for rank comparison
        const safeOldRank = String(oldRank || 'F');
        const safeNewRank = String(newRank || 'F');

        res.json({
            ...user.rpg.toObject(),
            guardianLevel: user.guardianLevel || 0,
            guardianExp: user.guardianExp || 0,
            newRank: (safeOldRank !== safeNewRank) ? safeNewRank : null,
            message: 'Neural synapse stabilized.',
            debug
        });

    } catch (error) {
        console.error('Neural sync failed:', error);
        res.status(500).json({ message: 'Server error during neural synchronization.' });
    }
};

/**
 * initiateAwakening - Sets up the first narrative node for a Level 0 user.
 * @route POST /api/rpg/initiate-awakening
 * @access Private
 */
export const initiateAwakening = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.hero.level !== 0) {
            return res.status(400).json({ message: 'User is already awakened.' });
        }

        // Initialize with the root Node 1.0 ONLY if they have no progress at all
        const hasProgress = (user.rpg.pendingQuestions?.length > 0) || (user.rpg.completedAnswers?.length > 0);
        
        if (!hasProgress) {
            user.rpg.pendingQuestions = [String("1.0")];
            user.markModified('rpg');
            await user.save();
        }

        res.json({
            message: "Awakening Sequence Initiated.",
            rpg: user.rpg
        });
    } catch (error) {
        console.error('Initiate Awakening failed:', error);
        res.status(500).json({ message: 'Failed to initiate awakening sequence.' });
    }
};

// @route   GET /api/rpg/narrative-history
// @desc    Get the full chronological story log for the user
// @access  Private
export const getNarrativeHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const history = user.rpg.completedAnswers;

        if (!history || history.length === 0) {
            return res.json([]);
        }

        // Fetch all unique question details
        const questionIds = [...new Set(history.map(h => h.id))];
        const narrativeNodes = await NarrativeQuestion.find({ questionId: { $in: questionIds } });

        const log = history.map(ans => {
            const node = narrativeNodes.find(n => n.questionId === ans.id);
            if (!node) return null;

            const selectedOption = node.options.find(opt => opt.value === ans.value);
            
            return {
                questionId: ans.id,
                section: ans.section,
                timestamp: ans.timestamp,
                story: node.story,
                question: node.question,
                options: node.options, // Added options for frontend lookup
                choiceText: selectedOption?.text || "Unknown Choice",
                postText: selectedOption?.postText || ""
            };
        }).filter(Boolean);

        res.json(log);
    } catch (error) {
        console.error('Failed to fetch narrative history:', error);
        res.status(500).json({ message: 'Neural memory retrieval failed.' });
    }
};

// @route   GET /api/rpg/leaderboard/sss
// @desc    Get the Hall of SSS (Soonest to reach SSS)
// @access  Private
export const getSSSLeaderboard = async (req, res) => {
    try {
        const leaders = await User.find({ 'rpg.levelReachedSSS': { $exists: true, $gt: 0 } })
            .select('name username avatar level rpg.levelReachedSSS rpg.specialistRank rpg.finalLabel')
            .sort({ 'rpg.levelReachedSSS': 1, updatedAt: 1 })
            .limit(50);
        
        res.json(leaders);
    } catch (error) {
        console.error('Failed to fetch SSS leaderboard:', error);
        res.status(500).json({ message: 'Server error during leaderboard retrieval.' });
    }
};

// @route   GET /api/rpg/leaderboard/lpt
// @desc    Get LPT ranking leaderboard (overall accumulated LPT over a year)
// @access  Private
export const getLptLeaderboard = async (req, res) => {
    try {
        const leaders = await User.aggregate([
            { $match: { partner: { $exists: true, $ne: null } } },
            {
                $project: {
                    name: 1,
                    username: 1,
                    avatar: 1,
                    level: 1,
                    partner: 1,
                    'rpg.linkPoints': 1,
                    'rpg.linkTree.pointsSpent': 1,
                    accumulatedLpt: {
                        $add: [
                            { $ifNull: ["$rpg.linkPoints", 0] },
                            { $ifNull: ["$rpg.linkTree.pointsSpent", 0] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    pair: {
                        $cond: {
                            if: { $lt: ["$_id", "$partner"] },
                            then: ["$_id", "$partner"],
                            else: ["$partner", "$_id"]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$pair",
                    accumulatedLpt: { $max: "$accumulatedLpt" },
                    users: {
                        $push: {
                            _id: "$_id",
                            name: "$name",
                            username: "$username",
                            avatar: "$avatar"
                        }
                    }
                }
            },
            { $match: { accumulatedLpt: { $gt: 0 } } },
            { $sort: { accumulatedLpt: -1 } },
            { $limit: 20 }
        ]);
        
        res.json(leaders);
    } catch (error) {
        console.error('Failed to fetch LPT leaderboard:', error);
        res.status(500).json({ message: 'Server error during LPT leaderboard retrieval.' });
    }
};

// @route   GET /api/rpg/leaderboard/territory
// @desc    Get current global stat leaders (Territory Lords)
// @access  Private
export const getTerritoryLords = async (req, res) => {
    try {
        const statMappings = {
            str: "Lord of Iron",
            vit: "Lord of Resilience",
            agi: "Lord of Storms",
            int: "Lord of Void",
            wis: "Lord of Light",
            luk: "Lord of Chaos"
        };
        const lords = {};

        for (const [stat, title] of Object.entries(statMappings)) {
            const topUser = await User.findOne({ 'rpg.specialistRank': 'SSS' }) 
                .select(`name username avatar rpg.stats.${stat} rpg.finalLabel`)
                .sort({ [`rpg.stats.${stat}`]: -1, level: -1 })
                .lean();
            
            if (topUser) {
                lords[stat] = {
                    user: topUser,
                    value: topUser.rpg.stats[stat],
                    claimed: true
                };
            } else {
                // Return a "System Lord" NPC if no human SSS has claimed it yet
                lords[stat] = {
                    user: {
                        name: "System_Sentinel",
                        username: "produs_npc",
                        avatar: { url: "/assets/npc_void.png" },
                        rpg: { finalLabel: title }
                    },
                    value: 99,
                    claimed: false,
                    hint: "Rank SSS Required to Contest"
                };
            }
        }
        
        res.json(lords);
    } catch (error) {
        console.error('Failed to fetch territory lords:', error);
        res.status(500).json({ message: 'Server error during territory sync.' });
    }
};


// --- TACTICAL SHOP LOGIC ---

const SHOP_CATALOG = {
    'theme_midnight': { id: 'theme_midnight', name: 'Midnight Protocol', category: 'theme', themeId: 'midnight', price: 500, description: 'High-contrast nocturnal interface for elite operators.' },
    'theme_forest': { id: 'theme_forest', name: 'Forest Protocol', category: 'theme', themeId: 'forest', price: 500, description: 'Organic verdant aesthetics for focused growth.' },
    'theme_rose': { id: 'theme_rose', name: 'Rose Protocol', category: 'theme', themeId: 'rose', price: 500, description: 'Vibrant frequency for high-velocity activity.' },
    'theme_amber': { id: 'theme_amber', name: 'Amber Protocol', category: 'theme', themeId: 'amber', price: 500, description: 'Warm industrial glow for deep engineering sessions.' },
    'booster_xp_2x': { id: 'booster_xp_2x', name: 'Metabolic Override (2x XP)', category: 'booster', price: 1000, duration: 86400000, description: 'Double experience gain from all tactical syncs for 24 hours.' }
};

// @route   POST /api/rpg/purchase
// @desc    Acquire tactical assets or themes
// @access  Private
export const purchaseItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const item = SHOP_CATALOG[itemId];

        if (!item) return res.status(404).json({ message: 'Item Not Found in Tactical Database' });

        const user = await User.findById(req.user._id);

        if (user.rpg.prodCoins < item.price) {
            return res.status(400).json({ message: 'Insufficient Capital for Acquisition.' });
        }

        // Initialize inventory if missing (safety check for legacy users)
        if (!user.rpg.inventory) {
            user.rpg.inventory = { themes: ['classic'], items: [] };
        }

        // Check if theme is already owned
        if (item.category === 'theme' && user.rpg.inventory.themes.includes(item.themeId)) {
            return res.status(400).json({ message: 'Frequency Already Synchronized (Owned).' });
        }

        // Deduct Capital
        user.rpg.prodCoins -= item.price;

        // Process Acquisition
        if (item.category === 'theme') {
            user.rpg.inventory.themes.push(item.themeId);
        } else {
            user.rpg.inventory.items.push({
                itemId: item.id,
                name: item.name,
                category: item.category,
                purchasedAt: new Date(),
                expiresAt: item.duration ? new Date(Date.now() + item.duration) : null
            });
        }

        user.markModified('rpg');
        await user.save();

        res.json({
            message: `${item.name.toUpperCase()} ACQUIRED.`,
            prodCoins: user.rpg.prodCoins,
            inventory: user.rpg.inventory,
            user: {
                guardianLevel: user.guardianLevel || 0,
                guardianExp: user.guardianExp || 0,
                rpg: user.rpg
            }
        });

    } catch (error) {
        console.error('Acquisition failure:', error);
        res.status(500).json({ message: 'Operational failure during acquisition sequence.' });
    }
};

// @route   POST /api/rpg/claim-daily
// @desc    Claim daily bounty reward
// @access  Private
export const claimDailyReward = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const today = new Date().toISOString().split('T')[0];

        if (!user.rpg.dailyReward) {
            user.rpg.dailyReward = { lastClaimed: null, claimsCount: 0 };
        }

        if (user.rpg.dailyReward.lastClaimed === today) {
            return res.status(400).json({ message: 'Daily bounty already claimed for today.' });
        }

        // Increment claims count
        const oldClaimsCount = user.rpg.dailyReward.claimsCount || 0;
        const newClaimsCount = oldClaimsCount + 1;
        user.rpg.dailyReward.claimsCount = newClaimsCount;

        // Calculate cycle day for the claim (ranges 1 to 7)
        const currentWeeklyDay = ((newClaimsCount - 1) % 7) + 1;

        let points = 50;
        let rewardsList = ["+50 ProdPoints Granted"];

        if (currentWeeklyDay === 2 || currentWeeklyDay === 3) {
            points = 100;
            rewardsList = [`+${points} ProdPoints Granted`];
        } else if (currentWeeklyDay === 4) {
            points = 150;
            rewardsList = [`+${points} ProdPoints Granted`];
        } else if (currentWeeklyDay === 5) {
            points = 200;
            rewardsList = [`+${points} ProdPoints Granted`];
        } else if (currentWeeklyDay === 6) {
            points = 250;
            rewardsList = [`+${points} ProdPoints Granted`];
        } else if (currentWeeklyDay === 7) {
            points = 500;
            rewardsList = [`+${points} ProdPoints Granted`, "ECLIPSE Avatar Frame Unlocked"];
        }

        // Award points
        user.rpg.prodCoins = (user.rpg.prodCoins || 0) + points;

        // Set last claimed date
        user.rpg.dailyReward.lastClaimed = today;

        // Award XP (if enabled, will be 0 according to user settings)
        await awardXP(user, 'luk', 100);

        // Record activity log
        await Activity.create({
            user: user._id,
            type: 'system',
            action: `Claimed Day ${currentWeeklyDay} Daily Bounty reward`,
            stat: 'none',
            amount: points,
            metadata: { unit: 'ProdPoints' }
        });

        user.markModified('rpg');
        await user.save();

        res.json({
            title: `DAY ${currentWeeklyDay} DAILY BOUNTY CLASSIFIED`,
            subtitle: "SYSTEM REWARD UNLOCKED",
            icon: "stars",
            rewards: rewardsList,
            prodCoins: user.rpg.prodCoins,
            rpg: user.rpg
        });
    } catch (error) {
        console.error('Daily claim failed:', error);
        res.status(500).json({ message: 'Server error during daily bounty claim.' });
    }
};

// @route   POST /api/rpg/claim-streak
// @desc    Claim streak reward milestone
// @access  Private
export const claimStreakReward = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const today = new Date().toISOString().split('T')[0];

        if (!user.rpg.streakReward) {
            user.rpg.streakReward = { lastClaimed: null };
        }

        if (user.rpg.streakReward.lastClaimed === today) {
            return res.status(400).json({ message: 'Streak reward already claimed for today.' });
        }

        const currentStreak = user.rpg.loginStreak || 1;
        let points = 0;
        let xpReward = 0;
        let title = "";
        let subtitle = "";
        let icon = "";
        let rewards = [];
        let actionDescription = "";

        if (currentStreak >= 365) {
            points = 1000;
            xpReward = 500;
            title = "365-DAY CHRONO MILESTONE";
            subtitle = "EPIC LEGEND REWARD";
            icon = "military_tech";
            rewards = ["+1,000 ProdPoints Granted", "ECLIPSE Avatar Frame Unlocked"];
            actionDescription = "Claimed Epic 365-Day Chrono Matrix";
        } else {
            const day = Math.min(currentStreak, 364);
            points = 10 + day * 5;
            xpReward = day % 7 === 0 ? day * 10 : 0;
            let desc = `+${points} ProdPoints Granted`;

            if (day % 7 === 0) {
                points = day * 15;
                desc = `+${points} Points & +${day * 10} Guardian EXP Granted`;
            } else if (day % 30 === 0) {
                points = day * 20;
                desc = `+${points} Points & Premium Buff Granted`;
            }

            title = `DAY ${currentStreak} STREAK CLAIMED`;
            subtitle = "CHRONO MILESTONE SECURED";
            icon = "local_fire_department";
            rewards = [desc];
            actionDescription = `Claimed Day ${currentStreak} Streak milestone`;
        }

        // Award points (prodCoins)
        user.rpg.prodCoins = (user.rpg.prodCoins || 0) + points;

        // Set last claimed date
        user.rpg.streakReward = { lastClaimed: today };

        // Award XP (if enabled, will be 0 according to user settings)
        if (xpReward > 0) {
            await awardXP(user, 'luk', xpReward);
        }

        // Record activity log
        await Activity.create({
            user: user._id,
            type: 'system',
            action: actionDescription,
            stat: 'none',
            amount: points,
            metadata: { unit: 'ProdPoints' }
        });

        user.markModified('rpg');
        await user.save();

        res.json({
            title,
            subtitle,
            icon,
            rewards,
            prodCoins: user.rpg.prodCoins,
            rpg: user.rpg
        });
    } catch (error) {
        console.error('Streak claim failed:', error);
        res.status(500).json({ message: 'Server error during streak reward claim.' });
    }
};

// ─── Hero Endpoints ─────────────────────────────────────────────────────────

// @route   GET /api/rpg/hero
// @desc    Get the current user's hero data
// @access  Private
export const getHero = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('hero guardianLevel');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ hero: user.hero || {}, guardianLevel: user.guardianLevel || 0 });
    } catch (error) {
        console.error('Failed to fetch hero:', error);
        res.status(500).json({ message: 'Server error fetching hero data.' });
    }
};


export const awardHeroExpController = async (req, res) => {
    try {
        const { amount, coins } = req.body;
        if ((!amount || amount <= 0) && (!coins || coins <= 0)) {
            return res.status(400).json({ message: 'Must award positive exp or coins.' });
        }

        const { addGuardianExp } = await import('../utils/levelUtils.js');
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let result = { user, levelUp: false };
        if (amount && amount > 0) {
            const expResult = await addGuardianExp(req.user._id, amount);
            if (expResult) {
                result = expResult;
            }
        }

        if (coins && coins > 0) {
            result.user.rpg.prodCoins = (result.user.rpg.prodCoins || 0) + coins;
            result.user.markModified('rpg');
            await result.user.save();
        }

        res.json({
            hero: result.user.hero,
            guardianExp: result.user.guardianExp,
            guardianLevel: result.user.guardianLevel,
            levelUp: result.levelUp,
            rpg: result.user.rpg
        });
    } catch (error) {
        console.error('Failed to award Guardian EXP/Coins:', error);
        res.status(500).json({ message: 'Server error awarding Guardian EXP/Coins.' });
    }
};

export const waterTree = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const pointsNeeded = 10;
        if ((user.rpg.linkPoints || 0) < pointsNeeded) {
            return res.status(400).json({ message: 'Insufficient Link Points to afford water.' });
        }

        user.rpg.linkPoints = (user.rpg.linkPoints || 0) - pointsNeeded;
        
        let currentWater = (user.rpg.linkTree?.water || 0) + 20;
        let currentStage = user.rpg.linkTree?.stage || 0;
        let currentPointsSpent = (user.rpg.linkTree?.pointsSpent || 0) + pointsNeeded;

        if (currentWater >= 100) {
            if (currentStage < 5) {
                currentStage += 1;
                currentWater = 0;
            } else {
                currentWater = 100;
            }
        }

        user.rpg.linkTree = {
            stage: currentStage,
            water: currentWater,
            pointsSpent: currentPointsSpent
        };
        user.markModified('rpg');
        await user.save();

        if (user.partner) {
            const partner = await User.findById(user.partner);
            if (partner) {
                partner.rpg.linkPoints = Math.max(0, (partner.rpg.linkPoints || 0) - pointsNeeded);
                partner.rpg.linkTree = {
                    stage: currentStage,
                    water: currentWater,
                    pointsSpent: (partner.rpg.linkTree?.pointsSpent || 0) + pointsNeeded
                };
                partner.markModified('rpg');
                await partner.save();
            }
        }

        res.json({
            message: 'Tree watered successfully.',
            rpg: user.rpg
        });
    } catch (error) {
        console.error('Failed to water tree:', error);
        res.status(500).json({ message: 'Server error during watering sequence.' });
    }
};

export const setLinkMessage = async (req, res) => {
    try {
        const { text } = req.body;
        if (typeof text !== 'string') {
            return res.status(400).json({ message: 'Message text must be a string.' });
        }
        if (text.length > 200) {
            return res.status(400).json({ message: 'Message text cannot exceed 200 characters.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.rpg.linkMessage = {
            text: text.trim(),
            updatedAt: new Date()
        };
        user.markModified('rpg');
        await user.save();

        res.json({
            message: 'Link message updated successfully.',
            rpg: user.rpg
        });
    } catch (error) {
        console.error('Failed to set link message:', error);
        res.status(500).json({ message: 'Server error setting link message.' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.partner) {
            return res.status(400).json({ message: 'No partner linked' });
        }

        // Mark incoming messages as read
        await Message.updateMany(
            { sender: user.partner, recipient: user._id, read: false },
            { $set: { read: true } }
        );

        const messages = await Message.find({
            $or: [
                { sender: user._id, recipient: user.partner },
                { sender: user.partner, recipient: user._id }
            ]
        }).sort({ createdAt: 1 }).limit(50);

        res.json(messages);
    } catch (error) {
        console.error('Failed to get messages:', error);
        res.status(500).json({ message: 'Server error fetching messages.' });
    }
};

export const getUnreadMessageCount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.partner) {
            return res.json({ count: 0 });
        }

        const count = await Message.countDocuments({
            sender: user.partner,
            recipient: user._id,
            read: false
        });

        res.json({ count });
    } catch (error) {
        console.error('Failed to get unread message count:', error);
        res.status(500).json({ message: 'Server error getting unread message count.' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Message text is required.' });
        }

        const user = await User.findById(req.user._id);
        if (!user || !user.partner) {
            return res.status(400).json({ message: 'No partner linked' });
        }

        const message = await Message.create({
            sender: user._id,
            recipient: user.partner,
            text: text.trim(),
            read: false
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ message: 'Server error sending message.' });
    }
};


