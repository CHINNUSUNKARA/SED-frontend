
const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');
const { protectAdmin } = require('../middleware/authMiddleware');
const { blogPostValidator } = require('../middleware/validators');
const setCache = require('../middleware/cacheMiddleware');

const router = express.Router();

// @desc    Fetch all blog posts
// @route   GET /api/blog
// @access  Public
router.get('/', setCache(3600), async (req, res) => {
    try {
        console.log('Fetching blog posts...');
        // Check if BlogPost model is defined
        if (!BlogPost || !BlogPost.find) {
            console.error('BlogPost model is not properly defined');
            return res.status(500).json({ message: 'BlogPost model not properly initialized' });
        }
        
        // List all collections to debug
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        const posts = await BlogPost.find({}).sort({ publishedDate: -1 });
        console.log(`Found ${posts.length} blog posts`);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @desc    Fetch single blog post
// @route   GET /api/blog/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: 'Blog post not found' });
        }
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @desc    Create a blog post
// @route   POST /api/blog
// @access  Private/Admin
router.post('/', protectAdmin, blogPostValidator, async (req, res) => {
    try {
        const newPostData = { ...req.body, publishedDate: new Date().toISOString() };
        const existing = await BlogPost.findOne({ slug: newPostData.slug });
        if (existing) {
            return res.status(400).json({ message: 'Blog post with this slug already exists.' });
        }
        const newPost = await BlogPost.create(newPostData);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// @desc    Update a blog post
// @route   PUT /api/blog/:slug
// @access  Private/Admin
router.put('/:slug', protectAdmin, blogPostValidator, async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });
        if (post) {
            const updatedPost = await BlogPost.findOneAndUpdate(
                { slug: req.params.slug },
                req.body,
                { new: true }
            );
            res.json(updatedPost);
        } else {
            res.status(404).json({ message: 'Blog post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete a blog post
// @route   DELETE /api/blog/:slug
// @access  Private/Admin
router.delete('/:slug', protectAdmin, async (req, res) => {
    try {
        const post = await BlogPost.findOneAndDelete({ slug: req.params.slug });
        if (post) {
            res.json({ message: 'Blog post removed' });
        } else {
            res.status(404).json({ message: 'Blog post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;