/* eslint-disable */
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import api, { setAuthToken } from './api';

describe('api.js', () => {
    let originalWindow;
    let originalAdapter;

    beforeEach(() => {
        setAuthToken(null);
        originalWindow = global.window;
        originalAdapter = api.defaults.adapter;
    });

    afterEach(() => {
        global.window = originalWindow;
        api.defaults.adapter = originalAdapter;
    });

    describe('setAuthToken', () => {
        it('should add Authorization header to requests when token is set', async () => {
            const testToken = 'test-jwt-token-123';
            setAuthToken(testToken);

            let requestConfig;
            // Mock the adapter to capture the config and prevent actual network requests
            api.defaults.adapter = async (config) => {
                requestConfig = config;
                return { status: 200, data: 'ok', config, headers: {} };
            };

            await api.get('/test-endpoint');

            const authHeader = requestConfig.headers.Authorization ||
                               (requestConfig.headers.get && requestConfig.headers.get('Authorization'));

            expect(authHeader).toBe(`Bearer ${testToken}`);
        });

        it('should not add Authorization header when token is null', async () => {
            setAuthToken(null);

            let requestConfig;
            api.defaults.adapter = async (config) => {
                requestConfig = config;
                return { status: 200, data: 'ok', config, headers: {} };
            };

            await api.get('/test-endpoint');

            const authHeader = requestConfig.headers.Authorization ||
                               (requestConfig.headers.get && requestConfig.headers.get('Authorization'));

            expect(authHeader).toBeUndefined();
        });

        it('should remove Authorization header when token is updated to null', async () => {
            setAuthToken('initial-token');
            setAuthToken(null);

            let requestConfig;
            api.defaults.adapter = async (config) => {
                requestConfig = config;
                return { status: 200, data: 'ok', config, headers: {} };
            };

            await api.get('/test-endpoint');

            const authHeader = requestConfig.headers.Authorization ||
                               (requestConfig.headers.get && requestConfig.headers.get('Authorization'));

            expect(authHeader).toBeUndefined();
        });
    });

    describe('Response Interceptor (401 Unauthorized)', () => {
        it('should redirect to /auth on 401 response when window is defined', async () => {
            // Mock window object
            global.window = {
                location: {
                    href: ''
                }
            };

            api.defaults.adapter = async (config) => {
                const error = new Error('Request failed with status code 401');
                error.response = { status: 401, config };
                throw error;
            };

            try {
                await api.get('/test-endpoint');
            } catch (e) {
                // Expected to throw/reject
            }

            expect(global.window.location.href).toBe('/auth');
        });

        it('should just reject if error is not 401', async () => {
            global.window = {
                location: {
                    href: ''
                }
            };

            api.defaults.adapter = async (config) => {
                const error = new Error('Request failed with status code 500');
                error.response = { status: 500, config };
                throw error;
            };

            let caughtError;
            try {
                await api.get('/test-endpoint');
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            expect(caughtError.response.status).toBe(500);
            expect(global.window.location.href).toBe('');
        });
    });
});
