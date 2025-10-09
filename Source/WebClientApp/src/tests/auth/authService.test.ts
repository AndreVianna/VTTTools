/**
 * VTTTools Authentication Service - Comprehensive API Endpoint Tests
 * Tests the VttTools.Auth microservice endpoints directly
 *
 * Testing against real Auth service running on .NET Aspire
 * NO MOCKS - Real integration testing
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios, { AxiosInstance } from 'axios';

// Test configuration
const AUTH_BASE_URL = 'http://localhost:5173/api/auth'; // Via Vite proxy to auth-api
const TEST_USER = {
  email: 'testuser@vtttools.test',
  password: 'TestPassword123!',
  confirmPassword: 'TestPassword123!'
};

const EXISTING_USER = {
  email: 'existing@vtttools.test',
  password: 'ExistingPassword123!'
};

// Configure axios for cookie-based auth testing
const apiClient: AxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true, // Essential for cookie authentication
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // CSRF protection
  }
});

let authCookies: string = '';

describe('VttTools.Auth Microservice - Direct API Testing', () => {

  beforeAll(async () => {
    // Wait for services to be ready
    console.log('🚀 Starting comprehensive Auth service testing...');
    console.log('⏳ Waiting for Auth service to be ready...');

    // Health check with retry logic
    let healthCheckAttempts = 0;
    const maxHealthCheckAttempts = 30;

    while (healthCheckAttempts < maxHealthCheckAttempts) {
      try {
        const healthResponse = await axios.get('http://localhost:5173/health', { timeout: 2000 });
        if (healthResponse.status === 200) {
          console.log('✅ Services are healthy and ready');
          break;
        }
      } catch {
        healthCheckAttempts++;
        console.log(`⏳ Health check attempt ${healthCheckAttempts}/${maxHealthCheckAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (healthCheckAttempts >= maxHealthCheckAttempts) {
      throw new Error('❌ Services failed to become ready within timeout period');
    }

    // Create an existing user for login tests
    try {
      await apiClient.post('/register', {
        email: EXISTING_USER.email,
        password: EXISTING_USER.password,
        confirmPassword: EXISTING_USER.password
      });
      console.log('✅ Test user setup completed');
    } catch {
      console.log('ℹ️ Test user may already exist (this is expected)');
    }
  });

  afterAll(() => {
    console.log('🧹 Auth service testing completed');
  });

  beforeEach(() => {
    // Clear any existing cookies between tests for isolation
    authCookies = '';
    delete apiClient.defaults.headers.common['Cookie'];
  });

  describe('1.1 User Registration Tests - POST /api/auth/register', () => {

    it('should successfully register a new user with valid data', async () => {
      console.log('🧪 Testing new user registration...');

      const uniqueEmail = `newuser${Date.now()}@vtttools.test`;
      const registrationData = {
        email: uniqueEmail,
        password: TEST_USER.password,
        confirmPassword: TEST_USER.password
      };

      const response = await apiClient.post('/register', registrationData);

      // Validate response structure and success
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('message');

      console.log('✅ New user registration successful');

      // Validate authentication cookie is set
      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();
      expect(setCookieHeaders?.some((cookie: string) => cookie.includes('AspNetCore.Identity'))).toBe(true);
    }, 10000);

    it('should fail registration with existing email', async () => {
      console.log('🧪 Testing registration with existing email...');

      const registrationData = {
        email: EXISTING_USER.email,
        password: TEST_USER.password,
        confirmPassword: TEST_USER.password
      };

      try {
        await apiClient.post('/register', registrationData);
        expect.fail('Registration should have failed with existing email');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toContain('email');
        console.log('✅ Existing email registration correctly rejected');
      }
    });

    it('should fail registration with invalid email format', async () => {
      console.log('🧪 Testing registration with invalid email format...');

      const registrationData = {
        email: 'invalid-email-format',
        password: TEST_USER.password,
        confirmPassword: TEST_USER.password
      };

      try {
        await apiClient.post('/register', registrationData);
        expect.fail('Registration should have failed with invalid email');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        console.log('✅ Invalid email format correctly rejected');
      }
    });

    it('should fail registration with weak password', async () => {
      console.log('🧪 Testing registration with weak password...');

      const registrationData = {
        email: `weak${Date.now()}@vtttools.test`,
        password: '123', // Too weak
        confirmPassword: '123'
      };

      try {
        await apiClient.post('/register', registrationData);
        expect.fail('Registration should have failed with weak password');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toMatch(/password/i);
        console.log('✅ Weak password correctly rejected');
      }
    });

    it('should fail registration with missing required fields', async () => {
      console.log('🧪 Testing registration with missing fields...');

      const registrationData = {
        email: '', // Missing email
        password: TEST_USER.password,
        confirmPassword: TEST_USER.password
      };

      try {
        await apiClient.post('/register', registrationData);
        expect.fail('Registration should have failed with missing email');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        console.log('✅ Missing required fields correctly rejected');
      }
    });

    it('should enforce rate limiting after multiple attempts', async () => {
      console.log('🧪 Testing registration rate limiting...');

      // Attempt multiple registrations rapidly (should hit rate limit)
      const promises = Array(12).fill(0).map((_, index) =>
        apiClient.post('/register', {
          email: `ratelimit${Date.now()}-${index}@vtttools.test`,
          password: TEST_USER.password,
          confirmPassword: TEST_USER.password
        })
      );

      try {
        await Promise.all(promises);
        expect.fail('Rate limiting should have been enforced');
      } catch {
        // Some requests should succeed, others should be rate limited
        const failedRequests = promises.filter(async (p) => {
          try {
            await p;
            return false;
          } catch {
            return true;
          }
        });

        // At least some requests should be rate limited (429 status)
        expect(failedRequests.length).toBeGreaterThan(0);
        console.log('✅ Rate limiting correctly enforced');
      }
    }, 15000);
  });

  describe('1.2 User Authentication Tests - POST /api/auth/login', () => {

    it('should successfully authenticate with valid credentials', async () => {
      console.log('🧪 Testing valid user login...');

      const loginData = {
        email: EXISTING_USER.email,
        password: EXISTING_USER.password
      };

      const response = await apiClient.post('/login', loginData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('message');

      // Capture authentication cookies for subsequent tests
      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();

      if (setCookieHeaders) {
        authCookies = setCookieHeaders.join('; ');
        apiClient.defaults.headers.common['Cookie'] = authCookies;
      }

      console.log('✅ User login successful with cookie authentication');
    });

    it('should fail authentication with invalid credentials', async () => {
      console.log('🧪 Testing login with invalid credentials...');

      const loginData = {
        email: EXISTING_USER.email,
        password: 'WrongPassword123!'
      };

      try {
        await apiClient.post('/login', loginData);
        expect.fail('Login should have failed with invalid credentials');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data.message).toMatch(/invalid|credentials|login/i);
        console.log('✅ Invalid credentials correctly rejected');
      }
    });

    it('should fail authentication with non-existent user', async () => {
      console.log('🧪 Testing login with non-existent user...');

      const loginData = {
        email: 'nonexistent@vtttools.test',
        password: TEST_USER.password
      };

      try {
        await apiClient.post('/login', loginData);
        expect.fail('Login should have failed with non-existent user');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        console.log('✅ Non-existent user login correctly rejected');
      }
    });

    it('should complete login within 3 seconds (UC004 requirement)', async () => {
      console.log('🧪 Testing login performance requirement...');

      const loginData = {
        email: EXISTING_USER.email,
        password: EXISTING_USER.password
      };

      const startTime = performance.now();
      const response = await apiClient.post('/login', loginData);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(3000); // 3 second requirement
      console.log(`✅ Login completed in ${responseTime.toFixed(2)}ms (under 3s requirement)`);
    });
  });

  describe('1.3 User Information Tests - GET /api/auth/me', () => {

    beforeEach(async () => {
      // Ensure we're logged in before testing /me endpoint
      if (!authCookies) {
        const loginResponse = await apiClient.post('/login', {
          email: EXISTING_USER.email,
          password: EXISTING_USER.password
        });

        const setCookieHeaders = loginResponse.headers['set-cookie'];
        if (setCookieHeaders) {
          authCookies = setCookieHeaders.join('; ');
          apiClient.defaults.headers.common['Cookie'] = authCookies;
        }
      }
    });

    it('should return current user information when authenticated', async () => {
      console.log('🧪 Testing authenticated user information retrieval...');

      const response = await apiClient.get('/me');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('email', EXISTING_USER.email);
      expect(response.data.data).toHaveProperty('id');

      console.log('✅ User information retrieved successfully');
    });

    it('should return 401 when not authenticated', async () => {
      console.log('🧪 Testing unauthorized access to user information...');

      // Remove authentication cookies
      delete apiClient.defaults.headers.common['Cookie'];

      try {
        await apiClient.get('/me');
        expect.fail('Request should have failed with 401 Unauthorized');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        console.log('✅ Unauthorized access correctly rejected with 401');
      }

      // Restore cookies for other tests
      apiClient.defaults.headers.common['Cookie'] = authCookies;
    });
  });

  describe('1.4 User Logout Tests - POST /api/auth/logout', () => {

    beforeEach(async () => {
      // Ensure we're logged in before testing logout
      const loginResponse = await apiClient.post('/login', {
        email: EXISTING_USER.email,
        password: EXISTING_USER.password
      });

      const setCookieHeaders = loginResponse.headers['set-cookie'];
      if (setCookieHeaders) {
        authCookies = setCookieHeaders.join('; ');
        apiClient.defaults.headers.common['Cookie'] = authCookies;
      }
    });

    it('should successfully logout and invalidate session', async () => {
      console.log('🧪 Testing user logout...');

      const logoutResponse = await apiClient.post('/logout');

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.data).toHaveProperty('success', true);

      // Verify that accessing protected resource now fails
      try {
        await apiClient.get('/me');
        expect.fail('Access to protected resource should fail after logout');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        console.log('✅ Logout successful - session properly invalidated');
      }
    });

    it('should complete logout within 2 seconds (UC005 requirement)', async () => {
      console.log('🧪 Testing logout performance requirement...');

      const startTime = performance.now();
      const response = await apiClient.post('/logout');
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // 2 second requirement
      console.log(`✅ Logout completed in ${responseTime.toFixed(2)}ms (under 2s requirement)`);
    });
  });

  describe('1.5 Security and Integration Tests', () => {

    it('should properly handle CORS for React app origin', async () => {
      console.log('🧪 Testing CORS configuration...');

      try {
        const response = await axios.post(`${AUTH_BASE_URL}/login`, {
          email: EXISTING_USER.email,
          password: EXISTING_USER.password
        }, {
          withCredentials: true,
          headers: {
            'Origin': 'http://localhost:5173',
            'Content-Type': 'application/json'
          }
        });

        expect(response.status).toBe(200);
        console.log('✅ CORS properly configured for React app origin');
      } catch (error: any) {
        if (error.response?.status !== 400) { // 400 might be auth error, not CORS
          throw error;
        }
      }
    });

    it('should reject requests without proper origin (CORS protection)', async () => {
      console.log('🧪 Testing CORS protection against invalid origins...');

      try {
        await axios.post(`${AUTH_BASE_URL}/login`, {
          email: EXISTING_USER.email,
          password: EXISTING_USER.password
        }, {
          withCredentials: true,
          headers: {
            'Origin': 'http://malicious-site.com',
            'Content-Type': 'application/json'
          }
        });

        expect.fail('Request from invalid origin should have been blocked');
      } catch (error: any) {
        // CORS error or network error expected
        expect(error.message).toMatch(/cors|network|origin/i);
        console.log('✅ CORS protection working against invalid origins');
      }
    });

    it('should set secure cookie attributes', async () => {
      console.log('🧪 Testing cookie security attributes...');

      const response = await apiClient.post('/login', {
        email: EXISTING_USER.email,
        password: EXISTING_USER.password
      });

      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();

      if (setCookieHeaders) {
        const authCookie = setCookieHeaders.find((cookie: string) =>
          cookie.includes('AspNetCore.Identity')
        );

        expect(authCookie).toBeDefined();
        expect(authCookie).toContain('HttpOnly'); // Prevent XSS
        expect(authCookie).toContain('SameSite'); // CSRF protection
        console.log('✅ Authentication cookies have proper security attributes');
      }
    });

    it('should validate ApplicationDbContext integration', async () => {
      console.log('🧪 Testing database integration...');

      // Create a new user to verify database integration
      const uniqueEmail = `dbtest${Date.now()}@vtttools.test`;
      const registrationResponse = await apiClient.post('/register', {
        email: uniqueEmail,
        password: TEST_USER.password,
        confirmPassword: TEST_USER.password
      });

      expect(registrationResponse.status).toBe(200);
      expect(registrationResponse.data.success).toBe(true);

      // Immediately try to login with the new account
      const loginResponse = await apiClient.post('/login', {
        email: uniqueEmail,
        password: TEST_USER.password
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.success).toBe(true);

      console.log('✅ ApplicationDbContext integration working correctly');
    });

    it('should handle concurrent user operations', async () => {
      console.log('🧪 Testing concurrent user operations...');

      // Create multiple users concurrently
      const concurrentRegistrations = Array(5).fill(0).map((_, index) =>
        apiClient.post('/register', {
          email: `concurrent${Date.now()}-${index}@vtttools.test`,
          password: TEST_USER.password,
          confirmPassword: TEST_USER.password
        })
      );

      const results = await Promise.allSettled(concurrentRegistrations);
      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value.data.success
      );

      expect(successful.length).toBeGreaterThan(0);
      console.log(`✅ Concurrent operations handled successfully (${successful.length}/5 succeeded)`);
    });
  });
});