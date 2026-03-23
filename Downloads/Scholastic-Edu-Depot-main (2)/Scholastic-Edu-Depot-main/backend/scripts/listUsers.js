const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define User schema (should match your actual schema)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    isVerified: Boolean,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Function to list all users
async function listUsers() {
    try {
        console.log('Fetching users from database...');
        const users = await User.find({}).select('-password -__v');
        
        if (users.length === 0) {
            console.log('No users found in the database.');
            return;
        }

        console.log('\n=== USERS IN DATABASE ===');
        users.forEach((user, index) => {
            console.log(`\nUser ${index + 1}:`);
            console.log('------------------');
            console.log(`Name: ${user.name || 'N/A'}`);
            console.log(`Email: ${user.email || 'N/A'}`);
            console.log(`Role: ${user.role || 'N/A'}`);
            console.log(`Verified: ${user.isVerified || false}`);
            console.log(`Created: ${user.createdAt || 'N/A'}`);
        });
        console.log('\n=== END OF LIST ===');
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the function
listUsers();
