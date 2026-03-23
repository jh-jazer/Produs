import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import User from '../models/User.js';

export const getChallenges = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const joinedChallenges = user?.joinedChallenges || [];

        // 1. The Deep Work 50 (Cumulative hours)
        // Heuristic: Tasks with "Deep Work" in title
        const deepWorkTasks = await Task.find({
            user: userId,
            title: { $regex: /Deep Work/i },
            completed: true,
            startTime: { $exists: true },
            endTime: { $exists: true }
        });

        const totalMinutes = deepWorkTasks.reduce((acc, task) => {
            const [startH, startM] = task.startTime.split(':').map(Number);
            const [endH, endM] = task.endTime.split(':').map(Number);
            const duration = (endH * 60 + endM) - (startH * 60 + startM);
            return acc + (duration > 0 ? duration : 0);
        }, 0);
        const deepWorkHours = Math.round((totalMinutes / 60) * 10) / 10;

        // 2. The Rule of Three (Days with 3 completed priority tasks)
        const priorityTasks = await Task.find({
            user: userId,
            priority: true,
            completed: true
        });

        // Group by date and count days with 3+ completed priority tasks
        const dateGroups = priorityTasks.reduce((acc, t) => {
            acc[t.date] = (acc[t.date] || 0) + 1;
            return acc;
        }, {});
        const daysWithThree = Object.values(dateGroups).filter(count => count >= 3).length;

        // 3. Habit-based streaks (Analog Morning, Shutdown Ritual)
        const analogHabit = await Habit.findOne({ user: userId, name: { $regex: /Analog Morning/i } });
        const shutdownHabit = await Habit.findOne({ user: userId, name: { $regex: /Shutdown Ritual/i } });

        // 4. Inbox Zero Hero (Last 7 days streak)
        const last7Days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        const tasksLast7 = await Task.find({
            user: userId,
            date: { $in: last7Days }
        });

        let inboxZeroStreak = 0;
        for (const date of last7Days) {
            const dayTasks = tasksLast7.filter(t => t.date === date);
            const allCompleted = dayTasks.length > 0 && dayTasks.every(t => t.completed);
            if (allCompleted) inboxZeroStreak++;
            else if (dayTasks.length > 0) break;
        }

        // 5. Pomodoro Master (Today's count)
        const todayStr = new Date().toISOString().split('T')[0];
        const pomodorosToday = await Task.countDocuments({
            user: userId,
            date: todayStr,
            title: { $regex: /Pomodoro/i },
            completed: true
        });

        const challenges = [
            {
                id: 1,
                name: "The Deep Work 50",
                description: "Complete 50 cumulative hours of 'Deep Work' sessions.",
                progress: deepWorkHours,
                target: 50,
                daysLeft: "Ongoing",
                color: "blue",
                icon: "bolt",
                category: "Evergreen",
                isJoined: joinedChallenges.includes(1)
            },
            {
                id: 2,
                name: "Inbox Zero Hero",
                description: "Maintain a clear inbox for 7 consecutive days.",
                progress: inboxZeroStreak,
                target: 7,
                daysLeft: Math.max(0, 7 - inboxZeroStreak),
                color: "slate",
                icon: "inbox",
                category: "Evergreen",
                isJoined: joinedChallenges.includes(2)
            },
            {
                id: 3,
                name: "The Rule of Three",
                description: "Complete your 'Top 3' tasks every day.",
                progress: daysWithThree,
                target: 14,
                daysLeft: Math.max(0, 14 - daysWithThree),
                color: "blue",
                icon: "format_list_numbered",
                category: "Evergreen",
                isJoined: joinedChallenges.includes(3)
            },
            {
                id: 4,
                name: "The Pomodoro Master",
                description: "Complete 8 focus intervals in a workday.",
                progress: pomodorosToday,
                target: 8,
                daysLeft: "Today",
                color: "white",
                icon: "timer",
                category: "Evergreen",
                isJoined: joinedChallenges.includes(4)
            },
            {
                id: 5,
                name: "Analog Morning",
                description: "No digital screens for 60 mins after waking up.",
                progress: analogHabit ? analogHabit.streak : 0,
                target: 21,
                daysLeft: Math.max(0, 21 - (analogHabit ? analogHabit.streak : 0)),
                color: "blue",
                icon: "bedtime_off",
                category: "Evergreen",
                isJoined: joinedChallenges.includes(5)
            },
            {
                id: 6,
                name: "The Shutdown Ritual",
                description: "Log a 10-min planning session before 6 PM.",
                progress: shutdownHabit ? shutdownHabit.streak : 0,
                target: 30,
                daysLeft: Math.max(0, 30 - (shutdownHabit ? shutdownHabit.streak : 0)),
                color: "slate",
                icon: "event_repeat",
                category: "Evergreen",
                isJoined: joinedChallenges.includes(6)
            },
            {
                id: 7,
                name: "Digital Declutter",
                description: "Delete 5 apps, organize folders, unsubscribe.",
                progress: user.challengeProgress?.get('7') || 0,
                target: 1,
                daysLeft: Math.max(0, 31 - new Date().getDate()),
                color: "slate",
                icon: "cleaning_services",
                category: "March Special",
                isJoined: joinedChallenges.includes(7)
            },
            {
                id: 8,
                name: "March Momentum",
                description: "Deep Work session every weekday this month.",
                progress: deepWorkTasks.filter(t => t.date.startsWith('2026-03')).length,
                target: 22,
                daysLeft: Math.max(0, 31 - new Date().getDate()),
                color: "blue",
                icon: "trending_up",
                category: "March Special",
                isJoined: joinedChallenges.includes(8)
            },
            {
                id: 9,
                name: "Flow State",
                description: "Join Live Focus Room and work for 2 hours.",
                progress: user.challengeProgress?.get('9') || 0,
                target: 2,
                daysLeft: Math.max(0, 31 - new Date().getDate()),
                color: "blue",
                icon: "groups",
                category: "March Special",
                isJoined: joinedChallenges.includes(9)
            }
        ];

        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateChallengeProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { increment = 1 } = req.body;
        const challengeId = id.toString();

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.challengeProgress) {
            user.challengeProgress = new Map();
        }

        const currentProgress = user.challengeProgress.get(challengeId) || 0;
        user.challengeProgress.set(challengeId, currentProgress + increment);

        await user.save();
        res.json({ message: 'Progress updated', progress: user.challengeProgress.get(challengeId) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleChallengeJoin = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const challengeId = parseInt(id);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isJoined = user.joinedChallenges.includes(challengeId);
        if (isJoined) {
            user.joinedChallenges = user.joinedChallenges.filter(c => c !== challengeId);
        } else {
            user.joinedChallenges.push(challengeId);
        }

        await user.save();
        res.json({ message: isJoined ? 'Left challenge' : 'Joined challenge', joined: !isJoined });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
