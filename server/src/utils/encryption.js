import crypto from 'crypto';
import '../../env.js';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

const getEncryptionKey = () => {
    // Dynamic runtime resolution to bypass ES Module loading race conditions against dotenv.config()
    return process.env.ENCRYPTION_KEY;
};

/**
 * Encrypts a string using AES-256-CBC.
 * @param {string|object|number} text - The content to encrypt.
 * @returns {string} The encrypted string in format 'iv:ciphertext'.
 */
export function encrypt(text) {
    const key = getEncryptionKey();
    if (!key) {
        throw new Error('ENCRYPTION_KEY is missing in environment variables');
    }

    if (text === null || text === undefined) return text;

    // Convert non-strings to JSON strings
    const stringValue = typeof text === 'string' ? text : JSON.stringify(text);

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(stringValue);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a string using AES-256-CBC.
 * @param {string} text - The encrypted string in format 'iv:ciphertext'.
 * @returns {string|object|number} The decrypted content.
 */
export function decrypt(text) {
    const key = getEncryptionKey();
    if (!key) {
        throw new Error('ENCRYPTION_KEY is missing in environment variables');
    }

    if (!text || typeof text !== 'string' || !text.includes(':')) {
        return text; // Return as is if not encrypted format
    }

    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
        
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        const finalValue = decrypted.toString();

        // Try to parse as JSON (for objects/numbers/arrays)
        try {
            return JSON.parse(finalValue);
        } catch (e) {
            return finalValue; // Return as string if not JSON
        }
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return text; // Fallback to original text on failure
    }
}
