import { test, expect } from '@playwright/test';

test.describe('Petstore User API Tests', () => {

    const username = 'testuser_' + Date.now();
    const password = 'password123';

    const userData = {
        id: Math.floor(Math.random() * 10000),
        username: username,
        firstName: "Test",
        lastName: "User",
        email: "testuser@example.com",
        password: password,
        phone: "1234567890",
        userStatus: 1
    };

    test('POST /user should return 200', async ({ request }) => {
        const response = await request.post('user', {
            data: userData
        });
        expect(response.status()).toBe(200);//test reporte online
    });

    test('GET /user/login should return 200', async ({ request }) => {
        const response = await request.get(`user/login?username=${username}&password=${password}`);
        expect(response.status()).toBe(200);
    });

    test('GET /user/{username} should return 200', async ({ request }) => {
        const response = await request.get(`user/${username}`);
        expect(response.status()).toBe(200);
    });

    test('PUT /user/{username} should return 200', async ({ request }) => {
        const updatedData = { ...userData, firstName: "UpdatedName" };
        const response = await request.put(`user/${username}`, {
            data: updatedData
        });
        expect(response.status()).toBe(200);
    });

    test('GET /user/logout should return 200', async ({ request }) => {
        const response = await request.get('user/logout');
        expect(response.status()).toBe(200);
    });

    test('POST /user/createWithArray should return 200', async ({ request }) => {
        const response = await request.post('user/createWithArray', {
            data: [userData]
        });
        expect(response.status()).toBe(200);
    });

    test('POST /user/createWithList should return 200', async ({ request }) => {
        const response = await request.post('user/createWithList', {
            data: [userData]
        });
        expect(response.status()).toBe(200);
    });

    test('DELETE /user/{username} should return 200 or 404', async ({ request }) => {
        const response = await request.delete(`user/${username}`);
        expect([200, 404]).toContain(response.status());
    });

});
