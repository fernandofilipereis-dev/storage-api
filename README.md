# Storage API

A production-ready TypeScript API built with Node.js, following Clean Architecture and Domain Driven Design principles.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd storage-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start with Docker (Recommended)**
```bash
# Start all services (API + MariaDB)
docker-compose up --build

# Run migrations
docker-compose exec api npm run migration:run

# Run seeders
docker-compose exec api npm run seed
```

5. **Or start locally**
```bash
# Make sure MariaDB is running
docker-compose up mariadb -d

# Run migrations
npm run migration:run

# Run seeders
npm run seed

# Start development server
npm run dev
```

### Access the API

- **API Base URL**: http://localhost:3000/api/v1
- **Swagger Documentation**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/health

## 📚 Documentation

For detailed documentation, see the [Documentation Index](./DOCUMENTATION.md).

- [Architecture](./docs/ARCHITECTURE.md) - System architecture and design patterns
- [Security](./docs/SECURITY.md) - Security implementation details
- [Development](./docs/DEVELOPMENT.md) - Development guide and best practices
- [Testing](./docs/TESTING.md) - Testing strategy and guidelines
- [Deployment](./docs/DEPLOYMENT.md) - Deployment instructions
- [Changelog](./docs/CHANGELOG.md) - Version history

## 🏗️ Architecture

This project follows **Clean Architecture** and **Domain Driven Design** principles:

```
src/
├── domain/              # Enterprise Business Rules
│   ├── entities/        # Domain entities
│   ├── value-objects/   # Immutable value objects
│   ├── repositories/    # Repository interfaces (ports)
│   └── services/        # Domain services
├── application/         # Application Business Rules
│   ├── use-cases/       # Use case implementations
│   └── dtos/            # Data Transfer Objects
├── infrastructure/      # Frameworks & Drivers
│   ├── database/        # TypeORM configuration
│   ├── security/        # JWT, bcrypt implementations
│   └── config/          # Configuration files
└── presentation/        # Interface Adapters
    ├── controllers/     # HTTP controllers
    ├── middlewares/     # Express middlewares
    ├── routes/          # API routes
    └── swagger/         # API documentation
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: MariaDB
- **Authentication**: JWT + bcrypt
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Containerization**: Docker

## 🔐 Security Features

- JWT authentication and authorization
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- CORS configuration
- Environment variable protection
- UUID-based entity IDs

## 📝 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run migration:run    # Run database migrations
npm run migration:revert # Revert last migration
npm run seed             # Run database seeders
npm test                 # Run all tests with coverage
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run e2e tests
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📦 Default Users (After Seeding)

- **Admin**: admin@example.com / Admin@123
- **Test**: test@example.com / Test@123

## 🤝 Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update documentation
4. Follow SOLID principles
5. Use conventional commits

## 📄 License

ISC

## 📧 Support

For support, email support@example.com
