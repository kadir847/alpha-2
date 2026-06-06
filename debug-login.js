// Add this to browser console (F12) to see detailed auth errors
const testLogin = async () => {
  try {
    console.log('🔍 Testing login with detailed error reporting...\n');
    
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:');
    response.headers.forEach((value, key) => {
      if (key.includes('access-control') || key.includes('content')) {
        console.log(`  ${key}: ${value}`);
      }
    });

    const data = await response.json();
    console.log('\n📄 Response Body:', data);
    
    if (!response.ok) {
      console.error('❌ Error:', data);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('🔑 Token:', data.access_token.substring(0, 30) + '...');
    
  } catch (error) {
    console.error('❌ Network Error:', error);
    console.error('   Message:', error.message);
    console.error('   Type:', error.constructor.name);
  }
};

testLogin();
