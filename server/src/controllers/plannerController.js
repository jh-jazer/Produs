import Task from '../models/Task.js';
import Goal from '../models/Goal.js';

// Task Controllers
export const getTasks = async (req, res) => {
    try {
        const { date, year, month } = req.query;
        const query = { user: req.user._id };

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
        const task = new Task({
            ...req.body,
            user: req.user._id
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
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

// Goal Controllers
export const getGoals = async (req, res) => {
    try {
        const { period, year, month, week, day } = req.query;
        const query = { user: req.user._id };
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
