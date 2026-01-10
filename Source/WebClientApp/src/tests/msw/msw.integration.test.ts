import { describe, it, expect } from 'vitest';
import { server } from './server';
import { http, HttpResponse } from 'msw';

describe('MSW Integration', () => {
    it('should intercept API requests with default handlers', async () => {
        // Test that the encounter handler works
        const response = await fetch('/api/encounters/encounter-1');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.id).toBe('encounter-1');
        expect(data.name).toBe('Test Encounter');
    });

    it('should intercept stage API requests', async () => {
        const response = await fetch('/api/stages/stage-1');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.id).toBe('stage-1');
        expect(data.name).toBe('Test Stage');
    });

    it('should return 404 for non-existent resources', async () => {
        const response = await fetch('/api/encounters/non-existent');
        expect(response.status).toBe(404);
    });

    it('should allow per-test handler overrides', async () => {
        // Override the default handler for this test
        server.use(
            http.get('/api/encounters/:id', () => {
                return HttpResponse.json({ id: 'custom', name: 'Custom Encounter' });
            })
        );

        const response = await fetch('/api/encounters/any-id');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.id).toBe('custom');
        expect(data.name).toBe('Custom Encounter');
    });

    it('should intercept POST requests', async () => {
        const response = await fetch('/api/encounters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'New Encounter' }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.name).toBe('New Encounter');
        expect(data.id).toBeDefined();
    });

    it('should intercept auth endpoints', async () => {
        const response = await fetch('/api/auth/me');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.id).toBe('test-user-id');
        expect(data.email).toBe('test@example.com');
    });

    it('should intercept asset list endpoint', async () => {
        const response = await fetch('/api/assets');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
    });

    describe('error scenarios', () => {
        it('should return 401 for invalid login credentials', async () => {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'wrong@example.com', password: 'wrong' }),
            });

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Invalid credentials');
        });

        it('should handle server error responses', async () => {
            // Override handler to return 500
            server.use(
                http.get('/api/encounters/:id', () => {
                    return HttpResponse.json(
                        { error: 'Internal server error' },
                        { status: 500 }
                    );
                })
            );

            const response = await fetch('/api/encounters/encounter-1');
            expect(response.status).toBe(500);
        });

        it('should handle network errors', async () => {
            // Override handler to simulate network failure
            server.use(
                http.get('/api/encounters/:id', () => {
                    return HttpResponse.error();
                })
            );

            await expect(fetch('/api/encounters/encounter-1')).rejects.toThrow();
        });

        it('should handle malformed request body gracefully', async () => {
            // Override to test validation
            server.use(
                http.post('/api/encounters', async ({ request }) => {
                    try {
                        await request.json();
                        return HttpResponse.json({ id: 'test' }, { status: 201 });
                    } catch {
                        return HttpResponse.json(
                            { error: 'Invalid JSON' },
                            { status: 400 }
                        );
                    }
                })
            );

            const response = await fetch('/api/encounters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'invalid json{',
            });

            expect(response.status).toBe(400);
        });
    });
});
