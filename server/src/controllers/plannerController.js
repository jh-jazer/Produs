import User from '../models/User.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import Template from '../models/Template.js';
import { checkSystemHabit } from '../utils/habitUtils.js';
import { awardXP } from '../utils/rpgUtils.js';

// Helper to check for overlaps
const checkOverlap = async (userId, date, startTime, endTime, excludeTaskId = null) => {
    if (!startTime || !endTime) return false;

    // Convert times to minutes for comparison
    const toMin = (s) => {
        if (!s) return null;
        const [h, m] = s.split(':').map(Number);
        return h * 60 + m;
    };

    const s1 = toMin(startTime);
    let e1 = toMin(endTime);
    if (e1 === null || e1 <= s1) e1 = s1 + 30;

    // Find all timed tasks for this user on this date
    // Note: This includes priority tasks if they have startTime
    const existingTasks = await Task.find({
        user: userId,
        date: date,
        startTime: { $exists: true },
        _id: { $ne: excludeTaskId }
    });

    return existingTasks.some(task => {
        const s2 = toMin(task.startTime);
        let e2 = toMin(task.endTime);
        if (e2 === null || e2 <= s2) e2 = s2 + 30;
        return s1 < e2 && s2 < e1;
    });
};

// Task Controllers
export const getTasks = async (req, res) => {
    try {
        let targetUserId = req.user._id;

        if (req.query.view === 'partner') {
            const currentUser = await User.findById(req.user._id);
            if (!currentUser || !currentUser.partner) {
                return res.status(400).json({ message: 'No linked partner found' });
            }
            targetUserId = currentUser.partner;
        }

        const { date, year, month } = req.query;
        const query = { user: targetUserId };

        if (date) {
            // Find tasks where (date >= task.date AND (date <= task.endDate OR task.endDate is null))
            query.$or = [
                { date: date }, // Simple match
                {
                    date: { $lte: date },
                    endDate: { $gte: date }
                }
            ];
        } else if (year && month) {
            // Find tasks that overlap with this month
            // This is a bit more complex, but for now we can just find tasks starting or ending in this month
            // or spanning across it.
            const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
            const monthEnd = `${year}-${String(month).padStart(2, '0')}-31`; // Rough end

            query.$or = [
                { date: { $regex: new RegExp(`^${year}-${String(month).padStart(2, '0')}`) } },
                { endDate: { $regex: new RegExp(`^${year}-${String(month).padStart(2, '0')}`) } },
                {
                    date: { $lte: monthEnd },
                    endDate: { $gte: monthStart }
                }
            ];
        }

        const tasks = await Task.find(query).sort({ order: 1, startTime: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTask = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;
        
        const overlaps = await checkOverlap(req.user._id, date, startTime, endTime);
        if (overlaps) {
            return res.status(400).json({ message: 'Activity overlaps with an existing task' });
        }

        const task = new Task({
            ...req.body,
            user: req.user._id
        });
        await task.save();

        // Auto-check Daily Planning habit
        await checkSystemHabit(req.user._id, 'planner', task.date);

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;
        const existingTask = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!existingTask) return res.status(404).json({ message: 'Task not found' });

        // If time is being updated, check for overlaps
        if (startTime || endTime || date) {
            const finalDate = date || existingTask.date;
            const finalStart = startTime || existingTask.startTime;
            const finalEnd = endTime || existingTask.endTime;
            
            const overlaps = await checkOverlap(req.user._id, finalDate, finalStart, finalEnd, req.params.id);
            if (overlaps) {
                return res.status(400).json({ message: 'Update would cause activity overlap' });
            }
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );

        // Award XP if task was just completed
        if (req.body.completed === true && existingTask.completed === false) {
            const user = await User.findById(req.user._id);
            
            // Individual task completion: +2 DEX
            await awardXP(user, 'dex', 2);

            // Check if all tasks for this date are now completed: +15 DEX bonus
            const remainingTasks = await Task.countDocuments({
                user: req.user._id,
                date: task.date,
                completed: false
            });

            if (remainingTasks === 0) {
                await awardXP(user, 'dex', 15);
            }

            await user.save();
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const TEMPLATES = {
    'deep-work': [
        { title: 'Morning Focus Session', startTime: '08:00', endTime: '11:00' },
        { title: 'Midday Review & Email', startTime: '11:00', endTime: '12:00' },
        { title: 'Lunch & Movement', startTime: '12:00', endTime: '13:00' },
        { title: 'Afternoon Deep Work', startTime: '13:00', endTime: '16:00' },
        { title: 'Sync & Planning', startTime: '16:00', endTime: '17:00' },
        { title: 'Personal Growth/Study', startTime: '20:00', endTime: '21:30' }
    ],
    'reset-day': [
        { title: 'Gentle Morning/Meditation', startTime: '09:00', endTime: '10:00' },
        { title: 'Deep Reading', startTime: '10:00', endTime: '12:00' },
        { title: 'Healthy Meal Prep', startTime: '12:00', endTime: '14:00' },
        { title: 'Nature Walk/Exercise', startTime: '14:00', endTime: '16:00' },
        { title: 'Skill Learning', startTime: '16:00', endTime: '18:00' },
        { title: 'Digital Detox & Sleep Prep', startTime: '20:00', endTime: '22:00' }
    ],
    'high-performance': [
        { title: 'Top Priority Sprint', startTime: '08:00', endTime: '10:30' },
        { title: 'Brief Recovery', startTime: '10:30', endTime: '11:00' },
        { title: 'Secondary Focus Sprint', startTime: '11:00', endTime: '13:00' },
        { title: 'Executive Lunch', startTime: '13:00', endTime: '14:00' },
        { title: 'Admin & Communication', startTime: '14:00', endTime: '15:30' },
        { title: 'Skill Polish Session', startTime: '16:00', endTime: '18:00' }
    ],
    'development': [
        { title: 'Code Base Research', startTime: '09:00', endTime: '10:30' },
        { title: 'Feature Development', startTime: '10:30', endTime: '13:00' },
        { title: 'Documentation & Review', startTime: '14:00', endTime: '15:30' },
        { title: 'Refactoring Sprint', startTime: '15:30', endTime: '17:30' },
        { title: 'Side Project Lab', startTime: '19:00', endTime: '21:00' }
    ]
};

export const applyTemplate = async (req, res) => {
    try {
        const { date, templateId } = req.body;
        if (!date || !templateId) {
            return res.status(400).json({ message: 'Date and templateId are required' });
        }

        let templateTasks;
        
        // Check if templateId is a system template or a custom template ID
        if (TEMPLATES[templateId]) {
            templateTasks = TEMPLATES[templateId];
        } else {
            // Check if it's a valid MongoDB ID first
            if (templateId.match(/^[0-9a-fA-F]{24}$/)) {
                // Fetch from DB
                const customTemplate = await Template.findOne({
                    $or: [
                        { _id: templateId, user: req.user._id },
                        { _id: templateId, isShared: true } // Could check partner ID specifically for tighter security
                    ]
                });
                if (customTemplate) {
                    templateTasks = customTemplate.tasks;
                }
            }
        }

        if (!templateTasks) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // 1. Delete existing daily tasks for this specific date
        await Task.deleteMany({ 
            user: req.user._id, 
            date, 
            startTime: { $exists: true } // Only delete scheduled items, not floating tasks
        });

        // 2. Insert new tasks from template
        const newTasks = templateTasks.map(t => ({
            ...t,
            user: req.user._id,
            date,
            type: 'task'
        }));

        await Task.insertMany(newTasks);

        // Auto-check Daily Planning habit
        await checkSystemHabit(req.user._id, 'planner', date);

        res.json({ message: 'Template applied successfully', count: newTasks.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Custom Template Controllers
export const getTemplates = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const partnerId = currentUser?.partner;

        const templates = await Template.find({
            $or: [
                { user: req.user._id },
                { user: partnerId, isShared: true }
            ]
        }).sort({ createdAt: -1 });

        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveAsTemplate = async (req, res) => {
    try {
        const { name, date, isShared } = req.body;
        if (!name || !date) {
            return res.status(400).json({ message: 'Name and date are required' });
        }

        // Get tasks for that day
        const dayTasks = await Task.find({
            user: req.user._id,
            date,
            startTime: { $exists: true }
        });

        if (dayTasks.length === 0) {
            return res.status(400).json({ message: 'No tasks found for this date to save' });
        }

        const template = new Template({
            user: req.user._id,
            name,
            isShared: isShared || false,
            tasks: dayTasks.map(t => ({
                title: t.title,
                startTime: t.startTime,
                endTime: t.endTime,
                color: t.color
            }))
        });

        await template.save();
        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTemplate = async (req, res) => {
    try {
        const template = await Template.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json(template);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json({ message: 'Template deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Goal Controllers
export const getGoals = async (req, res) => {
    try {
        let targetUserId = req.user._id;

        if (req.query.view === 'partner') {
            const currentUser = await User.findById(req.user._id);
            if (!currentUser || !currentUser.partner) {
                return res.status(400).json({ message: 'No linked partner found' });
            }
            targetUserId = currentUser.partner;
        }

        const { period, year, month, week, day } = req.query;
        const query = { user: targetUserId };
        if (period) query.period = period;
        if (year) query.year = year;
        if (month !== undefined) query.month = month;
        if (week !== undefined) query.week = week;
        if (day !== undefined) query.day = day;

        const goals = await Goal.find(query);
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createGoal = async (req, res) => {
    try {
        const goal = new Goal({
            ...req.body,
            user: req.user._id
        });
        await goal.save();

        // Auto-check Goal Setting habit
        await checkSystemHabit(req.user._id, 'workout');

        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        // Auto-check Goal Setting habit
        await checkSystemHabit(req.user._id, 'workout');

        res.json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
