import express from 'express';
import {
    getWishlist,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    getTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getBudgets,
    updateBudget,
    getDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    getSavings,
    updateSaving,
    deleteSaving
} from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/transactions')
    .get(protect, getTransactions)
    .post(protect, addTransaction);

router.route('/transactions/:id')
    .put(protect, updateTransaction)
    .delete(protect, deleteTransaction);

router.route('/budgets')
    .get(protect, getBudgets)
    .put(protect, updateBudget);

router.route('/debts')
    .get(protect, getDebts)
    .post(protect, addDebt);

router.route('/debts/:id')
    .patch(protect, updateDebt)
    .delete(protect, deleteDebt);

router.route('/savings')
    .get(protect, getSavings)
    .post(protect, updateSaving);

router.route('/savings/:id')
    .delete(protect, deleteSaving);

router.route('/wishlist')
    .get(protect, getWishlist)
    .post(protect, addWishlistItem);

router.route('/wishlist/:id')
    .patch(protect, updateWishlistItem)
    .delete(protect, deleteWishlistItem);

export default router;
