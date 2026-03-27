import { describe, expect, test, mock, beforeEach } from 'bun:test';

// Mock dependencies before importing the controller
const mockTransaction = {
    findById: mock(),
};

const mockDebt = {
    findById: mock(),
};

mock.module('../../src/models/Transaction.js', () => ({
    default: mockTransaction
}));

mock.module('../../src/models/Debt.js', () => ({
    default: mockDebt
}));

// We also need to mock User for awardXP and checkSystemHabit which are imported in the controller
mock.module('../../src/models/User.js', () => ({
    default: {}
}));
mock.module('../../src/utils/habitUtils.js', () => ({
    checkSystemHabit: mock()
}));
mock.module('../../src/utils/rpgUtils.js', () => ({
    awardXP: mock()
}));

const financeController = await import('../../src/controllers/financeController.js');

describe('Finance Controller - updateTransaction Security', () => {
    beforeEach(() => {
        mockTransaction.findById.mockReset();
        mockDebt.findById.mockReset();
    });

    test('updateTransaction should only update allowed fields and ignore mass assignment of sensitive fields', async () => {
        const req = {
            params: { id: 'tx123' },
            user: { _id: { toString: () => 'user123' } },
            body: {
                title: 'New Title',
                amount: 50,
                type: 'expense',
                user: 'hackedUser123', // Attack vector
                _id: 'hackedId', // Attack vector
                __v: 1
            }
        };

        const res = {
            json: mock(),
            status: mock().mockReturnThis()
        };

        const mockSave = mock().mockResolvedValue({
            title: 'New Title',
            amount: 50,
            type: 'expense',
            user: 'user123'
        });

        const transactionObj = {
            user: { toString: () => 'user123' },
            title: 'Old Title',
            amount: 10,
            type: 'income',
            save: mockSave
        };

        mockTransaction.findById.mockResolvedValue(transactionObj);

        await financeController.updateTransaction(req, res);

        expect(mockTransaction.findById).toHaveBeenCalledWith('tx123');

        // Assert allowed fields were updated
        expect(transactionObj.title).toBe('New Title');
        expect(transactionObj.amount).toBe(50);
        expect(transactionObj.type).toBe('expense');

        // Assert sensitive fields were NOT updated (they should retain original value if set, or not exist)
        expect(transactionObj.user.toString()).toBe('user123');
        expect(transactionObj._id).toBeUndefined();

        expect(mockSave).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
    });

    test('updateDebt should only update allowed fields and ignore mass assignment of sensitive fields', async () => {
        const req = {
            params: { id: 'debt123' },
            user: { _id: { toString: () => 'user123' } },
            body: {
                title: 'New Debt Title',
                amount: 1000,
                interestRate: 5,
                user: 'hackedUser123', // Attack vector
                _id: 'hackedId', // Attack vector
            }
        };

        const res = {
            json: mock(),
            status: mock().mockReturnThis()
        };

        const mockSave = mock().mockResolvedValue({
            title: 'New Debt Title',
            amount: 1000,
            interestRate: 5,
            user: 'user123'
        });

        const debtObj = {
            user: { toString: () => 'user123' },
            title: 'Old Debt Title',
            amount: 500,
            interestRate: 10,
            save: mockSave
        };

        mockDebt.findById.mockResolvedValue(debtObj);

        await financeController.updateDebt(req, res);

        expect(mockDebt.findById).toHaveBeenCalledWith('debt123');

        // Assert allowed fields were updated
        expect(debtObj.title).toBe('New Debt Title');
        expect(debtObj.amount).toBe(1000);
        expect(debtObj.interestRate).toBe(5);

        // Assert sensitive fields were NOT updated
        expect(debtObj.user.toString()).toBe('user123');
        expect(debtObj._id).toBeUndefined();

        expect(mockSave).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
    });
});
