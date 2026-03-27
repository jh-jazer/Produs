import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import jwt from 'jsonwebtoken';
import generateToken from './generateToken.js';

describe('generateToken', () => {
    const originalEnv = process.env.JWT_SECRET;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test_secret';
    });

    afterAll(() => {
        if (originalEnv === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = originalEnv;
        }
    });

    it('should generate a valid JWT token', () => {
        const userId = '12345';
        const token = generateToken(userId);

        expect(typeof token).toBe('string');

        // Check structure
        const parts = token.split('.');
        expect(parts.length).toBe(3);

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(userId);

        // Verify expiration is set (should have exp and iat)
        expect(decoded.exp).toBeDefined();
        expect(decoded.iat).toBeDefined();

        // 30 days in seconds is 30 * 24 * 60 * 60 = 2592000
        expect(decoded.exp - decoded.iat).toBe(2592000);
    });
});
