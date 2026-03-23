require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Import your existing models
const Document = require('../models/Document');

// Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MONGO_URI = process.env.MONGO_URI;
const DOCUMENTS_DIR = path.resolve(__dirname, '../documents'); // Directory containing your text files
const BATCH_SIZE = 5; // Number of documents to process in parallel

if (!OPENROUTER_API_KEY || !MONGO_URI) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Configure MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/**
 * Generate embedding for text using OpenRouter
 */
async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/embeddings',
      {
        model: 'text-embedding-3-small',
        input: text,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'SED Academy',
        },
        timeout: 60000,
      }
    );

    if (!response.data || !response.data.data || !response.data.data[0]) {
      throw new Error('Invalid embedding response format');
    }

    return response.data.data[0].embedding;
  } catch (error) {
    console.error('❌ Error generating embedding:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw error;
  }
}

/**
 * Process a single file and store it in the database
 */
async function processFile(filePath) {
  try {
    const fileName = path.basename(filePath, '.txt');
    const content = await fs.readFile(filePath, 'utf-8');
    
    console.log(`📄 Processing: ${fileName}`);
    
    // Skip if document already exists
    const existingDoc = await Document.findOne({ title: fileName });
    if (existingDoc) {
      console.log(`⏩ Already exists, skipping: ${fileName}`);
      return { skipped: true, title: fileName };
    }

    // Generate embedding for the document
    console.log(`🔍 Generating embedding for: ${fileName}`);
    const embedding = await generateEmbedding(content);
    
    // Save to database
    const doc = new Document({
      title: fileName,
      content,
      embedding,
      source: path.basename(filePath),
      lastUpdated: new Date(),
    });

    await doc.save();
    console.log(`✅ Saved: ${fileName}`);
    return { success: true, title: fileName };
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error.message);
    return { error: true, title: path.basename(filePath), message: error.message };
  }
}

/**
 * Process all files in the documents directory
 */
async function processAllDocuments() {
  try {
    console.log('🚀 Starting document ingestion process...');
    
    // Check if documents directory exists
    try {
      await fs.access(DOCUMENTS_DIR);
    } catch (err) {
      console.error(`❌ Documents directory not found: ${DOCUMENTS_DIR}`);
      console.log('ℹ️  Creating documents directory...');
      await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
      console.log(`✅ Created directory: ${DOCUMENTS_DIR}`);
      console.log(`ℹ️  Please add your .txt files to this directory and run the script again.`);
      return;
    }

    // Read all text files from the directory
    const files = (await fs.readdir(DOCUMENTS_DIR))
      .filter(file => file.endsWith('.txt'))
      .map(file => path.join(DOCUMENTS_DIR, file));

    if (files.length === 0) {
      console.log(`ℹ️  No .txt files found in ${DOCUMENTS_DIR}`);
      console.log('ℹ️  Please add your text documents as .txt files to this directory.');
      return;
    }

    console.log(`📂 Found ${files.length} files to process`);

    // Process files in batches
    const results = [];
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(processFile));
      results.push(...batchResults);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Print summary
    const successCount = results.filter(r => r.success).length;
    const skippedCount = results.filter(r => r.skipped).length;
    const errorCount = results.filter(r => r.error).length;

    console.log('\n📊 Ingestion Summary:');
    console.log(`✅ Successfully processed: ${successCount} files`);
    console.log(`⏩ Skipped (already exists): ${skippedCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);

    if (errorCount > 0) {
      console.log('\n❌ Files with errors:');
      results
        .filter(r => r.error)
        .forEach((file, index) => {
          console.log(`${index + 1}. ${file.title}: ${file.message}`);
        });
    }

    console.log('\n✨ Document ingestion process completed!');
  } catch (error) {
    console.error('❌ Fatal error in document ingestion:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Start the process
db.once('open', async () => {
  console.log('🔌 Connected to MongoDB');
  await processAllDocuments();
});
