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
    bio: {
        type: String,
        maxLength: 160
    },
    banner: {
        type: String
    },
    onboardingCompleted: {
        type: Boolean,
        default: false
    },
    timezone: {
        type: String
    },
    settings: {
        darkMode: {
            type: Boolean,
            default: true
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
            default: false
        }
    },
    currency: {
        type: String,
        enum: ['USD', 'PHP'],
        default: 'USD'
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
    }
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
