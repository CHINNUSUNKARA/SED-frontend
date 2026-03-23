
const setCache = (durationInSeconds) => (req, res, next) => {
    // Set cache for GET requests only
    if (req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${durationInSeconds}`);
    } else {
        // For other methods, prevent caching to ensure data is always fresh
        res.set('Cache-Control', 'no-store');
    }
    next();
};

module.exports = setCache;
