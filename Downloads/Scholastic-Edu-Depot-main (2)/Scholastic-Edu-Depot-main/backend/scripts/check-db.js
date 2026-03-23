require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Document = require('../models/Document');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check document count
    const count = await Document.countDocuments();
    console.log(`📊 Total documents in collection: ${count}`);

    // Check if any documents have embeddings
    const docWithEmbedding = await Document.findOne({ embedding: { $exists: true, $ne: null } });
    console.log(`🔍 Documents with embeddings: ${docWithEmbedding ? 'Yes' : 'No'}`);

    // Check indexes
    const indexes = await Document.collection.indexes();
    console.log('\n🔍 Existing Indexes:');
    console.log(JSON.stringify(indexes, null, 2));

    // Check if vector search works
    if (count > 0) {
      console.log('\n🔍 Testing vector search...');
      const testEmbedding = Array(1536).fill(0); // Dummy embedding
      try {
        const results = await Document.aggregate([
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector: testEmbedding,
              numCandidates: 10,
              limit: 1
            }
          }
        ]);
        console.log(`✅ Vector search test successful. Found ${results.length} documents.`);
      } catch (error) {
        console.error('❌ Vector search error:', error.message);
        if (error.message.includes('index not found')) {
          console.log('\n❌ The vector index does not exist. You need to create it in MongoDB Atlas.');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDatabase();
