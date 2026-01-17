# Security Documentation

## Overview

This API implements multiple layers of security to protect user data and prevent unauthorized access.

## Authentication

### JWT (JSON Web Tokens)

The API uses JWT for stateless authentication.

**Token Types**:
- **Access Token**: Short-lived (24h default), used for API requests
- **Refresh Token**: Long-lived (7d default), used to obtain new access tokens

**Token Structure**:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Implementation**: `src/infrastructure/security/JwtService.ts`

### Authentication Flow

1. **Registration**:
   ```
   POST /api/v1/auth/register
   → Password hashed with bcrypt
   → User created in database
   → Access & refresh tokens generated
   ```

2. **Login**:
   ```
   POST /api/v1/auth/login
   → Password verified with bcrypt
   → Access & refresh tokens generated
   ```

3. **Protected Routes**:
   ```
   GET /api/v1/users/me
   Header: Authorization: Bearer <access_token>
   → Token verified
   → User identified
   → Request processed
   ```

## Authorization

### Middleware

**AuthMiddleware** (`src/presentation/middlewares/AuthMiddleware.ts`):
- Validates JWT tokens
- Extracts user information
- Attaches user to request object
- Returns 401 for invalid/missing tokens

**Usage**:
```typescript
router.get('/protected', authMiddleware.authenticate, controller.method);
```

### Protected Routes

All routes under `/api/v1/users/*` require authentication.

## Password Security

### Bcrypt Hashing

**Implementation**: `src/infrastructure/security/BcryptService.ts`

**Features**:
- Configurable salt rounds (default: 10)
- Automatic salt generation
- Secure password comparison

**Configuration**:
```env
BCRYPT_ROUNDS=10
```

**Best Practices**:
- Never store plain text passwords
- Never log passwords
- Use strong password requirements in production
- Passwords are hashed before storage

### Password Requirements

Currently basic validation. For production, consider:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Rate Limiting

### Implementation

**Middleware**: `src/presentation/middlewares/RateLimitMiddleware.ts`

**Limits**:
1. **General API**: 100 requests per 15 minutes per IP
2. **Authentication**: 5 requests per 15 minutes per IP

**Configuration**:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Response** (when limit exceeded):
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

## HTTP Security Headers

### Helmet.js

Automatically sets security headers:
- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `X-Download-Options`
- `X-Permitted-Cross-Domain-Policies`

**Implementation**: `src/server.ts`

## CORS (Cross-Origin Resource Sharing)

**Configuration**:
```env
CORS_ORIGIN=http://localhost:3000
```

**Production**: Set to specific allowed origins
**Development**: Can use `*` for testing

## Environment Variables

### Security Best Practices

1. **Never commit `.env` files**
   - Added to `.gitignore`
   - Use `.env.example` as template

2. **Use strong secrets in production**:
   ```env
   JWT_SECRET=<strong-random-string>
   JWT_REFRESH_SECRET=<different-strong-random-string>
   ```

3. **Generate secrets**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### Required Variables

```env
# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Database Credentials
DB_PASSWORD=strong-database-password
```

## UUID for Entity IDs

All entities use UUID v4 for primary keys instead of auto-incrementing integers.

**Benefits**:
- Non-sequential (harder to enumerate)
- Globally unique
- Can be generated client-side
- No information leakage

**Implementation**:
```typescript
import { v4 as uuidv4 } from 'uuid';

const id = uuidv4(); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

## Docker Security

### Dockerfile Best Practices

1. **Non-root user**:
   ```dockerfile
   USER nodejs
   ```

2. **Multi-stage build**:
   - Smaller final image
   - No build dependencies in production

3. **Health checks**:
   - Automatic container health monitoring

### Docker Compose

**Secrets Management**:
- Use environment variables
- Never commit credentials
- Use Docker secrets in production

## Database Security

### TypeORM Security

1. **Parameterized queries**: Prevents SQL injection
2. **Connection pooling**: Prevents connection exhaustion
3. **Charset**: UTF-8 encoding

### Migrations

- Version controlled
- Reversible
- No data loss
- Applied in order

## API Security Checklist

- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] Rate limiting
- [x] CORS configuration
- [x] Security headers (Helmet)
- [x] Environment variables
- [x] UUID entity IDs
- [x] Input validation
- [x] Error handling (no sensitive data in errors)
- [x] HTTPS ready (use reverse proxy in production)

## Production Security Recommendations

### 1. HTTPS/TLS

Use a reverse proxy (nginx, Caddy) with SSL/TLS:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### 2. Environment-Specific Secrets

Use different secrets for each environment:
- Development
- Staging
- Production

### 3. Secret Management

Consider using:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

### 4. Monitoring & Logging

- Log authentication attempts
- Monitor rate limit hits
- Alert on suspicious activity
- Don't log sensitive data

### 5. Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Run `npm audit` regularly

### 6. Additional Measures

- Implement refresh token rotation
- Add email verification
- Implement 2FA
- Add account lockout after failed attempts
- Implement password reset flow
- Add CAPTCHA for sensitive operations

## Security Testing

### Manual Testing

1. **Test authentication**:
   ```bash
   # Try accessing protected route without token
   curl http://localhost:3000/api/v1/users/me
   # Should return 401
   ```

2. **Test rate limiting**:
   ```bash
   # Make multiple rapid requests
   for i in {1..10}; do curl http://localhost:3000/api/v1/auth/login; done
   ```

### Automated Testing

Security tests included in test suite:
- Authentication tests
- Authorization tests
- Token validation tests
- Rate limiting tests

## Incident Response

### If Credentials Are Compromised

1. **Rotate secrets immediately**:
   ```bash
   # Generate new secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Update environment variables**
3. **Restart services**
4. **Invalidate all existing tokens**
5. **Notify affected users**
6. **Review access logs**

## Compliance

### GDPR Considerations

- User data can be deleted
- Passwords are hashed (not reversible)
- Minimal data collection
- User consent for data processing

### Best Practices

- Regular security audits
- Penetration testing
- Code reviews
- Security training for developers

## Contact

For security issues, contact: security@example.com

**Do not** open public issues for security vulnerabilities.
