import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { searchUsers } from '../../src/controllers/authController.js';
import mongoose from 'mongoose';

// Mock dependencies
mock.module('../../src/models/User.js', () => {
    return {
        default: {
            find: mock().mockReturnThis(),
            select: mock().mockReturnThis(),
            limit: mock().mockResolvedValue([{ name: 'Test User', username: 'testuser' }])
        }
    };
});

describe('authController - searchUsers', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            query: { q: '' },
            user: { id: 'test_user_id' }
        };
        res = {
            json: mock(),
            status: mock().mockReturnThis()
        };
    });

    afterEach(() => {
        mock.restore();
    });

    it('should return empty array if query is missing', async () => {
        await searchUsers(req, res);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return empty array if query is less than 2 characters', async () => {
        req.query.q = 'a';
        await searchUsers(req, res);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should correctly escape regex characters to prevent NoSQL injection', async () => {
        req.query.q = 'user.*';

        const User = await import('../../src/models/User.js');
        const findMock = User.default.find;

        await searchUsers(req, res);

        // Expected escaped query: user\.\*
        const expectedSafeQuery = 'user\\.\\*';

        expect(findMock).toHaveBeenCalledWith({
            _id: { $ne: 'test_user_id' },
            $or: [
                { name: { $regex: expectedSafeQuery, $options: 'i' } },
                { username: { $regex: expectedSafeQuery, $options: 'i' } }
            ]
        });
    });

    it('should handle standard text queries correctly', async () => {
        req.query.q = 'test';

        const User = await import('../../src/models/User.js');
        const findMock = User.default.find;

        await searchUsers(req, res);

        expect(findMock).toHaveBeenCalledWith({
            _id: { $ne: 'test_user_id' },
            $or: [
                { name: { $regex: 'test', $options: 'i' } },
                { username: { $regex: 'test', $options: 'i' } }
            ]
        });
    });

    it('should include exact ID match if query is a valid ObjectId', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        req.query.q = validId;

        const User = await import('../../src/models/User.js');
        const findMock = User.default.find;

        await searchUsers(req, res);

        expect(findMock).toHaveBeenCalledWith({
            _id: { $ne: 'test_user_id' },
            $or: [
                { name: { $regex: validId, $options: 'i' } },
                { username: { $regex: validId, $options: 'i' } },
                { _id: validId }
            ]
        });
    });
});
