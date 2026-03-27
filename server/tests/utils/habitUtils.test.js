import { test, expect, describe, mock, beforeEach, afterEach } from 'bun:test';

// Mock the Habit model methods BEFORE importing habitUtils
const mockFindOne = mock(() => Promise.resolve(null));
const mockInsertMany = mock(() => Promise.resolve([]));
const mockFind = mock(() => Promise.resolve([]));

mock.module('../../src/models/Habit.js', () => ({
    default: {
        findOne: mockFindOne,
        insertMany: mockInsertMany,
        find: mockFind,
    }
}));

import { checkSystemHabit } from '../../src/utils/habitUtils.js';

describe('habitUtils - checkSystemHabit', () => {
    beforeEach(() => {
        mockFindOne.mockClear();
    });

    test('should return early and not query the database if systemId is null', async () => {
        await checkSystemHabit('user123', null);
        expect(mockFindOne).not.toHaveBeenCalled();
    });

    test('should return early and not query the database if userId is null', async () => {
        await checkSystemHabit(null, 'planner');
        expect(mockFindOne).not.toHaveBeenCalled();
    });

    test('should query the database if both userId and systemId are provided', async () => {
        const mockToggleCheck = mock(() => Promise.resolve());

        // Mock finding a habit that hasn't been checked today
        mockFindOne.mockResolvedValueOnce({
            user: 'user123',
            systemId: 'planner',
            checks: [],
            toggleCheck: mockToggleCheck
        });

        await checkSystemHabit('user123', 'planner');

        expect(mockFindOne).toHaveBeenCalledTimes(1);
        expect(mockFindOne).toHaveBeenCalledWith({ user: 'user123', systemId: 'planner' });
        expect(mockToggleCheck).toHaveBeenCalledTimes(1);
    });

    test('should not toggleCheck if already checked today', async () => {
        const mockToggleCheck = mock(() => Promise.resolve());
        const today = new Date().toISOString().split('T')[0];

        // Mock finding a habit that HAS been checked today
        mockFindOne.mockResolvedValueOnce({
            user: 'user123',
            systemId: 'planner',
            checks: [{ date: today, completed: true }],
            toggleCheck: mockToggleCheck
        });

        await checkSystemHabit('user123', 'planner');

        expect(mockFindOne).toHaveBeenCalledTimes(1);
        expect(mockToggleCheck).not.toHaveBeenCalled();
    });
});
