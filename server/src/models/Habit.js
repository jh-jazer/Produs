import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'favorite'
    },
    color: {
        type: String,
        default: 'emerald'
    },
    category: {
        type: String,
        default: 'INT'
    },
    streak: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0 // Default order position
    },
    checks: [{
        date: String, // YYYY-MM-DD
        completed: {
            type: Boolean,
            default: false
        }
    }],
    sharedGroupId: {
        type: String,
        default: null
    },
    isShared: {
        type: Boolean,
        default: false
    },
    systemId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Logic for streak calculation
habitSchema.methods.calculateStreak = function (partnerChecks) {
    if (!this.checks || this.checks.length === 0) return 0;

    // Filter only completed checks and sort by date descending
    let completedDates;
    if (this.isShared && this.sharedGroupId && partnerChecks) {
        const myCompletedDates = new Set(this.checks.filter(c => c.completed).map(c => c.date));
        const partnerCompleted = new Set(partnerChecks.filter(c => c.completed).map(c => c.date));
        completedDates = Array.from(myCompletedDates)
            .filter(date => partnerCompleted.has(date))
            .sort((a, b) => b.localeCompare(a));
    } else {
        completedDates = this.checks
            .filter(c => c.completed)
            .map(c => c.date)
            .sort((a, b) => b.localeCompare(a));
    }

    if (completedDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if the latest completion is either today or yesterday
    // If it was completed before yesterday, the streak is broken
    let latestDate = completedDates[0];
    if (latestDate !== today && latestDate !== yesterdayStr) {
        return 0;
    }

    let currentStreak = 0;
    let expectedDate = new Date(latestDate);

    for (const dateStr of completedDates) {
        const actualDateStr = expectedDate.toISOString().split('T')[0];
        if (dateStr === actualDateStr) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            // Gap found
            break;
        }
    }

    return currentStreak;
};

// Active Record like methods
habitSchema.methods.toggleCheck = async function (dateStr) {
    const checkIndex = this.checks.findIndex(c => c.date === dateStr);
    if (checkIndex > -1) {
        this.checks[checkIndex].completed = !this.checks[checkIndex].completed;
    } else {
        this.checks.push({ date: dateStr, completed: true });
    }

    // Recalculate streak after toggling
    let partnerChecks = null;
    if (this.isShared && this.sharedGroupId) {
        const partnerHabit = await this.model('Habit').findOne({
            sharedGroupId: this.sharedGroupId,
            _id: { $ne: this._id }
        });
        if (partnerHabit) {
            partnerChecks = partnerHabit.checks;
        }
    }

    this.streak = this.calculateStreak(partnerChecks);

    await this.save();

    // Also update the partner's streak!
    if (this.isShared && this.sharedGroupId) {
        const partnerHabit = await this.model('Habit').findOne({
            sharedGroupId: this.sharedGroupId,
            _id: { $ne: this._id }
        });
        if (partnerHabit) {
            partnerHabit.streak = partnerHabit.calculateStreak(this.checks);
            await partnerHabit.save();
        }
    }

    return this;
};

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
