const { MongoClient } = require('mongodb');
require('dotenv').config();

async function clearDatabase() {
    const client = new MongoClient(process.env.MONGO_URI);
    
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully to MongoDB');
        
        const db = client.db();
        const collections = await db.listCollections().toArray();
        
        console.log('\n=== CLEARING COLLECTIONS ===');
        
        for (const collection of collections) {
            console.log(`Dropping collection: ${collection.name}`);
            await db.collection(collection.name).drop();
        }
        
        console.log('\n✅ Database cleared successfully!');
        console.log('=== DATABASE CLEARED ===\n');
        
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

// Run the function
clearDatabase();
