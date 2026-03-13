import Wishlist from '../models/Wishlist.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Debt from '../models/Debt.js';
import Saving from '../models/Saving.js';

// --- Transactions ---
export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addTransaction = async (req, res) => {
    const { title, amount, type, category, date } = req.body;
    try {
        const transaction = await Transaction.create({
            user: req.user._id,
            title,
            amount,
            type,
            category,
            date
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (transaction && transaction.user.toString() === req.user._id.toString()) {
            await transaction.deleteOne();
            res.json({ message: 'Transaction removed' });
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (transaction && transaction.user.toString() === req.user._id.toString()) {
            Object.assign(transaction, req.body);
            const updatedTx = await transaction.save();
            res.json(updatedTx);
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Budgets ---
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBudget = async (req, res) => {
    const { category, limit } = req.body;
    try {
        let budget = await Budget.findOne({ user: req.user._id, category });
        if (budget) {
            budget.limit = limit;
            await budget.save();
        } else {
            budget = await Budget.create({ user: req.user._id, category, limit });
        }
        res.json(budget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (budget && budget.user.toString() === req.user._id.toString()) {
            await budget.deleteOne();
            res.json({ message: 'Budget removed' });
        } else {
            res.status(404).json({ message: 'Budget not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Debts ---
export const getDebts = async (req, res) => {
    try {
        const debts = await Debt.find({ user: req.user._id });
        res.json(debts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addDebt = async (req, res) => {
    const { title, amount, total, type, interestRate, dueDate } = req.body;
    try {
        const debt = await Debt.create({
            user: req.user._id,
            title,
            amount,
            total,
            type,
            interestRate,
            dueDate
        });
        res.status(201).json(debt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateDebt = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);
        if (debt && debt.user.toString() === req.user._id.toString()) {
            Object.assign(debt, req.body);
            const updatedDebt = await debt.save();
            res.json(updatedDebt);
        } else {
            res.status(404).json({ message: 'Debt not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteDebt = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);
        if (debt && debt.user.toString() === req.user._id.toString()) {
            await debt.deleteOne();
            res.json({ message: 'Debt removed' });
        } else {
            res.status(404).json({ message: 'Debt not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Wishlist ---
export const getWishlist = async (req, res) => {
    try {
        const items = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addWishlistItem = async (req, res) => {
    const { title, price, category, priority, link } = req.body;
    try {
        const item = await Wishlist.create({
            user: req.user._id,
            title,
            price,
            category,
            priority,
            link
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateWishlistItem = async (req, res) => {
    try {
        const item = await Wishlist.findById(req.params.id);

        if (item) {
            if (item.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized' });
            }

            const fieldsToUpdate = ['title', 'price', 'category', 'priority', 'link', 'purchased'];
            fieldsToUpdate.forEach(field => {
                if (req.body[field] !== undefined) {
                    item[field] = req.body[field];
                }
            });

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Wishlist item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteWishlistItem = async (req, res) => {
    try {
        const item = await Wishlist.findById(req.params.id);

        if (item) {
            if (item.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized' });
            }
            await item.deleteOne();
            res.json({ message: 'Wishlist item removed' });
        } else {
            res.status(404).json({ message: 'Wishlist item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Savings ---
export const getSavings = async (req, res) => {
    try {
        const savings = await Saving.find({ user: req.user._id });
        res.json(savings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSaving = async (req, res) => {
    const { title, amount, target, category } = req.body;
    try {
        let saving = await Saving.findOne({ user: req.user._id, title });
        if (saving) {
            if (amount !== undefined) saving.amount = amount;
            if (target !== undefined) saving.target = target;
            if (category !== undefined) saving.category = category;
            await saving.save();
        } else {
            saving = await Saving.create({
                user: req.user._id,
                title,
                amount: amount || 0,
                target: target || 0,
                category: category || 'General'
            });
        }
        res.json(saving);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSaving = async (req, res) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (saving && saving.user.toString() === req.user._id.toString()) {
            await saving.deleteOne();
            res.json({ message: 'Saving removed' });
        } else {
            res.status(404).json({ message: 'Saving not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
