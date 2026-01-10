import { http, HttpResponse } from 'msw';
import { TEST_USER_ID, TEST_USER_EMAIL, TEST_USER_NAME, createMockUser } from '@/tests/utils/mockFactories';

export const authHandlers = [
    // Get current user
    http.get('/api/auth/me', () => {
        return HttpResponse.json(createMockUser());
    }),

    // Login
    http.post('/api/auth/login', async ({ request }) => {
        const body = await request.json() as { email: string; password: string };
        if (body.email === TEST_USER_EMAIL && body.password === 'password') {
            return HttpResponse.json({
                id: TEST_USER_ID,
                email: TEST_USER_EMAIL,
                userName: TEST_USER_NAME,
            });
        }
        return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }),

    // Logout
    http.post('/api/auth/logout', () => {
        return new HttpResponse(null, { status: 204 });
    }),

    // Register
    http.post('/api/auth/register', async ({ request }) => {
        const body = await request.json() as { email: string; password: string; userName: string };
        return HttpResponse.json({
            id: 'new-user-id',
            email: body.email,
            userName: body.userName,
        }, { status: 201 });
    }),
];
