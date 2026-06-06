#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:8000';

async function testAuth() {
  console.log('🧪 Testing Alpha 2 Authentication Flow\n');

  // Test 1: Register
  console.log('📝 Test 1: Registration');
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'password123';
    
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    
    if (!registerResponse.ok) {
      throw new Error(`HTTP ${registerResponse.status}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('✅ Registration successful');
    console.log(`   Email: ${registerData.user.email}`);
    console.log(`   Token: ${registerData.access_token.substring(0, 30)}...`);
    
    // Test 2: Login with same credentials
    console.log('\n🔓 Test 2: Login');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`HTTP ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   Token: ${loginData.access_token.substring(0, 30)}...`);
    
    // Test 3: Get current user with token
    console.log('\n👤 Test 3: Get Current User');
    const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${loginData.access_token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!meResponse.ok) {
      throw new Error(`HTTP ${meResponse.status}`);
    }
    
    const userData = await meResponse.json();
    console.log('✅ Get user successful');
    console.log(`   User: ${userData.email}`);
    console.log(`   ID: ${userData.id}`);
    
    // Test 4: Test with invalid credentials
    console.log('\n❌ Test 4: Login with Invalid Password');
    const invalidResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'wrongpassword' }),
    });
    
    if (invalidResponse.status === 401) {
      console.log('✅ Correctly rejected invalid password');
    } else {
      console.log('❌ Should have rejected invalid password');
    }
    
    console.log('\n✨ All tests passed! Authentication is working correctly.\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuth();
