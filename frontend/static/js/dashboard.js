// Dashboard-specific JavaScript functionality
// This extends the main.js functionality

// Dashboard State Management
const DashboardState = {
    autoRefresh: true,
    refreshInterval: 5000,
    intervalId: null,
    lastUpdate: null,
    metrics: {
        connections: 0,
        cacheHitRate: 0,
        requestRate: 0,
        avgResponseTime: 0,
        errorRate: 0,
        uptime: 0
    },
    servers: [],
    logs: []
};

// Initialize Dashboard
async function initializeDashboard() {
    console.log('🚀 Initializing NGINX Dashboard...');
    showLoadingState();
    
    try {
        await refreshAllMetrics();
        startAutoRefresh();
        addLogEntry('info', 'Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        addLogEntry('error', `Dashboard initialization failed: ${error.message}`);
    }
}

// Show/Hide loading state
function showLoadingState() {
    const refreshIcon = document.getElementById('refreshIcon');
    if (refreshIcon) refreshIcon.innerHTML = '<div class="loading-spinner"></div>';
}

function hideLoadingState() {
    const refreshIcon = document.getElementById('refreshIcon');
    if (refreshIcon) refreshIcon.innerHTML = '🔄';
}

// Refresh All Metrics
async function refreshAllMetrics() {
    showLoadingState();
    
    try {
        await Promise.all([
            updateSystemMetrics(),
            updateServerStatus(),
            updateRequestChart(),
            updateLogs()
        ]);
        
        DashboardState.lastUpdate = new Date();
        addLogEntry('success', 'All metrics refreshed successfully');
        
    } catch (error) {
        console.error('Error refreshing metrics:', error);
        addLogEntry('error', `Failed to refresh metrics: ${error.message}`);
    } finally {
        hideLoadingState();
    }
}

// Update System Metrics
async function updateSystemMetrics() {
    try {
        const metrics = await fetchSystemMetrics();
        
        updateMetricCard('activeConnections', metrics.connections, 'connectionChange', 'connectionBar');
        updateMetricCard('cacheHitRate', `${metrics.cacheHitRate}%`, 'cacheChange', 'cacheBar', metrics.cacheHitRate);
        updateMetricCard('requestRate', metrics.requestRate, 'requestChange', 'requestBar');
        updateMetricCard('avgResponseTime', `${metrics.avgResponseTime}ms`, 'responseChange', 'responseBar');
        updateMetricCard('errorRate', `${metrics.errorRate}%`, 'errorChange', 'errorBar', metrics.errorRate);
        updateMetricCard('systemUptime', formatUptime(metrics.uptime), 'uptimeChange', null);
        
        DashboardState.metrics = metrics;
        
    } catch (error) {
        console.error('Error updating system metrics:', error);
        throw error;
    }
}

// Simulated API call to fetch system metrics
async function fetchSystemMetrics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
        connections: Math.floor(Math.random() * 100 + 20),
        cacheHitRate: Math.floor(Math.random() * 30 + 70),
        requestRate: Math.floor(Math.random() * 200 + 100),
        avgResponseTime: Math.floor(Math.random() * 50 + 25),
        errorRate: (Math.random() * 2).toFixed(2),
        uptime: Math.floor(Date.now() / 1000 - Math.random() * 86400 * 30)
    };
}

// Update individual metric card
function updateMetricCard(valueId, value, changeId, barId, percentage = null) {
    const valueElement = document.getElementById(valueId);
    const changeElement = document.getElementById(changeId);
    const barElement = document.getElementById(barId);
    
    if (valueElement) valueElement.textContent = value;
    
    const trend = Math.random() > 0.5 ? 'positive' : 'negative';
    const changeValue = Math.floor(Math.random() * 20) + 1;
    
    if (changeElement) {
        changeElement.className = `metric-change ${trend}`;
        changeElement.textContent = trend === 'positive' 
            ? `+${changeValue} from last hour` 
            : `${changeValue} below average`;
    }
    
    if (barElement && percentage !== null) {
        barElement.style.width = `${Math.min(percentage, 100)}%`;
    }
}

// Update Server Status (uses existing loadServerStatus but with dashboard styling)
async function updateServerStatus() {
    const serverGrid = document.getElementById('serverGrid');
    if (!serverGrid) return;
    
    const servers = [
        { name: 'Primary', endpoint: '/api/primary/status' },
        { name: 'Secondary', endpoint: '/api/secondary/status' },
        { name: 'Tertiary', endpoint: '/api/tertiary/status' }
    ];
    
    let serverHTML = '';
    
    for (const server of servers) {
        try {
            const response = await fetch(server.endpoint);
            const data = await response.json();
            
            const memoryUsage = parseFloat(data.memory.used) || 0;
            const cpuLoad = data.loadAverage[0] || 0;
            const uptime = formatUptime(data.uptime);
            
            serverHTML += `
                <div class="server-card">
                    <div class="server-name">
                        <span class="status-indicator status-online"></span>
                        ${data.server.toUpperCase()} Server
                    </div>
                    <div class="server-metric">
                        <span class="server-metric-label">Status:</span>
                        <span class="server-metric-value">✅ ${data.status}</span>
                    </div>
                    <div class="server-metric">
                        <span class="server-metric-label">Uptime:</span>
                        <span class="server-metric-value">${uptime}</span>
                    </div>
                    <div class="server-metric">
                        <span class="server-metric-label">Memory:</span>
                        <span class="server-metric-value">${data.memory.used}</span>
                    </div>
                    <div class="stats-bar">
                        <div class="stats-fill memory-fill" style="width: ${Math.min(memoryUsage, 100)}%"></div>
                    </div>
                    <div class="server-metric">
                        <span class="server-metric-label">CPU Load:</span>
                        <span class="server-metric-value">${cpuLoad.toFixed(2)}</span>
                    </div>
                    <div class="stats-bar">
                        <div class="stats-fill cpu-fill" style="width: ${Math.min(cpuLoad * 100, 100)}%"></div>
                    </div>
                </div>
            `;
        } catch (error) {
            serverHTML += `
                <div class="server-card offline">
                    <div class="server-name">
                        <span class="status-indicator status-offline"></span>
                        ${server.name.toUpperCase()} Server
                    </div>
                    <div class="server-metric">
                        <span class="server-metric-label">Status:</span>
                        <span class="server-metric-value">❌ Offline</span>
                    </div>
                    <div class="server-metric">
                        <span class="server-metric-label">Error:</span>
                        <span class="server-metric-value">${error.message}</span>
                    </div>
                </div>
            `;
        }
    }
    
    serverGrid.innerHTML = serverHTML;
}

// Update Request Chart
function updateRequestChart() {
    const chartContainer = document.getElementById('requestChart');
    if (!chartContainer) return;
    
    const chartData = [];
    for (let i = 9; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000);
        const requests = Math.floor(Math.random() * 100 + 20);
        chartData.push({
            time: time.toLocaleTimeString('en-US', { hour12: false }).substr(-5),
            requests: requests
        });
    }
    
    const maxRequests = Math.max(...chartData.map(d => d.requests));
    let chartHTML = '';
    
    chartData.forEach(data => {
        const height = (data.requests / maxRequests) * 160;
        const opacity = 0.7 + (data.requests / maxRequests) * 0.3;
        
        chartHTML += `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                max-width: 60px;
            ">
                <div style="
                    width: 25px;
                    height: ${height}px;
                    background: linear-gradient(to top, #00d4ff, #0099cc);
                    border-radius: 4px 4px 0 0;
                    margin-bottom: 8px;
                    opacity: ${opacity};
                    transition: all 0.3s ease;
                "></div>
                <div style="
                    font-size: 0.7rem;
                    color: #888;
                    text-align: center;
                ">${data.time}</div>
                <div style="
                    font-size: 0.6rem;
                    color: #00d4ff;
                    margin-top: 2px;
                ">${data.requests}</div>
            </div>
        `;
    });
    
    chartContainer.innerHTML = chartHTML;
}

// Log Management
function updateLogs() {
    const logTypes = ['info', 'warn', 'error', 'success'];
    const actions = [
        'Request processed: GET /api/hello - 200 OK',
        'Load balancer: Routed to primary server',
        'Cache hit: /api/cached/slow - served from cache',
        'Rate limiting triggered for IP 192.168.1.100',
        'SSL certificate check completed',
        'Backend server health check passed'
    ];
    
    for (let i = 0; i < 2; i++) {
        const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const responseTime = Math.floor(Math.random() * 100 + 10);
        
        addLogEntry(logType, `${action} (${responseTime}ms)`);
    }
}

function addLogEntry(level, message) {
    const logsContainer = document.getElementById('accessLogs');
    if (!logsContainer) return;
    
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span class="log-level-${level}">[${level.toUpperCase()}]</span>
        <span>${message}</span>
    `;
    
    logsContainer.insertBefore(logEntry, logsContainer.firstChild);
    
    while (logsContainer.children.length > 50) {
        logsContainer.removeChild(logsContainer.lastChild);
    }
}

// Auto Refresh Management
function startAutoRefresh() {
    if (DashboardState.autoRefresh && !DashboardState.intervalId) {
        DashboardState.intervalId = setInterval(refreshAllMetrics, DashboardState.refreshInterval);
        addLogEntry('info', `Auto-refresh started (${DashboardState.refreshInterval/1000}s interval)`);
    }
}

function stopAutoRefresh() {
    if (DashboardState.intervalId) {
        clearInterval(DashboardState.intervalId);
        DashboardState.intervalId = null;
        addLogEntry('info', 'Auto-refresh stopped');
    }
}

function toggleAutoRefresh() {
    DashboardState.autoRefresh = !DashboardState.autoRefresh;
    const button = document.getElementById('autoRefreshBtn');
    
    if (DashboardState.autoRefresh) {
        button.textContent = '⏱️ Auto Refresh: ON';
        button.classList.add('active');
        startAutoRefresh();
    } else {
        button.textContent = '⏱️ Auto Refresh: OFF';
        button.classList.remove('active');
        stopAutoRefresh();
    }
}

// Utility Functions
function formatUptime(seconds) {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

function clearLogs() {
    const logsContainer = document.getElementById('accessLogs');
    if (logsContainer) {
        logsContainer.innerHTML = '<div class="log-entry"><span class="log-level-info">[INFO]</span> Logs cleared</div>';
        DashboardState.logs = [];
        addLogEntry('info', 'Log history cleared by user');
    }
}

function exportMetrics() {
    const data = {
        timestamp: new Date().toISOString(),
        metrics: DashboardState.metrics,
        servers: DashboardState.servers,
        logs: DashboardState.logs.slice(0, 10)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nginx-metrics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLogEntry('success', 'Metrics exported successfully');
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize dashboard if we're on the dashboard page
    if (document.querySelector('.dashboard-container')) {
        initializeDashboard();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
});
