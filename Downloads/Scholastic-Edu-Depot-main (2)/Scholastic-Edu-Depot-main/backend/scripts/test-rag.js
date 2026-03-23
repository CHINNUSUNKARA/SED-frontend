// Load environment variables from the root .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ragService = require('../services/ragService');

// Connect to MongoDB
async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if connection is successful
    const db = mongoose.connection;
    db.on('error', (err) => console.error('❌ MongoDB connection error:', err));
    db.once('open', () => console.log('✅ Connected to MongoDB'));
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('💡 Make sure:');
    console.log('1. Your MongoDB server is running');
    console.log('2. MONGO_URI in .env is correct');
    console.log('3. The connection string includes authentication if required');
    process.exit(1);
  }
}

// Test RAG pipeline
async function testRag(query) {
  try {
    console.log(`\n🔍 Testing RAG with query: "${query}"`);
    
    // 1. Generate embedding for the query
    console.log('\n1️⃣ Generating embedding...');
    const embedding = await ragService.generateEmbedding(query);
    console.log(`   ✅ Generated embedding (${embedding.length} dimensions)`);
    
    // 2. Find relevant documents using vector search
    console.log('\n2️⃣ Searching for relevant documents...');
    const relevantDocs = await ragService.queryChroma(embedding);
    
    if (relevantDocs.length === 0) {
      console.log('   ℹ️ No relevant documents found');
    } else {
      console.log(`   ✅ Found ${relevantDocs.length} relevant documents:`);
      relevantDocs.forEach((doc, i) => {
        console.log(`      ${i + 1}. ${doc.source || 'Untitled'} (${doc.content.substring(0, 50)}...)`);
        if (doc.score) {
          console.log(`         Score: ${doc.score.toFixed(4)}`);
        }
      });
    }
    
    // 3. Generate response using the context
    console.log('\n3️⃣ Generating response with context...');
    const response = await ragService.chatWithOllama(query, relevantDocs.map(doc => doc.content));
    
    console.log('\n🎯 Response:');
    console.log('----------------------------------------');
    console.log(response);
    console.log('----------------------------------------');
    
    return { success: true, response, relevantDocs };
  } catch (error) {
    console.error('❌ RAG test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  // Get query from command line arguments or use a default
  const query = process.argv[2] || 'What is SED Academy about?';
  
  console.log('🚀 Starting RAG Test 🚀');
  console.log('=======================');
  
  await connectDB();
  await testRag(query);
  
  // Close the connection
  await mongoose.connection.close();
  console.log('\n✅ Test completed. Database connection closed.');
}

// Run the test
main().catch(console.error);
