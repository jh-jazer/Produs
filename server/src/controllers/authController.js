import User from '../models/User.js';
import Habit from '../models/Habit.js';
import generateToken from '../utils/generateToken.js';
import Joi from 'joi';

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

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
        const user = await User.findById(req.user.id).populate('partner', 'name username email avatar');
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
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
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

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } }
            ],
            'settings.isPublic': true,
            _id: { $ne: req.user.id }
        })
            .select('name username avatar bio settings')
            .limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public profile by username
// @route   GET /api/auth/profile/:username
// @access  Public
export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user || user.settings?.isPublic !== true) {
            return res.status(404).json({ message: 'User not found or profile is private' });
        }

        // Fetch top habits
        const habits = await Habit.find({ user: user._id });
        const topHabits = habits.sort((a, b) => b.streak - a.streak).slice(0, 3);

        res.json({
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            banner: user.banner,
            bio: user.bio,
            joined: user.createdAt,
            topHabits
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
            await user.save();

            // Create initial habits if provided
            const { selectedHabits } = req.body;
            if (selectedHabits && Array.isArray(selectedHabits)) {
                const habitsToCreate = selectedHabits.map(habit => ({
                    user: user._id,
                    name: habit.name,
                    icon: habit.icon,
                    color: habit.color,
                    category: habit.category || 'Productivity'
                }));
                await Habit.insertMany(habitsToCreate);
            }

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
                const existingUser = await User.findOne({ username: req.body.username });
                if (existingUser && existingUser.id !== user.id) {
                    return res.status(400).json({ message: 'Username is already taken' });
                }
            }

            user.settings = { ...user.settings, ...req.body };
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
export const linkPartner = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required to link a partner' });
        }

        if (email.toLowerCase() === req.user.email.toLowerCase()) {
            return res.status(400).json({ message: 'You cannot link yourself as a partner' });
        }

        const partnerToLink = await User.findOne({ email });

        if (!partnerToLink) {
            return res.status(404).json({ message: 'No user found with that email' });
        }

        const currentUser = await User.findById(req.user.id);

        if (currentUser.partner) {
            return res.status(400).json({ message: 'You already have a linked partner' });
        }

        if (partnerToLink.partner) {
            return res.status(400).json({ message: 'This user already has a linked partner' });
        }

        // Mutual link
        currentUser.partner = partnerToLink._id;
        partnerToLink.partner = currentUser._id;

        await currentUser.save();
        await partnerToLink.save();

        const updatedUser = await User.findById(req.user.id).populate('partner', 'name username email avatar');

        res.json({ message: 'Partner linked successfully', partner: updatedUser.partner });

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
