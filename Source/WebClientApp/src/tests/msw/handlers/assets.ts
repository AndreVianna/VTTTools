import { http, HttpResponse } from 'msw';

export const assetsHandlers = [
    // Get assets list
    http.get('/api/assets', ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get('type');

        const assets = [
            { id: 'asset-1', name: 'Dragon', type: 'creature', ownerId: 'test-user-id' },
            { id: 'asset-2', name: 'Goblin', type: 'creature', ownerId: 'test-user-id' },
            { id: 'asset-3', name: 'Magic Sword', type: 'item', ownerId: 'test-user-id' },
        ];

        const filtered = type ? assets.filter(a => a.type === type) : assets;
        return HttpResponse.json(filtered);
    }),

    // Get single asset
    http.get('/api/assets/:id', ({ params }) => {
        const { id } = params;
        if (id === 'not-found') {
            return HttpResponse.json({ error: 'Asset not found' }, { status: 404 });
        }
        return HttpResponse.json({
            id,
            name: 'Test Asset',
            type: 'creature',
            ownerId: 'test-user-id',
        });
    }),

    // Create asset
    http.post('/api/assets', async ({ request }) => {
        const body = await request.json() as { name: string; type: string };
        return HttpResponse.json({
            id: `asset-${Date.now()}`,
            ...body,
            ownerId: 'test-user-id',
        }, { status: 201 });
    }),

    // Update asset
    http.patch('/api/assets/:id', async ({ params, request }) => {
        const { id } = params;
        const body = await request.json() as Record<string, unknown>;
        return HttpResponse.json({
            id,
            name: 'Test Asset',
            type: 'creature',
            ownerId: 'test-user-id',
            ...body,
        });
    }),

    // Delete asset
    http.delete('/api/assets/:id', () => {
        return new HttpResponse(null, { status: 204 });
    }),
];
