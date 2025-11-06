/**
 * Quick Auth Test - Tests if user can authenticate and fetch empty memories
 */

require('dotenv').config({ path: '.env.local' });

const NEXT_URL = 'http://localhost:3000';

async function quickAuthTest() {
  console.log('🧪 Quick Authentication & Empty Data Test\n');

  try {
    // Test with existing user
    const testEmail = 'test@example.com';
    const testPassword = 'test123';

    console.log('1. Attempting to login...');
    const loginRes = await fetch(`${NEXT_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (!loginRes.ok) {
      console.log(`❌ Login failed with status: ${loginRes.status}`);
      const errorData = await loginRes.json();
      console.log('Error:', errorData);
      console.log('\n💡 Try signing up first or check your credentials');
      return;
    }

    const loginData = await loginRes.json();
    console.log('✅ Login successful!');
    
    const accessToken = loginData.session.access_token;

    // Test fetching memories
    console.log('\n2. Fetching memories...');
    const memoriesRes = await fetch(`${NEXT_URL}/api/memories`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log(`Response status: ${memoriesRes.status}`);

    if (!memoriesRes.ok) {
      console.log('❌ Failed to fetch memories');
      const errorData = await memoriesRes.json();
      console.log('Error:', errorData);
      return;
    }

    const memoriesData = await memoriesRes.json();
    console.log('✅ Successfully fetched memories!');
    console.log(`Found ${memoriesData.memories.length} memories`);

    if (memoriesData.memories.length === 0) {
      console.log('\n📝 No memories yet - this is expected for a new user!');
      console.log('✅ The app correctly handles empty data');
    } else {
      console.log('\nMemories:');
      memoriesData.memories.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.title} (${m.date})`);
      });
    }

    console.log('\n✅ All tests passed!');
    console.log('The frontend should now display "No Memories Yet" instead of an error.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('⚠️  Make sure Next.js dev server is running on http://localhost:3000\n');
quickAuthTest();
