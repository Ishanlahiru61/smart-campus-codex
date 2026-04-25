const axios = require('axios');

async function testBooking() {
  try {
    // 1. Authenticate to get token
    const loginRes = await axios.post('http://localhost:8081/auth/login', {
      email: 'ishanlahiru813@gmail.com',
      password: 'password' // Assuming this is the password, or we need to find the auth token
    });
    console.log(loginRes.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}
testBooking();
