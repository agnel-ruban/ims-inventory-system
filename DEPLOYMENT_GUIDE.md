# Deployment Guide - Inventory Management System

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This guide provides comprehensive instructions for deploying the Inventory Management System (IMS) to production environments. The system consists of a Spring Boot backend API and a React frontend application.

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Spring Boot) │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+), Windows Server 2019+, or macOS
- **Java**: OpenJDK 17 or Oracle JDK 17
- **Node.js**: Version 16+ (for frontend build)
- **PostgreSQL**: Version 12+
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 20GB available space
- **Network**: Stable internet connection for package downloads

### Required Software
```bash
# Java 17
java -version

# Node.js 16+
node --version
npm --version

# PostgreSQL 12+
psql --version

# Git (for code deployment)
git --version
```

## 🚀 Backend Deployment

### 1. Build the Application
```bash
# Navigate to backend directory
cd backend

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package the application
mvn package -DskipTests

# Verify the JAR file was created
ls -la target/ims-0.0.1-SNAPSHOT.jar
```

### 2. Environment Configuration
Create `application-prod.properties` for production:
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/ims_production
spring.datasource.username=ims_prod_user
spring.datasource.password=secure_production_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
jwt.secret=your_very_secure_jwt_secret_key_here_make_it_long_and_random
jwt.expiration=86400000

# Admin Configuration
app.admin.password=SecureAdminPassword123

# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Logging Configuration
logging.level.root=INFO
logging.level.com.example.ims=INFO
logging.file.name=logs/ims-application.log
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n

# Actuator Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
```

### 3. Database Setup
```sql
-- Create production database
CREATE DATABASE ims_production;

-- Create production user
CREATE USER ims_prod_user WITH PASSWORD 'secure_production_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ims_production TO ims_prod_user;

-- Connect to the database
\c ims_production

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO ims_prod_user;
```

### 4. Run the Application
```bash
# Run with production profile
java -jar target/ims-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# Or with environment variables
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ims_production
export SPRING_DATASOURCE_USERNAME=ims_prod_user
export SPRING_DATASOURCE_PASSWORD=secure_production_password
java -jar target/ims-0.0.1-SNAPSHOT.jar
```

### 5. Systemd Service (Linux)
Create `/etc/systemd/system/ims-backend.service`:
```ini
[Unit]
Description=IMS Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=ims
WorkingDirectory=/opt/ims/backend
ExecStart=/usr/bin/java -jar ims-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=always
RestartSec=10
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="JAVA_OPTS=-Xmx2g -Xms1g"

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ims-backend
sudo systemctl start ims-backend
sudo systemctl status ims-backend
```

## 🎨 Frontend Deployment

### 1. Build the Application
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Verify the build
ls -la dist/
```

### 2. Environment Configuration
Create `.env.production`:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=Inventory Management System
VITE_APP_VERSION=1.0.0
```

### 3. Web Server Configuration

#### Nginx Configuration
Create `/etc/nginx/sites-available/ims-frontend`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ims-frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ims-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Apache Configuration
Create `/etc/apache2/sites-available/ims-frontend.conf`:
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/ims-frontend

    <Directory /var/www/ims-frontend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
    </IfModule>

    # Cache static assets
    <IfModule mod_expires.c>
        ExpiresActive on
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/ico "access plus 1 year"
        ExpiresByType image/icon "access plus 1 year"
        ExpiresByType text/plain "access plus 1 month"
        ExpiresByType application/pdf "access plus 1 month"
        ExpiresByType application/x-shockwave-flash "access plus 1 month"
    </IfModule>

    # API proxy
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:8080/api/
    ProxyPassReverse /api/ http://localhost:8080/api/
</VirtualHost>
```

### 4. Deploy Frontend Files
```bash
# Copy build files to web server
sudo cp -r dist/* /var/www/ims-frontend/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/ims-frontend
sudo chmod -R 755 /var/www/ims-frontend
```

## 🗄️ Database Setup

### 1. PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2. Database Configuration
Edit `/etc/postgresql/12/main/postgresql.conf`:
```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connection settings
max_connections = 100

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'all'
log_min_duration_statement = 1000
```

### 3. Security Configuration
Edit `/etc/postgresql/12/main/pg_hba.conf`:
```conf
# Local connections
local   all             postgres                                peer
local   all             all                                     md5

# Host connections
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

### 4. Database Initialization
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE ims_production;
CREATE USER ims_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ims_production TO ims_user;

-- Connect to the database
\c ims_production

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO ims_user;
```

## ⚙️ Environment Configuration

### 1. Environment Variables
Create `/etc/environment` or use a `.env` file:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ims_production
DB_USER=ims_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRATION=86400000

# Admin
ADMIN_PASSWORD=SecureAdminPassword123

# Application
APP_ENV=production
APP_PORT=8080
```

### 2. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# iptables (CentOS)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo service iptables save
```

## 🚀 Production Deployment

### 1. Docker Deployment (Alternative)
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/ims_production
      - SPRING_DATASOURCE_USERNAME=ims_user
      - SPRING_DATASOURCE_PASSWORD=secure_password
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:8080/api
    depends_on:
      - backend
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=ims_production
      - POSTGRES_USER=ims_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ims_user -d ims_production"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### 2. Cloud Deployment

#### AWS Deployment
```bash
# Create EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Deploy with Docker Compose
docker-compose up -d
```

#### Azure Deployment
```bash
# Create Azure Container Instances
az container create \
  --resource-group myResourceGroup \
  --name ims-backend \
  --image your-registry.azurecr.io/ims-backend:latest \
  --ports 8080 \
  --environment-variables \
    SPRING_PROFILES_ACTIVE=prod \
    SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-server:5432/ims_production
```

## 📊 Monitoring & Maintenance

### 1. Application Monitoring
```bash
# Health check endpoint
curl http://localhost:8080/api/actuator/health

# Metrics endpoint
curl http://localhost:8080/api/actuator/metrics

# Application info
curl http://localhost:8080/api/actuator/info
```

### 2. Log Monitoring
```bash
# View application logs
tail -f logs/ims-application.log

# View system logs
sudo journalctl -u ims-backend -f

# Log rotation
sudo logrotate /etc/logrotate.d/ims-backend
```

### 3. Database Monitoring
```sql
-- Check database connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 4. Performance Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor application performance
jstat -gc <pid>
jmap -heap <pid>
```

### 5. Backup Strategy
```bash
# Database backup
pg_dump -h localhost -U ims_user -d ims_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf ims-backup-$(date +%Y%m%d_%H%M%S).tar.gz /opt/ims/

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -h localhost -U ims_user -d ims_production > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /opt/ims/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check Java version
java -version

# Check port availability
netstat -tulpn | grep :8080

# Check logs
tail -f logs/ims-application.log

# Check system resources
free -h
df -h
```

#### 2. Database Connection Issues
```bash
# Test database connection
psql -h localhost -U ims_user -d ims_production

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-12-main.log
```

#### 3. Frontend Not Loading
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

#### 4. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout

# Renew certificate manually
sudo certbot renew

# Check nginx SSL configuration
sudo nginx -t
```

### Performance Issues

#### 1. Slow Database Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

#### 2. High Memory Usage
```bash
# Check JVM memory usage
jstat -gc <pid>

# Adjust JVM parameters
export JAVA_OPTS="-Xmx2g -Xms1g -XX:+UseG1GC"
```

#### 3. Network Issues
```bash
# Check network connectivity
ping your-domain.com
telnet your-domain.com 80
telnet your-domain.com 443

# Check firewall rules
sudo iptables -L
sudo ufw status
```

---

**Deployment Guide Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: Development Team  
**Support**: For deployment issues, refer to troubleshooting section or contact the development team 