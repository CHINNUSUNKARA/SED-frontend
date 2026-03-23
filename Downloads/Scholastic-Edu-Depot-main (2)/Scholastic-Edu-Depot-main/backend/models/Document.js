const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    index: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  embedding: { 
    type: [Number], 
    required: true,
    select: false // Don't include embeddings in query results by default
  },
  source: { 
    type: String 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Create a vector index for similarity search
documentSchema.index({ embedding: '2dsphere' });

// Static method for similarity search
documentSchema.statics.findSimilar = async function(embedding, limit = 5) {
  return this.aggregate([
    {
      $vectorSearch: {
        queryVector: embedding,
        path: 'embedding',
        numCandidates: 100,
        limit: limit,
        index: 'vector_index'
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        source: 1,
        lastUpdated: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ]);
};

// Text index for full-text search
documentSchema.index({ 
  title: 'text', 
  content: 'text' 
}, {
  weights: {
    title: 10,
    content: 5
  },
  name: 'text_search_index'
});

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

module.exports = Document;
