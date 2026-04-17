import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';
import { calculateScores, calculateMasteryRank } from '../shared/assessment.js'; 
import NarrativeQuestion from '../models/NarrativeQuestion.js';

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
        await user.save();

        res.json({
            message: 'Daily reflection synchronized.',
            xpAwarded: result.xpAwarded,
            leveledUp: result.leveledUp,
            stats: user.rpg.stats,
            level: user.level,
            exp: user.exp
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

        if (user.level > 0) {
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
                user.rpg.levelReachedSSS = user.level;
            }
        }

        // 7. Handle Initial Awakening (Handled via Handshake now)
        // Level 1 transformation and Path assignment are triggered by the NEURAL_HANDSHAKE ceremony.

        user.markModified('rpg');
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
            level: user.level,
            exp: user.exp,
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

        if (user.level !== 0) {
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
                level: user.level,
                exp: user.exp,
                rpg: user.rpg
            }
        });

    } catch (error) {
        console.error('Acquisition failure:', error);
        res.status(500).json({ message: 'Operational failure during acquisition sequence.' });
    }
};
