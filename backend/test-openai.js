// test-openai.js - Test OpenAI Connection
const OpenAI = require('openai');
require('dotenv').config();

console.log('🔑 API Key exists?', process.env.OPENAI_API_KEY ? '✅ Yes' : '❌ No');
console.log('API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'None');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
    try {
        console.log('\n📡 Sending test question to OpenAI...');

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: "Explain quantum physics in one short sentence"
                }
            ],
            max_tokens: 100,
        });

        console.log('✅ SUCCESS! OpenAI is working!');
        console.log('Response:', completion.choices[0].message.content);

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Full error:', error);
    }
}

testOpenAI();