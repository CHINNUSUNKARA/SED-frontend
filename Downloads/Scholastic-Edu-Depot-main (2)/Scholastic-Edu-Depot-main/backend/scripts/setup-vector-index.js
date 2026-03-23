require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { QdrantClient } = require('qdrant-client');

/**
 * This script uploads existing document embeddings from MongoDB into Qdrant.
 * Requirements:
 * - Set QDRANT_URL and (optionally) QDRANT_API_KEY in .env
 * - Documents must have `embedding` field populated
 */
async function setupVectorIndex() {
  const QDRANT_URL = process.env.QDRANT_URL;
  const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
  const COLLECTION = process.env.RAG_COLLECTION_NAME || 'sed_documents';

  if (!QDRANT_URL) {
    console.error('❌ QDRANT_URL not set. To use Qdrant, set QDRANT_URL and optionally QDRANT_API_KEY in .env');
    console.error('If you prefer MongoDB Atlas vector search, follow Atlas docs instead.');
    process.exit(1);
  }

  const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Recreate Qdrant collection (will delete existing data)
    console.log(`🔄 Recreating Qdrant collection "${COLLECTION}" with vector size 1536 (cosine)`);
    await qdrant.recreateCollection({
      collection_name: COLLECTION,
      vectors: { size: 1536, distance: 'Cosine' }
    });

    // Read documents from MongoDB and upsert to Qdrant in batches
    const cursor = Document.find().select('+embedding').lean().cursor();
    const BATCH = 100;
    let batch = [];
    let count = 0;

    for await (const doc of cursor) {
      if (!doc.embedding || !Array.isArray(doc.embedding)) continue;

      batch.push({ id: doc._id.toString(), vector: doc.embedding, payload: { title: doc.title, source: doc.source || null } });
      if (batch.length >= BATCH) {
        await qdrant.upsert({ collection_name: COLLECTION, points: batch });
        count += batch.length;
        console.log(`🔁 Upserted ${count} vectors...`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await qdrant.upsert({ collection_name: COLLECTION, points: batch });
      count += batch.length;
      console.log(`🔁 Upserted ${count} vectors (final)`);
      batch = [];
    }

    console.log(`✅ Done. Uploaded ${count} vectors to Qdrant collection "${COLLECTION}"`);
  } catch (err) {
    console.error('❌ Error during Qdrant setup:', err.message || err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

setupVectorIndex();
