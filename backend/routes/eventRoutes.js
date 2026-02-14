const express = require('express');
const router = express.Router();

// Store active connections
const activeConnections = new Set();

// @desc    Server-sent events endpoint for real-time updates
// @route   GET /api/events
// @access  Public
router.get('/', (req, res) => {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Add connection to active connections
  activeConnections.add(res);

  // Send initial connection event
  res.write('data: {"type":"connected","timestamp":"' + new Date().toISOString() + '"}\n\n');

  // Remove connection on client disconnect
  req.on('close', () => {
    activeConnections.delete(res);
  });

  // Send periodic heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    if (activeConnections.has(res)) {
      res.write('data: {"type":"heartbeat","timestamp":"' + new Date().toISOString() + '"}\n\n');
    } else {
      clearInterval(heartbeat);
    }
  }, 30000); // Every 30 seconds
});

// Helper function to broadcast events to all connected clients
const broadcastEvent = (eventType, data) => {
  const message = `data: ${JSON.stringify({ type: eventType, data, timestamp: new Date().toISOString() })}\n\n`;
  
  activeConnections.forEach(connection => {
    try {
      connection.write(message);
    } catch (error) {
      // Remove dead connections
      activeConnections.delete(connection);
    }
  });
};

// Test endpoint to trigger events manually (for testing)
router.post('/test', (req, res) => {
  const { eventType, data } = req.body;
  
  if (eventType && data) {
    broadcastEvent(eventType, data);
    res.json({ success: true, message: `Event ${eventType} broadcasted` });
  } else {
    res.status(400).json({ success: false, message: 'eventType and data required' });
  }
});

// Export the broadcast function for use in other routes
module.exports = { router, broadcastEvent };
