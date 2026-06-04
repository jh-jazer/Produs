import crypto from 'crypto';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import Journal from '../models/Journal.js';
import Task from '../models/Task.js';
import Wishlist from '../models/Wishlist.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import Budget from '../models/Budget.js';
import Debt from '../models/Debt.js';
import Goal from '../models/Goal.js';
import Saving from '../models/Saving.js';
import Transaction from '../models/Transaction.js';
import HealthLog from '../models/HealthLog.js';
import Joi from 'joi';
import mongoose from 'mongoose';
import generateToken from '../utils/generateToken.js';
import { calculateLevel, awardXP, determineArchetype, checkNeuralSync, syncUserEnergy } from '../utils/rpgUtils.js';
import { calculateScores, ARCHETYPE_PROTOCOLS } from '../shared/assessment.js';
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

import { initializeSystemHabits } from '../utils/habitUtils.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            // Initialize mandatory system habits
            await initializeSystemHabits(user._id);

            const levelInfo = calculateLevel(user.guardianExp || 0);
            syncUserEnergy(user);
            await user.save();

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                onboardingCompleted: user.onboardingCompleted,
                timezone: user.timezone,
                currency: user.currency,
                settings: user.settings,
                // Guardian (normal-mode user progression)
                guardianLevel: user.guardianLevel || 0,
                guardianExp: user.guardianExp || 0,
                totalRequired: levelInfo.totalRequired,
                nextLevelExp: levelInfo.xpToNext,
                // Hero (RPG fictional character)
                hero: user.hero,
                rpg: user.rpg,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Ensure core habits exist (Handles migration for existing users)
            await initializeSystemHabits(user._id);

            // Record login and compute streak
            const todayStr = new Date().toISOString().split('T')[0];
            if (!user.rpg.loginDates) {
                user.rpg.loginDates = [];
            }
            if (!user.rpg.loginDates.includes(todayStr)) {
                user.rpg.loginDates.push(todayStr);
                user.rpg.loginDates.sort((a, b) => b.localeCompare(a));
                
                // Calculate streak
                let streak = 0;
                let checkDate = new Date();
                while (true) {
                    const dateStr = checkDate.toISOString().split('T')[0];
                    if (user.rpg.loginDates.includes(dateStr)) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                }
                user.rpg.loginStreak = streak;
                user.markModified('rpg.loginDates');
                user.markModified('rpg.loginStreak');
            }

            const levelInfo = calculateLevel(user.guardianExp || 0);
            syncUserEnergy(user);
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                onboardingCompleted: user.onboardingCompleted,
                timezone: user.timezone,
                currency: user.currency,
                settings: user.settings,
                // Guardian
                guardianLevel: user.guardianLevel || 0,
                guardianExp: user.guardianExp || 0,
                totalRequired: levelInfo.totalRequired,
                nextLevelExp: levelInfo.xpToNext,
                // Hero
                hero: user.hero,
                rpg: user.rpg,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get link partner information
// @route   GET /api/auth/partner
// @access  Private
export const getPartner = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('partner');
        if (!user || !user.partner) {
            return res.json(null);
        }

        const partner = user.partner;
        
        // Fetch partner's habits for today to show status
        const Habit = mongoose.model('Habit');
        const habits = await Habit.find({ user: partner._id });
        const today = new Date().toISOString().split('T')[0];
        
        const completedToday = habits.filter(h => 
            h.checks?.some(c => c.date === today && c.completed)
        ).length;

        res.json({
            _id: partner._id,
            name: partner.name,
            username: partner.username,
            avatar: partner.avatar,
            level: partner.level,
            rpg: partner.rpg,
            stats: partner.rpg.stats,
            habitsCount: habits.length,
            completedToday,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('partner', 'name username email avatar')
            .populate('outgoingPartnerRequest', 'name username email avatar')
            .populate('incomingPartnerRequest', 'name username email avatar');
        
        if (user) {
            // Auto-clean dangling partner/request refs (populate returns null for deleted users)
            let needsSave = false;
            if (user.partner === null && user._doc.partner) {
                // partner ObjectId exists but populated to null (user was deleted)
                user.partner = null;
                needsSave = true;
            }
            if (user.outgoingPartnerRequest === null && user._doc.outgoingPartnerRequest) {
                user.outgoingPartnerRequest = null;
                needsSave = true;
            }
            if (user.incomingPartnerRequest === null && user._doc.incomingPartnerRequest) {
                user.incomingPartnerRequest = null;
                needsSave = true;
            }

            // Record login and compute streak
            const todayStr = new Date().toISOString().split('T')[0];
            if (!user.rpg.loginDates) {
                user.rpg.loginDates = [];
            }
            if (!user.rpg.loginDates.includes(todayStr)) {
                user.rpg.loginDates.push(todayStr);
                user.rpg.loginDates.sort((a, b) => b.localeCompare(a));
                user.markModified('rpg.loginDates');
            }
            
            // Calculate streak
            let streak = 0;
            let checkDate = new Date();
            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (user.rpg.loginDates.includes(dateStr)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
            user.rpg.loginStreak = streak;
            user.markModified('rpg.loginStreak');

            const levelInfo = calculateLevel(user.guardianExp || 0);
            syncUserEnergy(user);
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                username: user.username,
                bio: user.bio,
                banner: user.banner,
                onboardingCompleted: user.onboardingCompleted,
                timezone: user.timezone,
                currency: user.currency,
                settings: user.settings,
                partner: user.partner,
                outgoingPartnerRequest: user.outgoingPartnerRequest,
                incomingPartnerRequest: user.incomingPartnerRequest,
                // Guardian
                guardianLevel: user.guardianLevel || 0,
                guardianExp: user.guardianExp || 0,
                totalRequired: levelInfo.totalRequired,
                nextLevelExp: levelInfo.xpToNext,
                // Hero
                hero: user.hero,
                rpg: user.rpg,
                connections: user.connections || [],
                outgoingConnectionRequests: user.outgoingConnectionRequests || [],
                incomingConnectionRequests: user.incomingConnectionRequests || []
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all connections and requests for the user
// @route   GET /api/auth/connections
// @access  Private
export const getConnections = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('connections', 'name username email avatar bio settings partner')
            .populate('incomingConnectionRequests', 'name username avatar bio settings')
            .populate('outgoingConnectionRequests', 'name username avatar bio settings');
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Auto-clean: filter out null entries (deleted users whose refs remain)
        const validConnections = (user.connections || []).filter(c => c != null);
        const validIncoming = (user.incomingConnectionRequests || []).filter(c => c != null);
        const validOutgoing = (user.outgoingConnectionRequests || []).filter(c => c != null);

        // If any were cleaned, persist the fix
        if (validConnections.length !== (user.connections || []).length ||
            validIncoming.length !== (user.incomingConnectionRequests || []).length ||
            validOutgoing.length !== (user.outgoingConnectionRequests || []).length) {
            user.connections = validConnections.map(c => c._id);
            user.incomingConnectionRequests = validIncoming.map(c => c._id);
            user.outgoingConnectionRequests = validOutgoing.map(c => c._id);
            await user.save();
        }

        res.json({
            connections: validConnections,
            incoming: validIncoming,
            outgoing: validOutgoing
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a connection request to a user
// @route   POST /api/auth/connection/request/:id
// @access  Private
export const sendConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const senderId = req.user.id;

        if (targetUserId === senderId) {
            return res.status(400).json({ message: "Cannot connect with yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const sender = await User.findById(senderId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already connected
        if (sender.connections.includes(targetUserId)) {
            return res.status(400).json({ message: "Already connected" });
        }

        // Check if request already exists
        if (sender.outgoingConnectionRequests.includes(targetUserId)) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Add to request arrays
        await User.findByIdAndUpdate(senderId, { $addToSet: { outgoingConnectionRequests: targetUserId }});
        await User.findByIdAndUpdate(targetUserId, { $addToSet: { incomingConnectionRequests: senderId }});

        // Notify the target user
        await Notification.create({
            user: targetUserId,
            text: `${sender.name} sent you a connection request.`,
            type: 'connection',
            icon: 'person_add',
            color: 'text-primary',
        });

        res.json({ message: "Connection request sent!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept a connection request
// @route   POST /api/auth/connection/accept/:id
// @access  Private
export const acceptConnectionRequest = async (req, res) => {
    try {
        const requesterId = req.params.id;
        const accepterId = req.user.id;

        const accepter = await User.findById(accepterId);
        if (!accepter.incomingConnectionRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No request found from this user" });
        }

        // Move from requests to connections for both users
        await User.findByIdAndUpdate(accepterId, {
            $pull: { incomingConnectionRequests: requesterId },
            $addToSet: { connections: requesterId }
        });

        await User.findByIdAndUpdate(requesterId, {
            $pull: { outgoingConnectionRequests: accepterId },
            $addToSet: { connections: accepterId }
        });

        // Notify the original requester that their request was accepted
        await Notification.create({
            user: requesterId,
            text: `${accepter.name} accepted your connection request.`,
            type: 'connection',
            icon: 'handshake',
            color: 'text-primary',
        });

        res.json({ message: "Connection accepted!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a connection request
// @route   POST /api/auth/connection/reject/:id
// @access  Private
export const rejectConnectionRequest = async (req, res) => {
    try {
        const requesterId = req.params.id;
        const rejecterId = req.user.id;

        await User.findByIdAndUpdate(rejecterId, { $pull: { incomingConnectionRequests: requesterId }});
        await User.findByIdAndUpdate(requesterId, { $pull: { outgoingConnectionRequests: rejecterId }});

        res.json({ message: "Connection rejected" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel an outgoing connection request
// @route   POST /api/auth/connection/cancel/:id
// @access  Private
export const cancelConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const senderId = req.user.id;

        await User.findByIdAndUpdate(senderId, { $pull: { outgoingConnectionRequests: targetUserId }});
        await User.findByIdAndUpdate(targetUserId, { $pull: { incomingConnectionRequests: senderId }});

        res.json({ message: "Request canceled" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Disconnect from a user
// @route   POST /api/auth/connection/disconnect/:id
// @access  Private
export const disconnectConnection = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const requesterId = req.user.id;

        await User.findByIdAndUpdate(requesterId, { $pull: { connections: targetUserId }});
        await User.findByIdAndUpdate(targetUserId, { $pull: { connections: requesterId }});

        res.json({ message: "Disconnected successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search public users by name or username
// @route   GET /api/auth/search?q=query
// @access  Private
export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            return res.json([]);
        }

        const isIdSearch = mongoose.isValidObjectId(query);
        
        // Match by Name, Username OR ID
        // Simplified query: Find any user that matches query string OR exact ID, excluding the searcher
        const searchQuery = {
            _id: { $ne: req.user.id },
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ]
        };

        if (isIdSearch) {
            searchQuery.$or.push({ _id: query });
        }

        const users = await User.find(searchQuery)
            .select('name username avatar bio settings')
            .limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public profile by username or id
// @route   GET /api/auth/profile/:identifier
// @access  Public
export const getPublicProfile = async (req, res) => {
    try {
        const param = req.params.username;
        const query = mongoose.isValidObjectId(param)
            ? { $or: [{ username: param }, { _id: param }] }
            : { username: param };

        const user = await User.findOne(query).populate('partner', 'name username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch top habits
        const habits = await Habit.find({ user: user._id });
        const topHabits = habits.sort((a, b) => b.streak - a.streak).slice(0, 3);

        // Check Relationship (Optional Protect)
        const isPartner = req.user && (user.partner?.toString() === req.user._id.toString() || req.user.partner?.toString() === user._id.toString());
        
        // Full Details for Partner
        let partnerData = {};
        if (isPartner) {
            // All Habits
            const allHabits = habits; // We already fetched all
            
            // Today's Tasks
            const today = new Date();
            today.setHours(0,0,0,0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const tasks = await Task.find({
                user: user._id,
                date: { $gte: today, $lt: tomorrow }
            }).sort({ priority: -1, order: 1 });
            
            // Wishlist
            const wishlist = await Wishlist.find({ user: user._id }).sort({ createdAt: -1 });
            
            partnerData = {
                allHabits,
                tasks,
                wishlist,
                isShared: true
            };
        }

        // Fetch System Streaks
        const systemHabits = await Habit.find({ user: user._id, systemId: { $in: ['journal', 'finance', 'planner', 'workout', 'focus'] } });
        const systemStreaks = {
            journal: systemHabits.find(h => h.systemId === 'journal')?.streak || 0,
            finance: systemHabits.find(h => h.systemId === 'finance')?.streak || 0,
            planner: systemHabits.find(h => h.systemId === 'planner')?.streak || 0,
            workout: systemHabits.find(h => h.systemId === 'workout')?.streak || 0,
            focus: systemHabits.find(h => h.systemId === 'focus')?.streak || 0
        };

        // Achievements (Joined Challenges)
        const achievementCount = user.joinedChallenges?.length || 0;

        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            banner: user.banner,
            bio: user.bio,
            joined: user.createdAt,
            connections: (user.connections || []).filter(id => id != null),
            partner: user.partner,
            topHabits,
            systemStreaks,
            achievementCount,
            level: user.level,
            exp: user.exp,
            rpg: user.rpg,
            ...partnerData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google auth callback success
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = async (req, res) => {
    // Passport will attach the authenticated user to req.user
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!req.user) {
        return res.redirect(`${clientUrl}/auth?error=auth_failed`);
    }

    const token = generateToken(req.user._id);

    // Redirect to frontend with token in the URL params
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
};

// @desc    Complete onboarding
// @route   PUT /api/auth/onboarding
// @access  Private
export const completeOnboarding = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
        if (req.body.username) {
                const base = req.body.username.toLowerCase().trim();
                if (base.length < 3 || base.length > 8) {
                    return res.status(400).json({ message: 'Username must be 3–8 characters long' });
                }

                // Append a unique 4-digit numeric ID to guarantee uniqueness
                let finalUsername;
                let attempts = 0;
                do {
                    const suffix = crypto.randomInt(1000, 10000);
                    finalUsername = `${base}#${suffix}`;
                    const taken = await User.findOne({ username: finalUsername });
                    if (!taken || taken.id === user.id) break;
                    attempts++;
                } while (attempts < 20);

                user.username = finalUsername;
                user.name = finalUsername;
            }

            if (req.body.gender) {
                user.gender = req.body.gender;
            }

            user.onboardingCompleted = true;
            user.timezone = req.body.timezone || user.timezone;
            user.currency = req.body.currency || user.currency;
            user.interests = req.body.interests || [];

            if (req.body.themeMode) {
                user.settings.themeMode = req.body.themeMode;
                user.settings.darkMode = req.body.themeMode === "dark";
            }
            
            if (Array.isArray(req.body.subscriptions) && req.body.subscriptions.length > 0) {
                user.settings.subscriptions = req.body.subscriptions;
            } else if (req.body.subscription) {
                // Legacy single-subscription fallback
                user.settings.subscriptions = [req.body.subscription];
            }
                user.markModified('settings');
            
            if (req.body.archetype) {
                user.rpg.archetype.name = req.body.archetype;
                user.markModified('rpg.archetype');
            }

            if (req.body.subscriptions && Array.isArray(req.body.subscriptions)) {
                user.settings.subscriptions = req.body.subscriptions;
                user.markModified('settings.subscriptions');
            }

            if (req.body.perk) {
                user.rpg.perk = req.body.perk;
            }

            if (req.body.statMultipliers) {
                user.rpg.statMultipliers = req.body.statMultipliers;
            }

            // Handle RPG Initial Stat Profile (Awakening)
            if (req.body.initialStats && typeof req.body.initialStats === 'object') {
                user.rpg.stats = req.body.initialStats;
                
                // Finalize the initial 'Awakened' archetype
                const archetypeInfo = determineArchetype(user, user.level);
                user.rpg.archetype = archetypeInfo;
                user.markModified('rpg');
            } else if (req.body.statsToBoost && typeof req.body.statsToBoost === 'object') {
                // Legacy fallback for old-style onboarding
                for (const [stat, points] of Object.entries(req.body.statsToBoost)) {
                    if (points > 0) {
                        user.rpg.stats[stat] += (points * 5);
                    }
                }
                const archetypeInfo = determineArchetype(user, user.level);
                user.rpg.archetype = archetypeInfo;
                user.markModified('rpg');
            }

            await user.save();

            const levelInfo = calculateLevel(user.guardianExp || 0);
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                username: user.username,
                onboardingCompleted: user.onboardingCompleted,
                timezone: user.timezone,
                currency: user.currency,
                settings: user.settings,
                // Guardian
                guardianLevel: user.guardianLevel || 0,
                guardianExp: user.guardianExp || 0,
                totalRequired: levelInfo.totalRequired,
                nextLevelExp: levelInfo.xpToNext,
                // Hero
                hero: user.hero,
                rpg: user.rpg,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Awaken user from Shut-in status
// @route   POST /api/auth/awaken
// @access  Private
export const awakenUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.level !== 0) {
            return res.status(400).json({ message: 'User is already awakened' });
        }

        const { result } = req.body;
        if (!result) return res.status(400).json({ message: 'Assessment result required' });

        // Update Stats and Profile (Temporary storage in rpg.assessmentResults)
        user.rpg.assessmentResults = result;
        
        // Store the raw answers for finalizeAwakening to process
        if (req.body.answers) {
            user.rpg.completedAnswers = req.body.answers;
        }
        
        user.markModified('rpg');
        await user.save();

        res.json({
            message: 'Assessment results archived. Pending NEURAL_HANDSHAKE.',
            rpg: user.rpg
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const finalizeAwakening = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.hero.level !== 0) {
            return res.status(400).json({ message: 'User is already awakened' });
        }

        // Calculate final results from complete history
        const results = calculateScores(user.rpg.completedAnswers);
        
        // Finalize Stats and Profile
        user.rpg.stats = results.stats;
        user.rpg.path = results.path;
        user.rpg.tier1 = results.tier1;
        user.rpg.style = results.style;
        user.rpg.alignment = results.alignment;
        user.rpg.finalLabel = results.finalLabel;
        

        // Finalize Archetype Identity
        user.rpg.archetype = {
            name: results.finalLabel || results.path || 'Initiate',
            tier: 1,
            stage: results.tier1 || 'Awakened'
        };

        // Assign Perk and Multipliers from Protocol
        const protocol = ARCHETYPE_PROTOCOLS[results.path];
        if (protocol) {
            user.rpg.perk = protocol.perk;
            user.rpg.statMultipliers = protocol.multipliers;
        }

        // Clear assessment buffer
        user.rpg.assessmentResults = undefined;
        user.rpg.pendingQuestions = []; // Ensure all questions are cleared
        
        // Trigger immediate unlock of Level 1 Node (16.0)
        checkNeuralSync(user, user.guardianLevel, 0);

        // Auto-assign Hero identity from the archetype determined by neural sync
        // and grant Level 1 to Hero to mark them as awakened.
        const heroName = results.finalLabel || results.tier1 || results.path || 'The Initiate';
        if (!user.hero) user.hero = { name: heroName, level: 1, exp: 100 };
        else {
            user.hero.name = heroName;
            user.hero.level = 1;
            user.hero.exp = 100;
        }
        user.markModified('hero');

        user.markModified('rpg');
        await user.save();

        const levelInfo = calculateLevel(user.guardianExp || 0);
        res.json({
            guardianLevel: user.guardianLevel || 0,
            guardianExp: user.guardianExp || 0,
            hero: user.hero,
            rpg: {
                ...user.rpg.toObject(),
                flavor: protocol?.flavor || ""
            },
            totalRequired: levelInfo.totalRequired,
            nextLevelExp: levelInfo.xpToNext,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if username is available
// @route   GET /api/auth/check-username?username=username
// @access  Private
export const checkUsername = async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        if (username.length < 3 || username.length > 8) {
            return res.status(400).json({ message: 'Username must be 3–8 characters long' });
        }

        // Check if ANY existing username starts with this base (collision check on base only)
        const user = await User.findOne({ username: { $regex: `^${username.toLowerCase()}#`, $options: 'i' } });
        // Base is available as long as there are fewer than 9000 combos taken — effectively always true.
        // We just confirm the base format is valid and not entirely blocked.
        res.json({ available: true, message: 'Username base is available' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update channel subscriptions only
// @route   PUT /api/auth/subscriptions
// @access  Private
export const updateSubscriptions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!Array.isArray(req.body.subscriptions)) {
            return res.status(400).json({ message: 'subscriptions must be an array' });
        }

        user.settings.subscriptions = req.body.subscriptions;
        if (req.body.themeMode) {
                    user.settings.darkMode = req.body.themeMode === "dark";
                }
                user.markModified('settings');
        await user.save();

        res.json({ subscriptions: user.settings.subscriptions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload Banner Image to Cloudinary
// @route   POST /api/auth/upload/banner
// @access  Private
export const uploadBannerImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        res.status(200).json({ url: req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadAvatarImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        res.status(200).json({ url: req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
export const updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            // Update top-level fields if provided
            const topLevelFields = ['currency', 'username', 'bio', 'banner', 'avatar', 'name'];
            topLevelFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    user[field] = req.body[field];
                }
            });

            // If updating username, handle suffix preservation and uniqueness
            if (req.body.username) {
                const newBase = req.body.username.toLowerCase().trim().split('#')[0];
                if (newBase.length < 3 || newBase.length > 8) {
                    return res.status(400).json({ message: 'Username base must be 3–8 characters long' });
                }

                const currentSuffix = user.username ? user.username.split('#')[1] : null;
                const suffix = currentSuffix || crypto.randomInt(1000, 10000).toString();
                let finalUsername = `${newBase}#${suffix}`;

                // Verify uniqueness
                const existingUser = await User.findOne({ username: finalUsername });
                if (existingUser && existingUser.id !== user.id) {
                    // If base#currentSuffix is taken, generate a new suffix
                    let attempts = 0;
                    do {
                        const newSuffix = crypto.randomInt(1000, 10000);
                        finalUsername = `${newBase}#${newSuffix}`;
                        const taken = await User.findOne({ username: finalUsername });
                        if (!taken || taken.id === user.id) break;
                        attempts++;
                    } while (attempts < 20);

                    if (attempts >= 20) {
                        return res.status(400).json({ message: 'Failed to generate a unique username. Try a different base.' });
                    }
                }
                user.username = finalUsername;
                user.name = finalUsername;
            }

            // Update settings - merge instead of overwrite to preserve sub-objects like sleepMode
            if (req.body) {
                Object.keys(req.body).forEach(key => {
                    // Only update if not a top-level field (handled above)
                    if (!topLevelFields.includes(key)) {
                        user.settings[key] = req.body[key];
                    }
                });
                if (req.body.themeMode) {
                    user.settings.darkMode = req.body.themeMode === "dark";
                }
                user.markModified('settings');
            }

            await user.save();
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user account
// @route   DELETE /api/auth/me
// @access  Private
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            await User.deleteOne({ _id: req.user.id });
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Find a user by email to link as partner
// @route   POST /api/auth/partner/link
// @access  Private
// @desc    Send a partner link request
// @route   POST /api/auth/partner/request
// @access  Private
export const sendPartnerRequest = async (req, res) => {
    try {
        const { email, userId } = req.body;

        if (!email && !userId) {
            return res.status(400).json({ message: 'Email or User ID is required to request a partner link' });
        }

        let partnerToRequest;
        if (userId) {
            partnerToRequest = await User.findById(userId);
        } else {
            const escapedEmail = email.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            partnerToRequest = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });
        }

        if (!partnerToRequest) {
            return res.status(404).json({ message: userId ? 'No user found with that ID' : 'No user found with that email' });
        }

        if (partnerToRequest._id.toString() === req.user.id.toString()) {
            return res.status(400).json({ message: 'You cannot link yourself as a partner' });
        }

        const currentUser = await User.findById(req.user.id);

        // Auto-clean dangling/non-mutual partner references
        if (currentUser.partner) {
            const existingPartner = await User.findById(currentUser.partner);
            if (!existingPartner || existingPartner.partner?.toString() !== currentUser._id.toString()) {
                // Partner was deleted or the link is one-sided — auto-fix
                currentUser.partner = null;
                await currentUser.save();
            } else {
                return res.status(400).json({ message: 'You already have a linked partner' });
            }
        }

        if (currentUser.outgoingPartnerRequest) {
            const reqTarget = await User.findById(currentUser.outgoingPartnerRequest);
            if (!reqTarget || !reqTarget.incomingPartnerRequest || reqTarget.incomingPartnerRequest.toString() !== currentUser._id.toString()) {
                // Outgoing request is stale — auto-fix
                currentUser.outgoingPartnerRequest = null;
                await currentUser.save();
            } else {
                return res.status(400).json({ message: 'You already have a pending outgoing request' });
            }
        }

        if (partnerToRequest.partner) {
            const theirPartner = await User.findById(partnerToRequest.partner);
            if (!theirPartner || theirPartner.partner?.toString() !== partnerToRequest._id.toString()) {
                // Their partner reference is dangling/one-sided — auto-fix
                partnerToRequest.partner = null;
                await partnerToRequest.save();
            } else {
                return res.status(400).json({ message: 'This user already has a linked partner' });
            }
        }

        // Set request fields
        currentUser.outgoingPartnerRequest = partnerToRequest._id;
        partnerToRequest.incomingPartnerRequest = currentUser._id;

        await currentUser.save();
        await partnerToRequest.save();

        // Notify the target user
        await Notification.create({
            user: partnerToRequest._id,
            text: `${currentUser.name} (@${currentUser.username}) sent you a partner link request.`,
            type: 'partner',
            icon: 'favorite',
            color: 'text-rose-500',
        });

        const updatedUser = await User.findById(req.user.id).populate('outgoingPartnerRequest', 'name username email avatar');

        res.json({ message: 'Partner request sent successfully', outgoingRequest: updatedUser.outgoingPartnerRequest });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept a partner link request
// @route   POST /api/auth/partner/accept
// @access  Private
export const acceptPartnerRequest = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser.incomingPartnerRequest) {
            return res.status(400).json({ message: 'No incoming partner request found' });
        }

        const requester = await User.findById(currentUser.incomingPartnerRequest);

        if (!requester) {
            currentUser.incomingPartnerRequest = null;
            await currentUser.save();
            return res.status(404).json({ message: 'Requester not found' });
        }

        // Establish mutual link and clear requests
        currentUser.partner = requester._id;
        currentUser.incomingPartnerRequest = null;

        requester.partner = currentUser._id;
        requester.outgoingPartnerRequest = null;

        // Auto-connect: If they are partners, they are definitely connected
        if (!currentUser.connections.includes(requester._id)) {
            currentUser.connections.push(requester._id);
        }
        if (!requester.connections.includes(currentUser._id)) {
            requester.connections.push(currentUser._id);
        }

        // Clean up connection requests if they exist
        currentUser.outgoingConnectionRequests = currentUser.outgoingConnectionRequests.filter(id => id.toString() !== requester._id.toString());
        currentUser.incomingConnectionRequests = currentUser.incomingConnectionRequests.filter(id => id.toString() !== requester._id.toString());
        requester.outgoingConnectionRequests = requester.outgoingConnectionRequests.filter(id => id.toString() !== currentUser._id.toString());
        requester.incomingConnectionRequests = requester.incomingConnectionRequests.filter(id => id.toString() !== currentUser._id.toString());

        await currentUser.save();
        await requester.save();

        // Notify the original requester that their partner request was accepted
        await Notification.create({
            user: requester._id,
            text: `${currentUser.name} (@${currentUser.username}) accepted your partner link request!`,
            type: 'partner',
            icon: 'favorite',
            color: 'text-rose-500',
        });

        const updatedUser = await User.findById(req.user.id).populate('partner', 'name username email avatar');

        res.json({ message: 'Partner link accepted', partner: updatedUser.partner });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a partner link request
// @route   POST /api/auth/partner/reject
// @access  Private
export const rejectPartnerRequest = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser.incomingPartnerRequest) {
            return res.status(400).json({ message: 'No incoming partner request found' });
        }

        const requester = await User.findById(currentUser.incomingPartnerRequest);

        if (requester) {
            requester.outgoingPartnerRequest = null;
            await requester.save();
        }

        currentUser.incomingPartnerRequest = null;
        await currentUser.save();

        if (requester) {
            // Notify the original requester that their partner request was declined
            await Notification.create({
                user: requester._id,
                text: `${currentUser.name} (@${currentUser.username}) declined your partner link request.`,
                type: 'partner',
                icon: 'heart_broken',
                color: 'text-rose-500',
            });
        }

        res.json({ message: 'Partner request rejected' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel an outgoing partner link request
// @route   POST /api/auth/partner/cancel
// @access  Private
export const cancelPartnerRequest = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser.outgoingPartnerRequest) {
            return res.status(400).json({ message: 'No outgoing partner request found' });
        }

        const recipient = await User.findById(currentUser.outgoingPartnerRequest);

        if (recipient) {
            recipient.incomingPartnerRequest = null;
            await recipient.save();
        }

        currentUser.outgoingPartnerRequest = null;
        await currentUser.save();

        res.json({ message: 'Partner request canceled' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unlink current partner
// @route   POST /api/auth/partner/unlink
// @access  Private
export const unlinkPartner = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser.partner) {
            return res.status(400).json({ message: 'You do not have a linked partner' });
        }

        const partnerUser = await User.findById(currentUser.partner);

        // Remove links mutually
        currentUser.partner = null;
        if (partnerUser) {
            partnerUser.partner = null;
            await partnerUser.save();
        }

        await currentUser.save();

        res.json({ message: 'Partner unlinked successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user evolution stats (RPG style)
// @route   GET /api/auth/stats
// @access  Private
export const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch all habits and tasks for categorization
        const habits = await Habit.find({ user: userId });
        const tasks = await Task.find({ user: userId, completed: true });
        const journalEntriesCount = await Journal.countDocuments({ user: userId });

        // Helper to calculate impact for specific categories
        const getHabitImpact = (categories) => {
            const filtered = habits.filter(h => categories.includes(h.category));
            const totalChecks = filtered.reduce((acc, h) => acc + (h.checks?.filter(c => c.completed).length || 0), 0);
            const totalStreak = filtered.reduce((acc, h) => acc + (h.streak || 0), 0);
            return totalChecks + (totalStreak * 2); // Streaks have more weight
        };

        // 💪 STR: Physical/Health
        const str = getHabitImpact(['STR']);
 
        // ⚡ AGI: Speed/Tasks
        const agi = getHabitImpact(['DEX']) + (tasks.length * 2);
 
        // 🔥 VIT: Consistency (Total Streaks across all habits)
        const totalStreaks = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
        const vit = totalStreaks * 10; // High weight for streaks
 
        // 🧠 INT: Knowledge + Journaling
        const journalWeight = journalEntriesCount * 5;
        const int = getHabitImpact(['INT']) + journalWeight;
 
        // 🌀 WIS: Reflection + Finance
        const wis = getHabitImpact(['WIS', 'PER']); // Include legacy PER for migration safety
 
        // ✨ LUK: Relationships + Accountability
        const sharedHabitsCount = habits.filter(h => h.isShared).length;
        const luk = getHabitImpact(['CHA']) + (sharedHabitsCount * 10);
 
        res.json({
            str,
            agi,
            vit,
            int,
            wis,
            luk,
            raw: {
                tasksCompleted: tasks.length,
                habitsCount: habits.length,
                journalEntries: journalEntriesCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    DevTools: RPG Debug Actions
// @route   POST /api/auth/dev/rpg-test
// @access  Private
export const devRPGTest = async (req, res) => {
    try {
        const { action } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Auto-reset daily limits for dev actions to ensure testing always works
        user.rpg.dailyXP.total = 0;
        user.rpg.dailyXP.byStat = { str: 0, agi: 0, vit: 0, int: 0, wis: 0, luk: 0 };
        user.markModified('rpg');

        switch (action) {
            case 'inspectPartners': {
                const allUsers = await User.find({}, 'name username email partner outgoingPartnerRequest incomingPartnerRequest');
                return res.json({
                    message: "Database user relationship dump",
                    users: allUsers
                });
            }
            case 'fixPartners': {
                const allDbUsers = await User.find({});
                const report = [];
                for (const u of allDbUsers) {
                    if (u.partner) {
                        const p = await User.findById(u.partner);
                        if (!p) {
                            u.partner = null;
                            await u.save();
                            report.push(`Cleared dangling partner for ${u.username} (partner user did not exist)`);
                        } else if (p.partner?.toString() !== u._id.toString()) {
                            u.partner = null;
                            await u.save();
                            report.push(`Cleared non-mutual partner for ${u.username} (pointed to ${p.username}, but ${p.username} points to ${p.partner})`);
                        }
                    }
                    if (u.outgoingPartnerRequest) {
                        const p = await User.findById(u.outgoingPartnerRequest);
                        if (!p) {
                            u.outgoingPartnerRequest = null;
                            await u.save();
                            report.push(`Cleared dangling outgoing request for ${u.username}`);
                        }
                    }
                    if (u.incomingPartnerRequest) {
                        const p = await User.findById(u.incomingPartnerRequest);
                        if (!p) {
                            u.incomingPartnerRequest = null;
                            await u.save();
                            report.push(`Cleared dangling incoming request for ${u.username}`);
                        }
                    }
                }
                return res.json({
                    message: "Partners fixed",
                    report
                });
            }
            case 'fixConnections': {
                const allConnUsers = await User.find({});
                const report = [];
                const allUserIds = new Set(allConnUsers.map(u => u._id.toString()));
                for (const u of allConnUsers) {
                    let changed = false;
                    // Clean connections
                    const validConns = (u.connections || []).filter(id => allUserIds.has(id.toString()));
                    if (validConns.length !== (u.connections || []).length) {
                        const removed = (u.connections || []).length - validConns.length;
                        u.connections = validConns;
                        changed = true;
                        report.push(`Removed ${removed} dangling connection(s) from ${u.username}`);
                    }
                    // Clean outgoing connection requests
                    const validOut = (u.outgoingConnectionRequests || []).filter(id => allUserIds.has(id.toString()));
                    if (validOut.length !== (u.outgoingConnectionRequests || []).length) {
                        u.outgoingConnectionRequests = validOut;
                        changed = true;
                        report.push(`Cleaned outgoing connection requests for ${u.username}`);
                    }
                    // Clean incoming connection requests
                    const validIn = (u.incomingConnectionRequests || []).filter(id => allUserIds.has(id.toString()));
                    if (validIn.length !== (u.incomingConnectionRequests || []).length) {
                        u.incomingConnectionRequests = validIn;
                        changed = true;
                        report.push(`Cleaned incoming connection requests for ${u.username}`);
                    }
                    // Ensure mutual connections (if A has B, B must have A)
                    for (const connId of validConns) {
                        const connUser = allConnUsers.find(x => x._id.toString() === connId.toString());
                        if (connUser && !(connUser.connections || []).some(id => id.toString() === u._id.toString())) {
                            connUser.connections.push(u._id);
                            report.push(`Added missing mutual connection: ${connUser.username} <-> ${u.username}`);
                            await connUser.save();
                        }
                    }
                    if (changed) await u.save();
                }
                return res.json({
                    message: "Connections fixed",
                    report
                });
            }
            case 'giveXP':
                // Directly add specified EXP amount to the level without affecting attribute points
                const expAmount = parseInt(req.body.amount) || 100;
                user.exp += expAmount;
                user.level = calculateLevel(user.exp).level;
                user.rpg.archetype = determineArchetype(user.rpg.stats, user.level);
                user.markModified('rpg');
                await user.save();
                break;
            case 'giveStats':
                // Directly boost attribute points without affecting total level EXP
                const { stat } = req.body;
                const pointAmount = parseInt(req.body.amount) || 5;
                if (stat) {
                    const s = stat.toLowerCase();
                    user.rpg.stats[s] = (user.rpg.stats[s] || 0) + pointAmount;
                } else {
                    const stats = ['str', 'agi', 'vit', 'int', 'wis', 'luk'];
                    for (const s of stats) {
                        user.rpg.stats[s] = (user.rpg.stats[s] || 0) + pointAmount;
                    }
                }
                // Recalculate archetype as stats have changed
                user.rpg.archetype = determineArchetype(user.rpg.stats, user.level);
                user.markModified('rpg');
                await user.save();
                break;
            case 'giveProdCoins':
                const coinAmount = parseInt(req.body.amount) || 1000;
                user.rpg.prodCoins = (user.rpg.prodCoins || 0) + coinAmount;
                user.markModified('rpg');
                await user.save();
                break;
            case 'resetPath':
                // Full Reversion: Return user to Level 0 (Unawakened)
                user.exp = 0;
                user.level = 0;
                user.rpg.stats = { str: 0, agi: 0, vit: 0, int: 0, wis: 0, luk: 0 };
                user.rpg.path = null;
                user.rpg.tier1 = null;
                user.rpg.style = null;
                user.rpg.alignment = null;
                user.rpg.finalLabel = null;
                user.rpg.archetype = { name: 'None', tier: 1, stage: 'Unawakened' };
                user.rpg.pendingQuestions = ["1.0"]; // Correct string format
                user.rpg.completedAnswers = [];
                user.rpg.dailyXP.total = 0;
                
                user.markModified('rpg');
                await user.save();
                break;
            case 'resetOnboarding':
                user.onboardingCompleted = false;
                await user.save();
                break;
            case 'removeDailyLimit':
                user.rpg.dailyXP = 0;
                user.markModified('rpg');
                await user.save();
                break;
            case 'restartAccount':
                // 1. Wipe all associated data
                const userId = user._id;
                await Promise.all([
                    Habit.deleteMany({ user: userId }),
                    Journal.deleteMany({ user: userId }),
                    Task.deleteMany({ user: userId }),
                    Wishlist.deleteMany({ user: userId }),
                    Notification.deleteMany({ user: userId }),
                    Activity.deleteMany({ user: userId }),
                    Budget.deleteMany({ user: userId }),
                    Debt.deleteMany({ user: userId }),
                    Goal.deleteMany({ user: userId }),
                    Saving.deleteMany({ user: userId }),
                    Transaction.deleteMany({ user: userId }),
                    HealthLog.deleteMany({ user: userId })
                ]);

                // 2. Reset User progress and onboarding
                user.exp = 0;
                user.level = 0;
                user.onboardingCompleted = false;
                user.rpg = {
                    stats: { str: 0, agi: 0, vit: 0, int: 0, wis: 0, luk: 0 },
                    path: null,
                    tier1: null,
                    style: null,
                    alignment: null,
                    finalLabel: null,
                    archetype: { name: 'None', tier: 1, stage: 'Unawakened' },
                    pendingQuestions: ["1.0"],
                    completedAnswers: [],
                    dailyXP: { total: 0, byStat: { str: 0, agi: 0, vit: 0, int: 0, wis: 0, luk: 0 } },
                    prodCoins: 0
                };
                user.markModified('rpg');
                await user.save();
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        // Fetch updated user with level info
        const updatedUser = await User.findById(req.user.id);
        const levelInfo = calculateLevel(updatedUser.exp);
        
        res.json({
            message: `Dev action ${action} successful`,
            level: updatedUser.level,
            exp: updatedUser.exp,
            rpg: updatedUser.rpg,
            onboardingCompleted: updatedUser.onboardingCompleted,
            totalRequired: levelInfo.totalRequired,
            nextLevelExp: levelInfo.xpToNext
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
