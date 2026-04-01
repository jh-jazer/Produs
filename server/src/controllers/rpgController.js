import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { awardXP } from '../utils/rpgUtils.js';
import { calculateScores, calculateMasteryRank } from '../shared/assessment.js'; 

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
import { ARCHETYPE_QUIZ, calculateScores, calculateMasteryRank } from '../shared/assessment.js'; 

// @route   POST /api/rpg/sync-neural
// @desc    Synchronize a level-unlocked neural question
// @access  Private
export const syncNeural = async (req, res) => {
    try {
        const { questionId, value } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.rpg.pendingQuestions.includes(questionId)) {
            return res.status(400).json({ message: 'Synchronization sequence invalid or already complete.' });
        }

        // --- SECURITY VALIDATION ---
        const questionRef = ARCHETYPE_QUIZ.find(q => q.id === questionId);
        if (!questionRef) {
            return res.status(404).json({ message: 'Neural question reference not found.' });
        }

        const isValidOption = questionRef.options.some(opt => opt.value === value);
        if (!isValidOption) {
            return res.status(403).json({ message: 'Neural synchronization failed: Invalid value signature.' });
        }
        // ---------------------------

        // 1. Persist the answer
        user.rpg.completedAnswers.push({ id: questionId, value, timestamp: new Date() });
        
        // 2. Remove from pending queue
        user.rpg.pendingQuestions = user.rpg.pendingQuestions.filter(id => id !== questionId);
        
        // 3. Recalculate profiling results
        const results = calculateScores(user.rpg.completedAnswers);
        
        // 4. Update Identity Slices
        user.rpg.path = results.path;
        user.rpg.tier1 = results.tier1;
        user.rpg.style = results.style;
        user.rpg.alignment = results.alignment;
        user.rpg.styleLabel = results.styleLabel;
        user.rpg.finalLabel = results.finalLabel || results.styleLabel || results.tier1 || results.path;
        
        // 5. Handle Mastery & Ranks
        const oldRank = user.rpg.specialistRank;
        user.rpg.masteryPoints = results.masteryPoints;
        const newRank = calculateMasteryRank(user.rpg.masteryPoints);
        user.rpg.specialistRank = newRank;

        // 6. Record Speed Records (SSS)
        if (newRank === 'SSS' && !user.rpg.levelReachedSSS) {
            user.rpg.levelReachedSSS = user.level;
        }

        user.markModified('rpg');
        await user.save();

        res.json({
            ...user.rpg.toObject(),
            newRank: oldRank !== newRank ? newRank : null,
            message: 'Neural synapse stabilized.'
        });

    } catch (error) {
        console.error('Neural sync failed:', error);
        res.status(500).json({ message: 'Server error during neural synchronization.' });
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
