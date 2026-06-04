import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { encrypt, decrypt } from './encryption.js';

describe('encryption utility', () => {
    let originalKey;

    beforeEach(() => {
        // Save the original key to restore it later
        originalKey = process.env.ENCRYPTION_KEY;
    });

    afterEach(() => {
        // Restore the original key
        if (originalKey !== undefined) {
            process.env.ENCRYPTION_KEY = originalKey;
        } else {
            delete process.env.ENCRYPTION_KEY;
        }
    });

    test('should throw error when ENCRYPTION_KEY is missing', () => {
        delete process.env.ENCRYPTION_KEY;

        expect(() => encrypt('test data')).toThrow('ENCRYPTION_KEY is missing in environment variables');
        expect(() => decrypt('some:encrypted:data')).toThrow('ENCRYPTION_KEY is missing in environment variables');
    });

    test('should encrypt and decrypt a string with valid ENCRYPTION_KEY', () => {
        process.env.ENCRYPTION_KEY = 'b6294c2c0fc50e18d8c6d5a6e20d524e7297c130eccc68c63f6b7321d18cb7b2';

        const originalText = 'Hello, World!';
        const encryptedText = encrypt(originalText);

        // It should not be the same as the original text
        expect(encryptedText).not.toBe(originalText);
        // It should be in the format 'iv:ciphertext'
        expect(encryptedText.includes(':')).toBe(true);

        const decryptedText = decrypt(encryptedText);
        expect(decryptedText).toBe(originalText);
    });

    test('should handle objects and numbers with valid ENCRYPTION_KEY', () => {
        process.env.ENCRYPTION_KEY = 'b6294c2c0fc50e18d8c6d5a6e20d524e7297c130eccc68c63f6b7321d18cb7b2';

        const obj = { id: 1, name: 'Test' };
        const encryptedObj = encrypt(obj);
        expect(decrypt(encryptedObj)).toEqual(obj);

        const num = 12345;
        const encryptedNum = encrypt(num);
        expect(decrypt(encryptedNum)).toBe(num);
    });
});
