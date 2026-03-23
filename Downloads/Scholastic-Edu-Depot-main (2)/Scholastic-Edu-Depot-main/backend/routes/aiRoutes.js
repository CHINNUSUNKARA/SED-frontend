const express = require('express');
const router = express.Router();
const ragService = require('../services/ragService');
const Course = require('../models/Course');
const axios = require('axios');

// Log that we're using OpenRouter for AI
console.log('🤖 AI Service: OpenRouter enabled');

// @route   POST /api/ai/chat
// @desc    Hybrid RAG Chatbot
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    console.log('AI Chat Request Received');

    // Validate input
    if (!message || typeof message !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Invalid message format. Message must be a non-empty string.'
        });
    }

    // Check if local AI is properly configured
    if (!process.env.ENABLE_AI_FEATURES || process.env.ENABLE_AI_FEATURES !== 'true') {
        return res.status(503).json({
            success: false,
            message: 'AI service is currently disabled. Please enable it in the configuration.',
            fallback: true
        });
    }

    try {
        console.log('Attempting AI Service...');
        try {
            // Try RAG flow with embeddings
            const embedding = await ragService.generateEmbedding(message);
            console.log('✅ Embedding generated, querying context...');
            const context = await ragService.queryChroma(embedding);
            const response = await ragService.chatWithOllama(message, context);
            return res.json({ response });
        } catch (ragError) {
            // If RAG fails, fall back to direct chat without context
            console.warn('⚠️ RAG embedding failed:', ragError.message);
            console.log('Falling back to direct chat without context...');
            const response = await ragService.chatWithOllama(message, []);
            return res.json({ response });
        }

    } catch (error) {
        console.error('AI Chat Error Details:', error);
        res.status(500).json({ message: 'AI service unavailable', error: error.message });
    }
});

// @route   POST /api/ai/generate-resume
// @desc    Generate Resume Content (Not implemented yet)
router.post('/generate-resume', async (req, res) => {
    res.status(501).json({ message: 'Resume generation not yet implemented' });
});

// @route   POST /api/ai/generate-image
// @desc    Generate Images (Not implemented yet)
router.post('/generate-image', async (req, res) => {
    res.status(501).json({ message: 'Image generation not yet implemented' });
});

// @route   POST /api/ai/generate-content
// @desc    Generate Marketing Copy (Not implemented yet)
router.post('/generate-content', async (req, res) => {
    res.status(501).json({ message: 'Content generation not yet implemented' });
});

// @route   POST /api/ai/generate-video
// @desc    Start Video Generation (Veo)
router.post('/generate-video', async (req, res) => {
    res.status(501).json({ message: 'Video generation not yet implemented' });
});

// @route   POST /api/ai/get-video-operation
// @desc    Poll Video Generation Status
router.post('/get-video-operation', async (req, res) => {
    res.status(501).json({ message: 'Video generation not yet implemented' });
});

// @route   GET /api/ai/video-proxy
// @desc    Proxy the video stream from Google to the client using the server-side API Key
router.get('/video-proxy', async (req, res) => {
    const { uri } = req.query;

    if (!uri) {
        return res.status(400).send('Missing URI');
    }

    try {
        // Append the API key to the URI provided by the operation result
        const videoUrl = `${uri}&key=${process.env.API_KEY}`;

        const response = await axios({
            method: 'get',
            url: videoUrl,
            responseType: 'stream'
        });

        // Pipe the video stream to the client
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error('Video Proxy Error:', error.message);
        res.status(500).send('Failed to fetch video');
    }
});

module.exports = router;
