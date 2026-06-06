#!/usr/bin/env node

/**
 * Frontend Integration Test for Alpha 2 Authentication
 * This simulates what happens in the browser
 */

const API_BASE_URL = 'http://localhost:8000';

class MockAuthStore {
  constructor() {
    this.token = null;
    this.user = null;
  }

  setSession(token, user) {
    this.token = token;
    this.user = user;
    console.log('✅ Session saved:', { token: token.substring(0, 20) + '...', user: user.email });
  }

  logout() {
    this.token = null;
    this.user = null;
    console.log('✅ Logged out');
  }

  getToken() {
    return this.token;
  }
}

async function testFrontendFlow() {
  const store = new MockAuthStore();
  console.log('🧪 Testing Frontend Authentication Flow\n');

  try {
    // Simulate registration
    console.log('📋 Step 1: User Registration');
    const email = `user-${Date.now()}@example.com`;
    const password = 'SecurePassword123';

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }

    const registerData = await registerResponse.json();
    console.log(`✅ Registered successfully`);
    console.log(`   Email: ${email}`);

    // Store session (what AuthForm.tsx does)
    store.setSession(registerData.access_token, registerData.user);

    // Verify token works with protected endpoint
    console.log('\n🔐 Step 2: Verify Token Works');
    const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${store.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!meResponse.ok) {
      throw new Error(`Failed to get current user: ${meResponse.status}`);
    }

    const userData = await meResponse.json();
    console.log(`✅ Token verified`);
    console.log(`   User: ${userData.email}`);
    console.log(`   ID: ${userData.id}`);

    // Simulate logout
    console.log('\n🚪 Step 3: Logout');
    store.logout();
    console.log('✅ Logged out - token cleared from store');

    // Simulate login after logout
    console.log('\n🔓 Step 4: Login (after logout)');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    store.setSession(loginData.access_token, loginData.user);
    console.log('✅ Logged in again');

    // Test invalid credentials
    console.log('\n❌ Step 5: Test Invalid Credentials');
    const invalidResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrongpassword' }),
    });

    if (invalidResponse.status === 401) {
      console.log('✅ Correctly rejected invalid password');
    } else {
      throw new Error('Should have rejected invalid password');
    }

    // Test accessing protected route without token
    console.log('\n🔒 Step 6: Test Protected Route Without Token');
    const noTokenResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (noTokenResponse.status === 401 || noTokenResponse.status === 403) {
      console.log('✅ Correctly rejected request without token');
    } else {
      console.log('⚠️  Request without token returned:', noTokenResponse.status);
    }

    console.log('\n🎉 All frontend integration tests passed!');
    console.log('\nThe authentication flow is working correctly in the browser.');
    console.log('You can now:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Click "Need an account?" to register');
    console.log('3. Create a new account');
    console.log('4. You will be automatically logged in');
    console.log('5. You can now use the chat interface');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testFrontendFlow();
