const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

// Health check endpoint
router.get('/', (req, res) => {
    // Check MongoDB connection state
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'UP' : (dbState === 2 ? 'CONNECTING' : 'DOWN');

    // Determine overall system status
    const overallStatus = dbState === 1 ? 'UP' : 'DEGRADED';
    const statusCode = overallStatus === 'UP' ? 200 : 503;

    res.status(statusCode).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: {
                status: dbStatus,
                state: dbState
            },
            server: {
                status: 'UP',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version
            }
        }
    });
});

// CSRF token check endpoint
router.get('/csrf-check', (req, res) => {
    res.status(200).json({
        success: true,
        cookies: req.cookies,
        headers: req.headers,
        hasCsrfToken: !!req.csrfToken
    });
});

// Auth check endpoint
router.get('/auth-check', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    res.status(200).json({
        success: true,
        hasAuthHeader: !!authHeader,
        hasToken: !!token,
        cookies: {
            session_token: !!req.cookies?.session_token,
            admin_session_token: !!req.cookies?.admin_session_token,
            _csrf: !!req.cookies?._csrf,
            'XSRF-TOKEN': !!req.cookies?.['XSRF-TOKEN']
        },
        headers: {
            origin: req.headers.origin,
            referer: req.headers.referer,
            'user-agent': req.headers['user-agent']
        }
    });
});

module.exports = router;
