const axios = require('axios');

// Try to load Qdrant client, but make it optional
let QdrantClient = null;
let qdrantClient = null;

try {
	QdrantClient = require('qdrant-client').QdrantClient;
	console.log('✅ Qdrant client module loaded');
} catch (e) {
	// Silently fall back to MongoDB - Qdrant is optional
}

// ============================================
// OPENROUTER CONFIGURATION (ONLY)
// ============================================
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const CHAT_MODEL = process.env.CHAT_MODEL || 'meta-llama/llama-3.1-70b-instruct';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small';
const RAG_COLLECTION_NAME = process.env.RAG_COLLECTION_NAME || 'sed_documents';
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION = process.env.RAG_COLLECTION_NAME || 'sed_documents';

// Initialize Qdrant client only if the module is available and URL is configured
if (QdrantClient && QDRANT_URL) {
	try {
		qdrantClient = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });
		console.log('🔗 Qdrant client initialized:', QDRANT_URL);
	} catch (e) {
		console.warn('⚠️ Failed to initialize Qdrant client:', e.message);
		qdrantClient = null;
	}
}

// Validate OpenRouter API Key exists (warn but don't exit)
if (!OPENROUTER_API_KEY) {
	console.warn('⚠️ WARNING: OPENROUTER_API_KEY is not set in .env file');
	console.warn('   AI chat will use fallback responses only.');
	console.warn('   To enable AI features, add: OPENROUTER_API_KEY=sk-or-v1-...');
}

// Create OpenRouter axios client
const openrouterClient = axios.create({
	baseURL: OPENROUTER_BASE_URL,
	timeout: 60000,
	headers: {
		'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
		'HTTP-Referer': 'http://localhost:3000',
		'X-Title': 'SED Academy',
		'Content-Type': 'application/json'
	}
});

const ragService = {
	/**
	 * Generate embeddings using OpenRouter
	 */
	generateEmbedding: async (text) => {
		try {
			console.log(`📊 Generating embedding for text (${text.length} chars)...`);

			const requestConfig = {
				url: `${OPENROUTER_BASE_URL}/embeddings`,
				method: 'post',
				data: {
					model: EMBEDDING_MODEL,
					input: text
				},
				headers: {
					'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
					'Content-Type': 'application/json',
					'HTTP-Referer': 'http://localhost:3000',
					'X-Title': 'SED Academy'
				},
				timeout: 60000
			};

			console.log('Sending request to OpenRouter:', JSON.stringify({
				url: requestConfig.url,
				model: requestConfig.data.model,
				input_length: requestConfig.data.input.length
			}, null, 2));

			const response = await axios(requestConfig);

			if (!response.data || !response.data.data || !response.data.data[0]) {
				console.error('❌ Invalid embedding response format:', JSON.stringify(response.data, null, 2));
				throw new Error('Invalid embedding response format');
			}

			console.log('✅ Embedding generated successfully');
			return response.data.data[0].embedding;
		} catch (error) {
			console.error('❌ Embedding Error:', {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data
			});
			throw new Error(`Failed to generate embedding: ${error.message}`);
		}
	},

	/**
	 * Query vector DB (Qdrant) for relevant context, fall back to MongoDB Atlas vector search if available
	 */
	queryChroma: async (embedding) => {
		try {
			const Document = require('../models/Document');

			// If Qdrant is configured, use it for vector search
			if (qdrantClient) {
				console.log('🔍 Querying Qdrant for nearest neighbors...');
				const searchResult = await qdrantClient.search({
					collectionName: QDRANT_COLLECTION,
					vector: embedding,
					top: 5
				});

				if (!searchResult || !Array.isArray(searchResult) || searchResult.length === 0) {
					console.log('ℹ️ Qdrant returned no results');
					return [];
				}

				// searchResult items usually contain id and payload; ids are stored as strings
				const ids = searchResult.map(r => r.id?.toString()).filter(Boolean);
				// Fetch documents from MongoDB by id, keep order
				const docs = await Document.find({ _id: { $in: ids } }).select('title content source').lean();
				const docsById = docs.reduce((acc, d) => { acc[d._id.toString()] = d; return acc; }, {});

				const contexts = searchResult.map((r) => {
					const id = r.id?.toString();
					const doc = docsById[id];
					return doc ? { content: doc.content, source: doc.title || doc.source || id, score: r.score } : null;
				}).filter(Boolean);

				console.log(`📊 Qdrant returned ${contexts.length} documents`);
				return contexts;
			}

			// Fallback: attempt MongoDB Atlas vector search (if cluster supports it)
			console.log('🔍 Performing MongoDB vector search (fallback)...');
			const similarDocs = await Document.aggregate([{
				$vectorSearch: {
					index: 'vector_index',
					path: 'embedding',
					queryVector: embedding,
					numCandidates: 100,
					limit: 3
				}
			}]);

			console.log(`📊 Found ${similarDocs.length} relevant documents (MongoDB)`);
			return similarDocs.map(doc => ({ content: doc.content, source: doc.title, score: doc.score }));
		} catch (error) {
			console.error('❌ Vector search error:', error.message);
			if (error.writeErrors) {
				console.error('Write errors:', error.writeErrors);
			}
			return [];
		}
	},

	/**
	 * Chat with OpenRouter LLM using RAG Context
	 */
	chatWithOllama: async (query, contextDocs = []) => {
		try {
			console.log(`💬 Processing chat query: "${query.substring(0, 50)}..."`);

			const contextString = contextDocs.length > 0
				? contextDocs.map(d => d.content || d).join('\n\n')
				: 'No specific context available.';

			const systemPrompt = `You are a helpful AI assistant for SCHOLASTIC EDU. DEPOT (SED Academy).\nYou help students with course information, technical questions, and learning guidance.\nBe friendly, clear, and concise in your responses.\n\nAVAILABLE CONTEXT:\n${contextString}\n\nIf the answer isn't in the context, provide a helpful general answer based on your knowledge.`;

			const response = await openrouterClient.post('/chat/completions', {
				model: CHAT_MODEL,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: query }
				],
				max_tokens: 1000,
				temperature: 0.7
			});

			if (!response.data?.choices?.[0]?.message?.content) {
				throw new Error('Invalid chat response format');
			}

			const reply = response.data.choices[0].message.content;
			console.log(`✅ Chat response generated (${reply.length} chars)`);
			return reply;
		} catch (error) {
			console.error('❌ Chat Error:', {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data
			});
			throw new Error(`Failed to generate chat response: ${error.message}`);
		}
	}
};

module.exports = ragService;