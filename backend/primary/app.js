const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_ID = 'primary';

app.use(express.json());

// Add server identification to all responses
app.use((req, res, next) => {
    res.setHeader('X-Server-ID', SERVER_ID);
    res.setHeader('X-Timestamp', new Date().toISOString());
    next();
});

// Hello endpoint for load balancing demonstration
app.get('/hello', (req, res) => {
    res.json({
        message: `Hello from ${SERVER_ID} server!`,
        timestamp: new Date().toISOString(),
        server: SERVER_ID,
        port: PORT,
        uptime: Math.round(process.uptime()),
        pid: process.pid
    });
});

// Time endpoint
app.get('/time', (req, res) => {
    res.json({
        message: 'Current server time',
        time: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        server: SERVER_ID,
        unixTimestamp: Date.now()
    });
});

// Status endpoint for monitoring
app.get('/status', (req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
        status: 'healthy',
        server: SERVER_ID,
        uptime: Math.round(process.uptime()),
        memory: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
        },
        version: process.version,
        loadAverage: require('os').loadavg()
    });
});

// CPU intensive endpoint for load testing
app.get('/cpu-intensive', (req, res) => {
    const start = Date.now();
    let count = 0;
    
    // Simulate CPU work for 1 second
    while (Date.now() - start < 1000) {
        count += Math.random();
    }
    
    res.json({
        message: 'CPU intensive task completed',
        server: SERVER_ID,
        duration: Date.now() - start,
        computations: Math.round(count)
    });
});

// Slow endpoint for caching demonstration
app.get('/slow', (req, res) => {
    const delay = parseInt(req.query.delay) || 2000;
    setTimeout(() => {
        res.json({
            message: `Slow response from ${SERVER_ID}`,
            server: SERVER_ID,
            delay: delay,
            timestamp: new Date().toISOString()
        });
    }, delay);
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).send(`${SERVER_ID} server is healthy`);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`${SERVER_ID} server running on port ${PORT}`);
    console.log(`Process ID: ${process.pid}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(`${SERVER_ID} server shutting down gracefully`);
    process.exit(0);
});
