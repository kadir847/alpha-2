#!/usr/bin/env node

/**
 * Debug script to test login and identify issues
 * Run this from the terminal: node debug-auth-issue.js
 */

const API_BASE_URL = 'http://localhost:8000';

async function debugLogin(email, password) {
  console.log(`\n🔍 Testing login with email: ${email}`);
  console.log(`   Password length: ${password.length} characters`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(`📊 HTTP Status: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    console.log(`📝 Content-Type: ${contentType}`);

    const data = await response.json();
    
    if (!response.ok) {
      console.log(`❌ Login failed with status ${response.status}`);
      console.log(`📋 Error response:`, JSON.stringify(data, null, 2));
      return false;
    }
    
    console.log(`✅ Login successful!`);
    console.log(`🔑 Token (first 50 chars): ${data.access_token.substring(0, 50)}...`);
    console.log(`👤 User: ${data.user.email}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Network error: ${error.message}`);
    return false;
  }
}

async function testRegistrationAndLogin(email, password) {
  console.log(`\n\n🧪 Test: Registration + Login Flow`);
  console.log(`================================================`);
  
  // Test registration
  console.log(`\n1️⃣  Testing Registration:`);
  try {
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const registerData = await registerResponse.json();
    
    if (!registerResponse.ok) {
      console.log(`❌ Registration failed: ${registerData.detail || 'Unknown error'}`);
      return false;
    }
    
    console.log(`✅ Registration successful`);
  } catch (error) {
    console.error(`❌ Registration network error: ${error.message}`);
    return false;
  }
  
  // Test login
  console.log(`\n2️⃣  Testing Login (immediately after registration):`);
  const loginSuccess = await debugLogin(email, password);
  
  return loginSuccess;
}

async function main() {
  console.log('🔧 Alpha 2 Authentication Debugger');
  console.log('===================================');
  console.log(`Backend URL: ${API_BASE_URL}`);
  
  // Test 1: Try logging in with existing test user
  console.log(`\n\n📌 Test 1: Login with existing user`);
  console.log(`-----------------------------------`);
  const test1 = await debugLogin('test@example.com', 'password123');
  
  // Test 2: Try with a new account (register + login)
  console.log(`\n\n📌 Test 2: New account (register + login)`);
  console.log(`-----------------------------------------`);
  const newEmail = `debug-${Date.now()}@example.com`;
  const newPassword = 'TestPassword123';
  const test2 = await testRegistrationAndLogin(newEmail, newPassword);
  
  // Test 3: Try with invalid password
  console.log(`\n\n📌 Test 3: Login with invalid password`);
  console.log(`--------------------------------------`);
  const test3 = await debugLogin('test@example.com', 'wrongpassword123');
  
  // Summary
  console.log(`\n\n📋 SUMMARY`);
  console.log(`==========`);
  console.log(`Test 1 (Existing user):    ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (New user):         ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Invalid password): ${!test3 ? '✅ PASS (correctly rejected)' : '❌ FAIL (should reject)'}`);
  
  if (test1 && test2 && !test3) {
    console.log(`\n✨ All tests passed! Backend authentication is working.`);
    console.log(`\n💡 If you're still getting "Authentication failed" in the browser:`);
    console.log(`   1. Open DevTools (F12) and check the Console tab`);
    console.log(`   2. Look for error logs with details about what went wrong`);
    console.log(`   3. Check if you entered the correct email/password`);
    console.log(`   4. Try creating a new account first before logging in`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the errors above.`);
  }
}

main().catch(console.error);
