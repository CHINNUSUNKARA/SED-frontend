const axios = require('axios');

async function verifyAiChat() {
    try {
        console.log('0. Checking Server Health...');
        try {
            const health = await axios.get('http://localhost:5000/api/test');
            console.log('Server is UP:', health.data.message);
        } catch (e) {
            console.error('Server Health Check Failed:', e.message);
            return;
        }

        console.log('1. Fetching CSRF Token...');
        const csrfResponse = await axios.get('http://localhost:5000/api/auth/csrf-token');
        const csrfToken = csrfResponse.data.csrfToken;

        // Extract cookies from response headers
        const cookies = csrfResponse.headers['set-cookie'];
        console.log('CSRF Token received:', csrfToken);
        console.log('Cookies received:', cookies);

        console.log('2. Sending Chat Message...');
        const response = await axios.post('http://localhost:5000/api/ai/chat',
            { message: 'What courses do you offer?' },
            {
                headers: {
                    'X-XSRF-TOKEN': csrfToken,
                    'Cookie': cookies.join('; ') // Send back the cookies
                }
            }
        );

        console.log('3. AI Response received:');
        console.log(response.data);
        console.log('SUCCESS: AI Chat endpoint is working!');
    } catch (error) {
        console.log('--- ERROR DETAILS ---');
        console.log('Message:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('No response received');
            console.log('Stack:', error.stack);
        }
        console.log('---------------------');
    }
}

verifyAiChat();
