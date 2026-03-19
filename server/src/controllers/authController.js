import User from '../models/User.js';
import Habit from '../models/Habit.js';
import generateToken from '../utils/generateToken.js';
import Joi from 'joi';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Wishlist from '../models/Wishlist.js';

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

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                onboardingCompleted: user.onboardingCompleted,
                timezone: user.timezone,
                currency: user.currency,
                settings: user.settings,
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
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                onboardingCompleted: user.onboardingCompleted,
                timezone: user.timezone,
                currency: user.currency,
                settings: user.settings,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
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
        const systemHabits = await Habit.find({ user: user._id, systemId: { $in: ['journal', 'finance', 'planner'] } });
        const systemStreaks = {
            journal: systemHabits.find(h => h.systemId === 'journal')?.streak || 0,
            finance: systemHabits.find(h => h.systemId === 'finance')?.streak || 0,
            planner: systemHabits.find(h => h.systemId === 'planner')?.streak || 0
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
                user.username = req.body.username;
            }

            user.onboardingCompleted = true;
            user.timezone = req.body.timezone || user.timezone;
            user.currency = req.body.currency || user.currency;
            
            if (Array.isArray(req.body.subscriptions) && req.body.subscriptions.length > 0) {
                user.settings.subscriptions = req.body.subscriptions;
            } else if (req.body.subscription) {
                // Legacy single-subscription fallback
                user.settings.subscriptions = [req.body.subscription];
            }
            user.markModified('settings');
            
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                onboardingCompleted: user.onboardingCompleted,
                timezone: user.timezone,
                currency: user.currency,
                settings: user.settings,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
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
        user.markModified('settings');
        await user.save();

        res.json({ subscriptions: user.settings.subscriptions });
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
