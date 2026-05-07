// In-memory cache for API responses
const NodeCache = require('node-cache');

// Create cache instance with TTL checking every 60 seconds
const cache = new NodeCache({ 
    stdTTL: 300, // 5 minutes default
    checkperiod: 60,
    useClones: false // Better performance, but be careful with mutations
});

// HTTP Cache-Control headers
const setCache = (durationInSeconds) => (req, res, next) => {
    // Set cache for GET requests only
    if (req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${durationInSeconds}`);
        res.set('ETag', 'W/"' + Date.now() + '"');
    } else {
        // For other methods, prevent caching to ensure data is always fresh
        res.set('Cache-Control', 'no-store');
    }
    next();
};

// In-memory cache middleware for GET requests
const cacheMiddleware = (durationInSeconds = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Create cache key from URL and query params
        const key = `${req.originalUrl || req.url}`;

        // Check if cached response exists
        const cachedResponse = cache.get(key);
        
        if (cachedResponse) {
            console.log(`✅ Cache HIT: ${key}`);
            return res.status(200).json(cachedResponse);
        }

        console.log(`❌ Cache MISS: ${key}`);

        // Store original res.json function
        const originalJson = res.json.bind(res);

        // Override res.json to cache the response
        res.json = (body) => {
            // Cache successful responses only
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, body, durationInSeconds);
            }
            return originalJson(body);
        };

        next();
    };
};

// Clear cache by pattern
const clearCacheByPattern = (pattern) => {
    const keys = cache.keys();
    const matchedKeys = keys.filter(key => key.includes(pattern));
    
    matchedKeys.forEach(key => cache.del(key));
    
    console.log(`🗑️ Cleared ${matchedKeys.length} cache entries matching: ${pattern}`);
    return matchedKeys.length;
};

// Clear all cache
const clearAllCache = () => {
    cache.flushAll();
    console.log('🗑️ Cleared all cache');
};

// Get cache stats
const getCacheStats = () => {
    return cache.getStats();
};

module.exports = {
    setCache,
    cacheMiddleware,
    clearCacheByPattern,
    clearAllCache,
    getCacheStats
};
