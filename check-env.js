const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log('.env file found at:', envPath);
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error('Error loading .env file:', result.error);
    } else {
        console.log('.env file loaded successfully');
        console.log('FAL_KEY present:', !!process.env.FAL_KEY);
        if (process.env.FAL_KEY) {
            console.log('FAL_KEY length:', process.env.FAL_KEY.length);
            console.log('FAL_KEY starts with:', process.env.FAL_KEY.substring(0, 4) + '...');
        }
    }
} else {
    console.error('.env file NOT found at:', envPath);
}
