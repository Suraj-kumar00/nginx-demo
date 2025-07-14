const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Endpoint 1: Hello
app.get('/hello', (req, res) => {
    res.json({
        message: 'Hello from Nginx backend!',
        timestamp: new Date().toISOString(),
        server: 'backend-service'
    });
});

// Endpoint 2: Time
app.get('/time', (req, res) => {
    res.json({
        message: 'Current server time',
        time: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        server: 'backend-service'
    });
});

// Endpoint 3: Status
app.get('/status', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        server: 'backend-service'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.send('Backend is healthy');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
});