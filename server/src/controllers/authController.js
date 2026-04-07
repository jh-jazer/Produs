import User from '../models/User.js';
import Habit from '../models/Habit.js';
import Journal from '../models/Journal.js';
import Task from '../models/Task.js';
import Wishlist from '../models/Wishlist.js';
import Joi from 'joi';
import mongoose from 'mongoose';
import generateToken from '../utils/generateToken.js';
import { calculateLevel, awardXP, determineArchetype } from '../utils/rpgUtils.js';
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

            const levelInfo = calculateLevel(user.exp);

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
                level: user.level,
                exp: user.exp,
                rpg: user.rpg,
                totalRequired: levelInfo.totalRequired,
                nextLevelExp: levelInfo.xpToNext,
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

            const levelInfo = calculateLevel(user.exp);
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
                level: user.level,
                exp: user.exp,
                rpg: user.rpg,
                totalRequired: levelInfo.totalRequired,
                nextLevelExp: levelInfo.xpToNext,
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
            const levelInfo = calculateLevel(user.exp);
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
                level: user.level,
                exp: user.exp,
                rpg: user.rpg,
                totalRequired: levelInfo.totalRequired,
                nextLevelExp: levelInfo.xpToNext,
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
            .populate('connections', 'name username avatar bio settings')
            .populate('incomingConnectionRequests', 'name username avatar bio settings')
            .populate('outgoingConnectionRequests', 'name username avatar bio settings');
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            connections: user.connections || [],
            incoming: user.incomingConnectionRequests || [],
            outgoing: user.outgoingConnectionRequests || []
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

        const user = await User.findOne(query);
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
        const systemHabits = await Habit.find({ user: user._id, systemId: { $in: ['journal', 'finance', 'planner', 'workout'] } });
        const systemStreaks = {
            journal: systemHabits.find(h => h.systemId === 'journal')?.streak || 0,
            finance: systemHabits.find(h => h.systemId === 'finance')?.streak || 0,
            planner: systemHabits.find(h => h.systemId === 'planner')?.streak || 0,
            workout: systemHabits.find(h => h.systemId === 'workout')?.streak || 0
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
    if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/auth?error=auth_failed`);
    }

    const token = generateToken(req.user._id);

    // Redirect to frontend with token in the URL params
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};

// @desc    Complete onboarding
// @route   PUT /api/auth/onboarding
// @access  Private
export const completeOnboarding = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            if (req.body.username) {
                const existingUser = await User.findOne({ username: req.body.username });
                if (existingUser && existingUser.id !== user.id) {
                    return res.status(400).json({ message: 'Username is already taken' });
                }
                user.username = req.body.username.toLowerCase();
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

            const levelInfo = calculateLevel(user.exp);
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
                level: user.level,
                exp: user.exp,
                rpg: user.rpg,
                totalRequired: levelInfo.totalRequired,
                nextLevelExp: levelInfo.xpToNext,
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

        // Update Stats and Profile
        user.rpg.stats = result.stats;
        user.rpg.path = result.path;
        user.rpg.tier1 = result.tier1;
        user.rpg.style = result.style;
        user.rpg.alignment = result.alignment;
        user.rpg.finalLabel = result.finalArchetype;
        user.rpg.confidence = result.consistency;
        
        // Update Level and XP to Level 1 baseline
        user.level = 1;
        user.exp = 100;

        // Finalize Archetype Identity
        user.rpg.archetype = {
            name: result.finalArchetype,
            tier: 1,
            stage: result.tier1
        };
        
        user.markModified('rpg');
        await user.save();

        const levelInfo = calculateLevel(user.exp);
        res.json({
            level: user.level,
            exp: user.exp,
            rpg: user.rpg,
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

        const user = await User.findOne({ username: username.toLowerCase() });
        if (user) {
            return res.json({ available: false, message: 'Username is already taken' });
        }

        res.json({ available: true, message: 'Username is available' });
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
        // req.file.path contains the secure Cloudinary URL returned by multer-storage-cloudinary
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

            // If updating username, ensure it's unique
            if (req.body.username) {
                const normalizedUsername = req.body.username.toLowerCase();
                const existingUser = await User.findOne({ username: normalizedUsername });
                if (existingUser && existingUser.id !== user.id) {
                    return res.status(400).json({ message: 'Username is already taken' });
                }
                user.username = normalizedUsername;
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
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required to request a partner link' });
        }

        if (email.toLowerCase() === req.user.email.toLowerCase()) {
            return res.status(400).json({ message: 'You cannot link yourself as a partner' });
        }

        const partnerToRequest = await User.findOne({ email });

        if (!partnerToRequest) {
            return res.status(404).json({ message: 'No user found with that email' });
        }

        const currentUser = await User.findById(req.user.id);

        if (currentUser.partner) {
            return res.status(400).json({ message: 'You already have a linked partner' });
        }

        if (currentUser.outgoingPartnerRequest) {
            return res.status(400).json({ message: 'You already have a pending outgoing request' });
        }

        if (partnerToRequest.partner) {
            return res.status(400).json({ message: 'This user already has a linked partner' });
        }

        // Set request fields
        currentUser.outgoingPartnerRequest = partnerToRequest._id;
        partnerToRequest.incomingPartnerRequest = currentUser._id;

        await currentUser.save();
        await partnerToRequest.save();

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
 
        // ⚡ DEX: Speed/Tasks
        const dex = getHabitImpact(['DEX']) + (tasks.length * 2);
 
        // 🔥 END: Consistency (Total Streaks across all habits)
        const totalStreaks = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
        const end = totalStreaks * 10; // High weight for streaks
 
        // 🧠 INT: Knowledge + Journaling
        const journalWeight = journalEntriesCount * 5;
        const int = getHabitImpact(['INT']) + journalWeight;
 
        // 🌀 WIS: Reflection + Finance
        const wis = getHabitImpact(['WIS', 'PER']); // Include legacy PER for migration safety
 
        // ✨ CHA: Relationships + Accountability
        const sharedHabitsCount = habits.filter(h => h.isShared).length;
        const cha = getHabitImpact(['CHA']) + (sharedHabitsCount * 10);
 
        res.json({
            str,
            dex,
            end,
            int,
            wis,
            cha,
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
        user.rpg.dailyXP.byStat = { str: 0, dex: 0, end: 0, int: 0, wis: 0, cha: 0 };
        user.markModified('rpg');

        switch (action) {
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
                    const stats = ['str', 'dex', 'end', 'int', 'wis', 'cha'];
                    for (const s of stats) {
                        user.rpg.stats[s] = (user.rpg.stats[s] || 0) + pointAmount;
                    }
                }
                // Recalculate archetype as stats have changed
                user.rpg.archetype = determineArchetype(user.rpg.stats, user.level);
                user.markModified('rpg');
                await user.save();
                break;
            case 'resetPath':
                // Full Reversion: Return user to Level 0 (Unawakened)
                user.exp = 0;
                user.level = 0;
                user.rpg.stats = { str: 0, dex: 0, end: 0, int: 0, wis: 0, cha: 0 };
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
