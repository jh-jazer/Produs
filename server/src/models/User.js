import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Only required if not social login
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: {
        type: Object,
        default: {
            skin: "#F3C5A5",
            hair: "short",
            hairColor: "#4A2C2A",
            eyes: "default",
            clothing: "hoodie",
            clothingColor: "#3B82F6"
        }
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        default: null
    },
    bio: {
        type: String,
        maxLength: 160
    },
    banner: {
        type: String
    },
    // Guardian progression — earned via all normal-mode productivity activities
    guardianLevel: {
        type: Number,
        default: 1
    },
    guardianExp: {
        type: Number,
        default: 100
    },
    // Hero progression — the fictional RPG character the user guides.
    // Hero level is capped at guardianLevel. Name is derived from the user's archetype (neural sync).
    hero: {
        name:  { type: String, default: 'Unnamed Hero' },
        level: { type: Number, default: 0 },
        exp:   { type: Number, default: 0 }
    },
    onboardingCompleted: {
        type: Boolean,
        default: false
    },
    interests: {
        type: [String],
        default: []
    },
    rpg: {
        stats: {
            str: { type: Number, default: 0 },
            agi: { type: Number, default: 0 },
            vit: { type: Number, default: 0 },
            int: { type: Number, default: 0 },
            wis: { type: Number, default: 0 },
            luk: { type: Number, default: 0 }
        },
        path: { type: String, default: null },
        tier1: { type: String, default: null },
        style: { type: String, default: null },
        alignment: { type: String, default: null },
        finalLabel: { type: String, default: null },
        confidence: { type: Number, default: 100 },
        archetype: {
            name: { type: String, default: 'Rookie' },
            tier: { type: Number, default: 1 },
            stage: { type: String, default: 'Unawakened' }
        },
        perk: { type: String, default: '' },
        statMultipliers: { type: Map, of: Number, default: {} },
        dailyXP: {
            date: { type: String },
            total: { type: Number, default: 0 },
            byStat: {
                str: { type: Number, default: 0 },
                agi: { type: Number, default: 0 },
                vit: { type: Number, default: 0 },
                int: { type: Number, default: 0 },
                wis: { type: Number, default: 0 },
                luk: { type: Number, default: 0 }
            }
        },
        completedAnswers: {
            type: [Object],
            default: []
        },
        pendingQuestions: {
            type: [String],
            default: []
        },
        masteryPoints: {
            type: Number,
            default: 0
        },
        prodCoins: {
            type: Number,
            default: 2000
        },
        cores: {
            type: Number,
            default: 0
        },
        specialistRank: {
            type: String,
            default: 'F'
        },
        levelReachedSSS: {
            type: Number,
            default: null
        },
        archetypeHistory: {
            type: [Object],
            default: []
        },
        dailyQuiz: {
            lastCompleted: { type: String, default: null }
        },
        dailyReward: {
            lastClaimed: { type: String, default: null },
            claimsCount: { type: Number, default: 0 }
        },
        streakReward: {
            lastClaimed: { type: String, default: null }
        },
        inventory: {
            themes: { type: [String], default: ['classic'] },
            items: { type: [Object], default: [] }
        },
        energy: {
            current: { type: Number, default: 10 },
            lastUpdated: { type: Date, default: Date.now }
        },
        loginStreak: {
            type: Number,
            default: 1
        },
        loginDates: {
            type: [String],
            default: []
        }
    },
    timezone: {
        type: String
    },
    settings: {
        soundsEnabled: {
            type: Boolean,
            default: true
        },
        soundVolume: {
            type: Number,
            default: 1.0,
            min: 0,
            max: 3.0
        },
        notificationsEnabled: {
            type: Boolean,
            default: false
        },
        wishlist: {
            type: Array,
            default: []
        },
        mood: {
            type: String,
            default: "neutral"
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        sleepMode: {
            enabled: { type: Boolean, default: false },
            start: { type: String, default: "22:00" },
            end: { type: String, default: "07:00" }
        },
        themeMode: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system"
        },
        darkMode: {
            type: Boolean,
            default: false
        },
        theme: {
            type: String,
            default: 'classic'
        },
        subscriptions: {
            type: [String],
            default: []
        },
        bannerPosition: {
            type: Number,
            default: 50
        },
        showDevTools: {
            type: Boolean,
            default: false
        }
    },
    currency: {
        type: String,
        default: 'PHP'
    },
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    outgoingPartnerRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    incomingPartnerRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    joinedChallenges: {
        type: [Number],
        default: []
    },
    challengeProgress: {
        type: Map,
        of: Number,
        default: {}
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    outgoingConnectionRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    incomingConnectionRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
