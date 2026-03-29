import axios from 'axios';

const token = 'YOUR_TEST_TOKEN'; // Need to get this from a real login or seed
const API_URL = 'http://localhost:5000/api';

async function testDailyQuiz() {
    try {
        const res = await axios.post(`${API_URL}/rpg/daily-quiz`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

// testDailyQuiz();
