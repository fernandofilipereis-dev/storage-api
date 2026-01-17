# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### Added

#### Architecture
- Clean Architecture implementation with four distinct layers
- Domain Driven Design principles
- Ports and Adapters pattern (Hexagonal Architecture)
- SOLID principles throughout the codebase
- Dependency Injection pattern

#### Domain Layer
- `User` entity with business logic and validation
- `Email` value object with format validation
- `IUserRepository` interface (port)
- `IPasswordHasher` interface (port)
- `ITokenService` interface (port)
- Custom domain exceptions (ValidationException, NotFoundException, UnauthorizedException, ConflictException)

#### Application Layer
- `RegisterUserUseCase` for user registration
- `LoginUserUseCase` for authentication
- `GetUserByIdUseCase` for user retrieval
- `UpdateUserUseCase` for user updates
- DTOs for user operations (RegisterUserDTO, LoginUserDTO, UpdateUserDTO, UserResponseDTO, AuthResponseDTO)

#### Infrastructure Layer
- TypeORM configuration for MariaDB
- `UserEntity` ORM mapping with UUID primary key
- `UserRepository` implementation (adapter)
- Database migration for users table
- User seeder with admin and test users
- `BcryptService` for password hashing
- `JwtService` for JWT token management
- Centralized configuration class

#### Presentation Layer
- `AuthController` with register and login endpoints
- `UserController` with profile management endpoints
- `AuthMiddleware` for JWT authentication
- `RateLimitMiddleware` for API rate limiting
- `ErrorMiddleware` for centralized error handling
- Express server setup with security middlewares
- Swagger/OpenAPI documentation
- API routes organization

#### Security
- JWT authentication and authorization
- Password hashing with bcrypt (configurable rounds)
- Rate limiting (general API and authentication endpoints)
- Helmet security headers
- CORS configuration
- UUID-based entity IDs
- Environment variable protection
- Input validation

#### Testing
- Jest configuration for TypeScript
- Unit tests for User entity
- Unit tests for Email value object
- Integration tests for RegisterUserUseCase
- Integration tests for LoginUserUseCase
- E2E tests for authentication endpoints
- Test setup and configuration
- Coverage reporting

#### Documentation
- README.md with quick start guide
- DOCUMENTATION.md as central documentation index
- ARCHITECTURE.md with detailed architecture explanation
- SECURITY.md with security implementation details
- DEVELOPMENT.md with development guide
- TESTING.md with testing strategy
- DEPLOYMENT.md with deployment instructions
- CHANGELOG.md (this file)
- Swagger/OpenAPI interactive documentation
- Postman collection for API testing

#### DevOps
- Dockerfile with multi-stage build
- Docker Compose configuration
- Database migrations support
- Database seeders
- Environment variable templates (.env.example)
- .gitignore and .dockerignore
- Health check endpoint
- ESLint configuration
- Prettier configuration

#### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run migration:run` - Run database migrations
- `npm run migration:revert` - Revert last migration
- `npm run seed` - Run database seeders
- `npm test` - Run all tests with coverage
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Dependencies

#### Production
- express ^4.18.2
- typeorm ^0.3.19
- mariadb ^3.2.3
- reflect-metadata ^0.2.1
- dotenv ^16.3.1
- jsonwebtoken ^9.0.2
- bcrypt ^5.1.1
- uuid ^9.0.1
- class-validator ^0.14.0
- class-transformer ^0.5.1
- express-rate-limit ^7.1.5
- helmet ^7.1.0
- cors ^2.8.5
- swagger-ui-express ^5.0.0
- swagger-jsdoc ^6.2.8

#### Development
- typescript ^5.3.3
- ts-node ^10.9.2
- ts-node-dev ^2.0.0
- jest ^29.7.0
- ts-jest ^29.1.1
- supertest ^6.3.3
- eslint ^8.56.0
- prettier ^3.1.1
- @typescript-eslint/eslint-plugin ^6.16.0
- @typescript-eslint/parser ^6.16.0

### Configuration

#### Default Ports
- API: 3000
- MariaDB: 3306

#### Default Users (After Seeding)
- Admin: admin@example.com / Admin@123
- Test: test@example.com / Test@123

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

#### Users (Protected)
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/:id` - Get user by ID

#### System
- `GET /health` - Health check endpoint
- `GET /api/v1/docs` - Swagger documentation
- `GET /api/v1/docs.json` - OpenAPI JSON specification

### Security Features
- All passwords hashed with bcrypt
- JWT tokens with configurable expiration
- Rate limiting on all endpoints
- Additional rate limiting on auth endpoints
- Helmet security headers
- CORS protection
- UUID entity IDs (non-sequential)
- Environment variable protection
- Input validation

### Testing Coverage
- Unit tests for domain entities and value objects
- Integration tests for use cases
- E2E tests for API endpoints
- Coverage reporting with Istanbul

## [Unreleased]

### Planned Features
- Refresh token rotation
- Email verification
- Password reset flow
- Two-factor authentication (2FA)
- User roles and permissions
- Pagination for list endpoints
- Filtering and sorting
- Caching layer (Redis)
- File upload support
- Audit logging
- API versioning
- GraphQL support
- WebSocket support
- Internationalization (i18n)

### Planned Improvements
- Performance optimization
- Enhanced monitoring
- Improved error messages
- Additional validation rules
- More comprehensive tests
- API documentation improvements
- Developer experience enhancements

## Version History

- **1.0.0** (2026-01-17) - Initial release

---

## Release Notes

### Version 1.0.0

This is the initial release of the Storage API, a production-ready TypeScript API built with Clean Architecture and Domain Driven Design principles.

**Highlights**:
- Complete authentication system with JWT
- Secure password hashing with bcrypt
- Comprehensive testing suite
- Full API documentation with Swagger
- Docker deployment ready
- Production-grade security features

**Getting Started**:
See [README.md](../README.md) for quick start instructions.

**Documentation**:
See [DOCUMENTATION.md](../DOCUMENTATION.md) for complete documentation.

---

## Contributing

When adding changes to this changelog:
1. Add entries under `[Unreleased]` section
2. Follow the format: `### Added/Changed/Deprecated/Removed/Fixed/Security`
3. Use present tense ("Add feature" not "Added feature")
4. Reference issue numbers when applicable
5. Move entries to a new version section on release

## Links

- [Repository](https://github.com/yourusername/storage-api)
- [Issue Tracker](https://github.com/yourusername/storage-api/issues)
- [Documentation](../DOCUMENTATION.md)
