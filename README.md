# NGINX Demo Project

This project is designed as a **hands-on** learning resource for understanding NGINX's core concepts and features. It demonstrates practical implementation of NGINX as a `reverse proxy`, `static file server`, and `API gateway`.

## Learning Objectives

- Understanding NGINX configuration structure and syntax
- Implementing reverse proxy patterns
- Managing static file serving with caching strategies
- Configuring proxy headers and buffers
- Setting up security headers
- Handling API routing and proxying
- Docker containerization for modern deployments

## Key Features

1. **NGINX Configuration Examples**:
   - Modular configuration with separate files for different concerns
   - Proxy settings with timeouts and buffering
   - Custom security headers
   - Static file serving with cache control
   - URL routing and location blocks

2. **Backend Integration**:
   - Express.js API with multiple endpoints
   - Proxy configuration for API requests
   - Header forwarding and request modification

3. **Frontend Serving**:
   - Static file serving optimization
   - Cache control implementation
   - Single page application support

## Project Structure

```
nginx-demo/
├── nginx/
│   ├── nginx.conf             # Main NGINX configuration
│   └── conf.d/
│       ├── common_headers.conf    # Security and custom headers
│       ├── default.conf          # Server and location blocks
│       └── proxy_settings.conf   # Proxy configurations
├── backend/
│   ├── app.js                # Express API endpoints
│   └── package.json
├── frontend/
│   └── index.html           # Demo frontend application
└── docker-compose.yml       # Container orchestration
```

## Prerequisites

- Docker and Docker Compose
- Basic understanding of web servers and HTTP

## Getting Started

NOTE: **Fork** the repository to your github account.

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-github-username>/nginx-demo.git
   cd nginx-demo
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. Access the demo:
   - Frontend: http://localhost
   - API Endpoint: http://localhost/api/hello



## Testing and Verification

### API Endpoints
Test the backend services:
```bash
# Test Hello endpoint
curl http://localhost/api/hello

# Test Time endpoint
curl http://localhost/api/time

# Test Status endpoint
curl http://localhost/api/status
```

## Experimentation Ideas

1. **Caching**: 
   - Modify cache durations in `default.conf`
   - Test different `expires` directives
   - Observe cache headers in browser dev tools

2. **Proxy Settings**:
   - Adjust proxy buffer sizes
   - Modify timeout values
   - Test impact on large responses

3. **Security Headers**:
   - Add new security headers
   - Test with security scanning tools
   - Understand header impacts

## Notes

- The project uses Docker for easy setup and testing
- Configuration files are mounted as volumes for quick changes
- Log format is customized for better debugging
- Headers are modularized in separate config files

## ✨ Author

Created by [Suraj-kumar00](https://github.com/Suraj-kumar00)

## 🤝 Contributing

Feel free to:
1. Fork the repository
2. Create your feature branch
3. Add new NGINX learning examples
4. Submit a pull request
