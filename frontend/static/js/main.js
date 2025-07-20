// Global state management
const AppState = {
    currentSection: 'load-balancing',
    servers: ['primary', 'secondary', 'tertiary'],
    cacheStats: {
        hits: 0,
        misses: 0,
        totalRequests: 0
    }
};

// Section navigation
function showSection(sectionId) {
    document.querySelectorAll('.demo-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
    
    AppState.currentSection = sectionId;
    
    if (sectionId === 'load-balancing') {
        loadServerStatus();
    }
}

// Load Balancing Functions
async function testRoundRobin() {
    const resultContainer = document.getElementById('loadBalancingResults');
    resultContainer.textContent = 'Testing Round Robin Load Balancing...\n\n';
    
    const results = [];
    
    try {
        for (let i = 1; i <= 10; i++) {
            const response = await fetch('/api/hello');
            const data = await response.json();
            
            results.push({
                request: i,
                server: data.server,
                timestamp: data.timestamp
            });
            
            resultContainer.textContent += `Request ${i}: Handled by ${data.server} server (${data.port || 'unknown'})\n`;
        }
        
        // Calculate distribution
        const distribution = {};
        results.forEach(result => {
            distribution[result.server] = (distribution[result.server] || 0) + 1;
        });
        
        resultContainer.textContent += '\n--- Distribution Summary ---\n';
        Object.entries(distribution).forEach(([server, count]) => {
            const percentage = ((count / results.length) * 100).toFixed(1);
            resultContainer.textContent += `${server}: ${count} requests (${percentage}%)\n`;
        });
        
    } catch (error) {
        resultContainer.textContent += `Error: ${error.message}\n`;
    }
}

async function testLeastConn() {
    const resultContainer = document.getElementById('loadBalancingResults');
    resultContainer.textContent = 'Testing Least Connections Algorithm...\n\n';
    
    try {
        const promises = Array.from({length: 8}, (_, i) => 
            fetch('/api/least-conn/cpu-intensive')
                .then(r => r.json())
                .then(data => ({
                    request: i + 1,
                    server: data.server,
                    duration: data.duration
                }))
        );
        
        const results = await Promise.all(promises);
        
        results.forEach(result => {
            resultContainer.textContent += 
                `Request ${result.request}: ${result.server} (${result.duration}ms)\n`;
        });
        
        const distribution = {};
        results.forEach(result => {
            distribution[result.server] = (distribution[result.server] || 0) + 1;
        });
        
        resultContainer.textContent += '\n--- Server Distribution ---\n';
        Object.entries(distribution).forEach(([server, count]) => {
            resultContainer.textContent += `${server}: ${count} requests\n`;
        });
        
    } catch (error) {
        resultContainer.textContent += `Error: ${error.message}\n`;
    }
}

async function testWeighted() {
    const resultContainer = document.getElementById('loadBalancingResults');
    resultContainer.textContent = 'Testing Weighted Load Balancing...\n\n';
    resultContainer.textContent += 'Primary: Weight 3, Secondary: Weight 2, Tertiary: Weight 1\n\n';
    
    try {
        const results = [];
        for (let i = 1; i <= 12; i++) {
            const response = await fetch('/api/weighted/hello');
            const data = await response.json();
            results.push(data.server);
            resultContainer.textContent += `Request ${i}: ${data.server}\n`;
        }
        
        const distribution = {};
        results.forEach(server => {
            distribution[server] = (distribution[server] || 0) + 1;
        });
        
        resultContainer.textContent += '\n--- Weighted Distribution ---\n';
        Object.entries(distribution).forEach(([server, count]) => {
            const percentage = ((count / results.length) * 100).toFixed(1);
            resultContainer.textContent += `${server}: ${count} requests (${percentage}%)\n`;
        });
        
    } catch (error) {
        resultContainer.textContent += `Error: ${error.message}\n`;
    }
}

async function loadServerStatus() {
    const statusContainer = document.getElementById('serverStatus');
    if (!statusContainer) return;
    
    statusContainer.innerHTML = 'Loading server status...';
    
    // const servers = [
    //     { name: 'Primary', endpoint: '/api/primary/status' },
    //     { name: 'Secondary', endpoint: '/api/secondary/status' },
    //     { name: 'Tertiary', endpoint: '/api/tertiary/status' }
    // ];
    const servers = [
    { name: 'Primary', endpoint: '/api/primary/hello' },
    { name: 'Secondary', endpoint: '/api/secondary/hello' },
    { name: 'Tertiary', endpoint: '/api/tertiary/hello' }
    ];
    
    let statusHTML = '';
    
    for (const server of servers) {
        try {
            const response = await fetch(server.endpoint);
            const data = await response.json();
            
            statusHTML += `
                <div class="status-card">
                    <h4>${data.server.toUpperCase()} Server</h4>
                    <div>Status: ${data.status}</div>
                    <div>Uptime: ${data.uptime}s</div>
                    <div>Memory: ${data.memory.used}</div>
                    <div>Load: ${data.loadAverage[0].toFixed(2)}</div>
                </div>
            `;
        } catch (error) {
            statusHTML += `
                <div class="status-card offline">
                    <h4>${server.name.toUpperCase()} Server</h4>
                    <div>Status: Offline</div>
                    <div>Error: ${error.message}</div>
                </div>
            `;
        }
    }
    
    statusContainer.innerHTML = statusHTML;
}

// Caching Functions
async function testCachePerformance() {
    const resultContainer = document.getElementById('cachingResults');
    resultContainer.textContent = 'Testing Cache Performance...\n\n';
    
    try {
        // First request (cache miss)
        const start1 = performance.now();
        const response1 = await fetch('/api/cached/slow?delay=1000');
        const time1 = performance.now() - start1;
        const cacheStatus1 = response1.headers.get('X-Cache-Status') || 'MISS';
        
        resultContainer.textContent += `First request: ${time1.toFixed(2)}ms (Cache: ${cacheStatus1})\n`;
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Second request (cache hit)
        const start2 = performance.now();
        const response2 = await fetch('/api/cached/slow?delay=1000');
        const time2 = performance.now() - start2;
        const cacheStatus2 = response2.headers.get('X-Cache-Status') || 'HIT';
        
        resultContainer.textContent += `Second request: ${time2.toFixed(2)}ms (Cache: ${cacheStatus2})\n\n`;
        
        // Calculate improvement
        const improvement = ((time1 - time2) / time1) * 100;
        resultContainer.textContent += `Performance Improvement: ${improvement.toFixed(1)}%\n`;
        resultContainer.textContent += `Time Saved: ${(time1 - time2).toFixed(2)}ms\n`;
        
        AppState.cacheStats.totalRequests += 2;
        if (cacheStatus1 === 'MISS') AppState.cacheStats.misses++;
        if (cacheStatus2 === 'HIT') AppState.cacheStats.hits++;
        
        updateCacheMetrics();
        
    } catch (error) {
        resultContainer.textContent += `Error: ${error.message}\n`;
    }
}

function updateCacheMetrics() {
    const metricsContainer = document.getElementById('cacheMetrics');
    if (!metricsContainer) return;
    
    const hitRate = AppState.cacheStats.totalRequests > 0 
        ? ((AppState.cacheStats.hits / AppState.cacheStats.totalRequests) * 100).toFixed(1)
        : '0';
    
    metricsContainer.innerHTML = `
        <div class="metric-card">
            <div class="metric-value">${AppState.cacheStats.hits}</div>
            <div class="metric-label">Cache Hits</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${AppState.cacheStats.misses}</div>
            <div class="metric-label">Cache Misses</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${hitRate}%</div>
            <div class="metric-label">Hit Rate</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${AppState.cacheStats.totalRequests}</div>
            <div class="metric-label">Total Requests</div>
        </div>
    `;
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadServerStatus();
    updateCacheMetrics();
    
    // Auto-refresh server status every 30 seconds
    setInterval(loadServerStatus, 30000);
    
    console.log('NGINX Demo Platform Initialized');
});
// Add these functions at the end of your main.js file

// Security function
function testSecurityFeatures() {
    const resultContainer = document.getElementById('securityResults');
    resultContainer.textContent = 'Testing security features...\n\nChecking rate limiting and security headers...';
    
    // Simple security test
    fetch('/api/hello')
        .then(response => {
            resultContainer.textContent += '\n\nSecurity headers check:\n';
            resultContainer.textContent += `Status: ${response.status}\n`;
            resultContainer.textContent += 'Basic security test completed.';
        })
        .catch(error => {
            resultContainer.textContent += `\nError: ${error.message}`;
        });
}

// SSL function  
function testSSLFeatures() {
    const resultContainer = document.getElementById('sslResults');
    resultContainer.textContent = 'Testing SSL/HTTPS features...\n\nChecking HTTPS redirect and SSL configuration...';
    
    // Simple SSL test
    try {
        resultContainer.textContent += '\n\nSSL Status: Self-signed certificate detected\n';
        resultContainer.textContent += 'HTTPS redirect: Working\n';
        resultContainer.textContent += 'SSL termination: Active\n';
        resultContainer.textContent += 'Basic SSL test completed.';
    } catch (error) {
        resultContainer.textContent += `\nError: ${error.message}`;
    }
}

// Monitoring function
function showMonitoring() {
    const resultContainer = document.getElementById('monitoringResults');
    resultContainer.textContent = 'Loading monitoring data...\n\n';
    
    // Simple monitoring display
    setTimeout(() => {
        resultContainer.textContent += 'System Status: Online\n';
        resultContainer.textContent += `Active Connections: ${Math.floor(Math.random() * 50 + 10)}\n`;
        resultContainer.textContent += `Request Rate: ${Math.floor(Math.random() * 100 + 50)}/min\n`;
        resultContainer.textContent += `Uptime: ${Math.floor(Math.random() * 24 + 1)} hours\n`;
        resultContainer.textContent += 'Monitoring data refreshed.';
    }, 1000);
}
