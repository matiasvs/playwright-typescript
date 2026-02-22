import { test, expect } from '@playwright/test';

test.describe('Petstore Store API Tests', () => {

    test('GET /store/inventory should return 200', async ({ request }) => {
        const response = await request.get('store/inventory');
        expect(response.status()).toBe(200);
    });

    test('POST /store/order should return 200', async ({ request }) => {
        const response = await request.post('store/order', {
            data: {
                id: 1,
                petId: 1,
                quantity: 1,
                shipDate: new Date().toISOString(),
                status: 'placed',
                complete: true
            }
        });
        expect(response.status()).toBe(200);
    });

    test('GET /store/order/{orderId} should return 200 or 404', async ({ request }) => {
        // Assuming order with ID 1 might or might not exist depending on state, 
        // but the endpoint itself is reachable. We'll test with the just-created ID if possible, 
        // but a pure status check on a known ID is also fine.
        const response = await request.get('store/order/1');
        expect([200, 404]).toContain(response.status());
    });

    test('DELETE /store/order/{orderId} should return 200 or 404', async ({ request }) => {
        // Similarly, delete an order. It might be 404 if not found, 200 if successfully deleted.
        const response = await request.delete('store/order/1');
        expect([200, 404]).toContain(response.status());
    });

});
