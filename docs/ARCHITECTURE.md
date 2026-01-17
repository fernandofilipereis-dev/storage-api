# Architecture Documentation

## Overview

This project implements **Clean Architecture** and **Domain Driven Design (DDD)** principles to create a maintainable, testable, and scalable API.

## Clean Architecture Layers

The application is divided into four main layers, each with specific responsibilities:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (Controllers, Routes, Middleware)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Application Layer                │
│      (Use Cases, DTOs, Interfaces)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Domain Layer                   │
│  (Entities, Value Objects, Interfaces)  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Infrastructure Layer              │
│   (Database, Security, External APIs)   │
└─────────────────────────────────────────┘
```

### 1. Domain Layer (Enterprise Business Rules)

**Location**: `src/domain/`

**Responsibility**: Contains the core business logic and rules that are independent of any framework or external dependency.

**Components**:
- **Entities** (`entities/`): Core business objects with identity (e.g., `User`)
  - Encapsulate business logic
  - Validate their own state
  - Use UUID for identification
  
- **Value Objects** (`value-objects/`): Immutable objects defined by their attributes (e.g., `Email`)
  - No identity
  - Validate themselves
  - Immutable
  
- **Repository Interfaces** (`repositories/`): Define contracts for data access (Ports)
  - Abstract data persistence
  - Enable dependency inversion
  
- **Domain Services** (`services/`): Interfaces for operations that don't belong to entities
  - `IPasswordHasher`: Password hashing contract
  - `ITokenService`: JWT token contract

**Principles**:
- No dependencies on outer layers
- Framework-independent
- Database-independent
- Pure business logic

### 2. Application Layer (Application Business Rules)

**Location**: `src/application/`

**Responsibility**: Orchestrates the flow of data between layers and implements use cases.

**Components**:
- **Use Cases** (`use-cases/`): Application-specific business rules
  - `RegisterUserUseCase`: User registration logic
  - `LoginUserUseCase`: Authentication logic
  - `GetUserByIdUseCase`: User retrieval
  - `UpdateUserUseCase`: User update logic
  
- **DTOs** (`dtos/`): Data Transfer Objects
  - Define input/output contracts
  - Decouple layers
  
**Principles**:
- Depends only on Domain layer
- Orchestrates domain entities
- Framework-independent
- Contains application-specific logic

### 3. Infrastructure Layer (Frameworks & Drivers)

**Location**: `src/infrastructure/`

**Responsibility**: Implements technical details and external dependencies.

**Components**:
- **Database** (`database/`):
  - TypeORM configuration
  - Entity mappings
  - Repository implementations (Adapters)
  - Migrations
  - Seeders
  
- **Security** (`security/`):
  - `BcryptService`: Password hashing implementation
  - `JwtService`: JWT token implementation
  
- **Configuration** (`config/`):
  - Environment variables
  - Application configuration

**Principles**:
- Implements interfaces defined in Domain layer
- Contains framework-specific code
- Adapts external libraries to domain interfaces

### 4. Presentation Layer (Interface Adapters)

**Location**: `src/presentation/`

**Responsibility**: Handles HTTP communication and adapts data for use cases.

**Components**:
- **Controllers** (`controllers/`):
  - `AuthController`: Authentication endpoints
  - `UserController`: User management endpoints
  
- **Middlewares** (`middlewares/`):
  - `AuthMiddleware`: JWT authentication
  - `RateLimitMiddleware`: Rate limiting
  - `ErrorMiddleware`: Error handling
  
- **Routes** (`routes/`):
  - Route definitions
  - Endpoint organization
  
- **Swagger** (`swagger/`):
  - API documentation configuration

**Principles**:
- Converts HTTP requests to use case inputs
- Converts use case outputs to HTTP responses
- Handles authentication and authorization
- Manages error responses

## Dependency Rule

Dependencies flow inward:
```
Presentation → Application → Domain ← Infrastructure
```

- **Domain** has no dependencies
- **Application** depends only on Domain
- **Infrastructure** implements Domain interfaces
- **Presentation** depends on Application and Domain

## Design Patterns

### 1. Ports and Adapters (Hexagonal Architecture)

**Ports** (Interfaces in Domain):
- `IUserRepository`
- `IPasswordHasher`
- `ITokenService`

**Adapters** (Implementations in Infrastructure):
- `UserRepository` (TypeORM adapter)
- `BcryptService` (bcrypt adapter)
- `JwtService` (jsonwebtoken adapter)

### 2. Repository Pattern

Abstracts data access logic:
```typescript
// Port (Domain)
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// Adapter (Infrastructure)
class UserRepository implements IUserRepository {
  // TypeORM implementation
}
```

### 3. Dependency Injection

Use cases receive dependencies through constructor:
```typescript
class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService
  ) {}
}
```

### 4. Factory Pattern

Controllers create use case instances with dependencies:
```typescript
class AuthController {
  constructor() {
    const userRepository = new UserRepository();
    const passwordHasher = new BcryptService();
    const tokenService = new JwtService();
    
    this.registerUseCase = new RegisterUserUseCase(
      userRepository,
      passwordHasher,
      tokenService
    );
  }
}
```

## SOLID Principles

### Single Responsibility Principle (SRP)
Each class has one reason to change:
- `User` entity: Business logic only
- `UserRepository`: Data access only
- `RegisterUserUseCase`: Registration logic only

### Open/Closed Principle (OCP)
Open for extension, closed for modification:
- Add new use cases without modifying existing ones
- Add new repositories without changing interfaces

### Liskov Substitution Principle (LSP)
Implementations can replace interfaces:
- Any `IUserRepository` implementation works
- Any `IPasswordHasher` implementation works

### Interface Segregation Principle (ISP)
Specific interfaces instead of general ones:
- `IPasswordHasher`: Only password operations
- `ITokenService`: Only token operations

### Dependency Inversion Principle (DIP)
Depend on abstractions, not concretions:
- Use cases depend on `IUserRepository`, not `UserRepository`
- Application depends on interfaces, not implementations

## Domain Driven Design

### Entities
- Have unique identity (UUID)
- Contain business logic
- Validate themselves
- Example: `User`

### Value Objects
- No identity
- Immutable
- Defined by attributes
- Example: `Email`

### Aggregates
- Cluster of entities and value objects
- Consistency boundary
- Example: `User` aggregate

### Repositories
- Provide collection-like interface
- Abstract persistence
- One per aggregate root

### Domain Services
- Operations that don't belong to entities
- Stateless
- Example: Password hashing, token generation

## Data Flow

### Request Flow (Example: Register User)

```
1. HTTP Request
   ↓
2. AuthController.register()
   ↓
3. RegisterUserUseCase.execute()
   ↓
4. Domain: Create User entity
   ↓
5. Infrastructure: UserRepository.save()
   ↓
6. Database: TypeORM persists
   ↓
7. Response flows back up
```

### Dependency Flow

```
Controller → Use Case → Domain Entity
                ↓
         Repository Interface (Port)
                ↑
         Repository Implementation (Adapter)
                ↓
            Database
```

## Testing Strategy

### Unit Tests
- Test domain entities in isolation
- Test value objects
- No external dependencies

### Integration Tests
- Test use cases with mocked repositories
- Test business logic flow
- Mock infrastructure

### E2E Tests
- Test complete request/response cycle
- Use real database (test environment)
- Test authentication flow

## Benefits of This Architecture

1. **Testability**: Easy to test with mocked dependencies
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Easy to swap implementations
4. **Scalability**: Can grow without becoming complex
5. **Independence**: Business logic independent of frameworks
6. **Reusability**: Domain logic can be reused across projects

## Adding New Features

### 1. Define Domain Entity
```typescript
// src/domain/entities/Product.ts
export class Product {
  // Business logic
}
```

### 2. Create Repository Interface
```typescript
// src/domain/repositories/IProductRepository.ts
export interface IProductRepository {
  // Methods
}
```

### 3. Implement Use Case
```typescript
// src/application/use-cases/product/CreateProductUseCase.ts
export class CreateProductUseCase {
  // Application logic
}
```

### 4. Implement Repository
```typescript
// src/infrastructure/database/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  // TypeORM implementation
}
```

### 5. Create Controller
```typescript
// src/presentation/controllers/ProductController.ts
export class ProductController {
  // HTTP handling
}
```

### 6. Add Routes
```typescript
// src/presentation/routes/product.routes.ts
router.post('/', productController.create);
```

## Conclusion

This architecture ensures:
- Business logic is protected and testable
- External dependencies are isolated
- Code is maintainable and scalable
- Changes in one layer don't affect others
- Easy to understand and navigate
