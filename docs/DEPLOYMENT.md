# Deployment Guide

## Overview

This guide covers deploying the Storage API using Docker in various environments.

## Prerequisites

- Docker 20+
- Docker Compose 2+
- Git
- Domain name (for production)
- SSL certificate (for production)

## Environment Setup

### Development

```bash
# Clone repository
git clone <repository-url>
cd storage-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start with Docker
docker-compose up --build
```

### Production

## Docker Deployment

### 1. Build Image

```bash
# Build production image
docker build -t storage-api:latest .

# Or with specific tag
docker build -t storage-api:1.0.0 .
```

### 2. Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Run Migrations

```bash
# Run migrations
docker-compose exec api npm run migration:run

# Run seeders (optional)
docker-compose exec api npm run seed
```

## Production Deployment

### Environment Variables

Create production `.env`:
```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=mariadb
DB_PORT=3306
DB_USERNAME=storage_user
DB_PASSWORD=<strong-password>
DB_DATABASE=storage_db

# JWT - GENERATE NEW SECRETS!
JWT_SECRET=<generated-secret-64-chars>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<generated-secret-64-chars>
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://yourdomain.com

# Bcrypt
BCRYPT_ROUNDS=12
```

### Generate Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Docker Compose Production

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  mariadb:
    image: mariadb:11.2
    container_name: storage-api-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
    networks:
      - storage-network
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    image: storage-api:latest
    container_name: storage-api
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      mariadb:
        condition: service_healthy
    networks:
      - storage-network
    volumes:
      - ./logs:/app/logs

networks:
  storage-network:
    driver: bridge

volumes:
  mariadb_data:
    driver: local
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Reverse Proxy Setup

### Nginx Configuration

Create `/etc/nginx/sites-available/storage-api`:
```nginx
upstream storage_api {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/storage-api-access.log;
    error_log /var/log/nginx/storage-api-error.log;

    # Proxy Settings
    location / {
        proxy_pass http://storage_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/storage-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Cloud Deployment

### AWS ECS

1. **Push image to ECR**:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag storage-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/storage-api:latest

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/storage-api:latest
```

2. **Create task definition**
3. **Create ECS service**
4. **Configure load balancer**
5. **Set up RDS for MariaDB**

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/storage-api

# Deploy
gcloud run deploy storage-api \
  --image gcr.io/PROJECT_ID/storage-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Add MariaDB database
5. Deploy

## Database Management

### Backup

```bash
# Backup database
docker-compose exec mariadb mysqldump -u root -p storage_db > backup.sql

# Restore database
docker-compose exec -T mariadb mysql -u root -p storage_db < backup.sql
```

### Automated Backups

Create backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
docker-compose exec mariadb mysqldump -u root -p${DB_ROOT_PASSWORD} storage_db > ${BACKUP_DIR}/backup_${DATE}.sql
find ${BACKUP_DIR} -name "backup_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## Monitoring

### Health Checks

API provides health endpoint:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-17T12:00:00.000Z",
  "uptime": 3600
}
```

### Logging

View logs:
```bash
# API logs
docker-compose logs -f api

# Database logs
docker-compose logs -f mariadb

# All logs
docker-compose logs -f
```

### Monitoring Tools

Consider using:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log aggregation
- **Sentry**: Error tracking
- **New Relic**: APM

## Scaling

### Horizontal Scaling

Update `docker-compose.yml`:
```yaml
api:
  deploy:
    replicas: 3
```

### Load Balancing

Use nginx or cloud load balancer to distribute traffic.

### Database Scaling

- Read replicas for read-heavy workloads
- Connection pooling
- Query optimization
- Caching layer (Redis)

## Security Checklist

- [ ] Use HTTPS/TLS
- [ ] Strong JWT secrets
- [ ] Secure database password
- [ ] Enable firewall
- [ ] Regular updates
- [ ] Backup strategy
- [ ] Monitor logs
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Security headers

## Rollback Strategy

### Docker Rollback

```bash
# List images
docker images

# Rollback to previous version
docker-compose down
docker-compose up -d storage-api:1.0.0
```

### Database Rollback

```bash
# Revert migration
docker-compose exec api npm run migration:revert
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs api

# Check container status
docker-compose ps

# Restart container
docker-compose restart api
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps mariadb

# Test connection
docker-compose exec api npm run typeorm query "SELECT 1"
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase resources in docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Rebuild image
docker-compose build --no-cache
```

### Database Maintenance

```bash
# Optimize tables
docker-compose exec mariadb mysqlcheck -o storage_db -u root -p

# Analyze tables
docker-compose exec mariadb mysqlcheck -a storage_db -u root -p
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Build image
        run: docker build -t storage-api:latest .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push storage-api:latest
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app/storage-api
            docker-compose pull
            docker-compose up -d
```

## Post-Deployment

1. **Verify deployment**:
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. **Run smoke tests**:
   ```bash
   npm run test:e2e
   ```

3. **Monitor logs**:
   ```bash
   docker-compose logs -f --tail=100
   ```

4. **Check metrics**:
   - Response times
   - Error rates
   - Resource usage

## Support

For deployment issues:
- Check logs first
- Review this documentation
- Contact DevOps team
- Create incident ticket
