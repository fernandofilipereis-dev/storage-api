# Development Guide

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd storage-api
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start database**:
   ```bash
   docker-compose up mariadb -d
   ```

4. **Run migrations**:
   ```bash
   npm run migration:run
   ```

5. **Seed database**:
   ```bash
   npm run seed
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

## Project Structure

```
storage-api/
├── src/
│   ├── domain/              # Business logic
│   │   ├── entities/        # Domain entities
│   │   ├── value-objects/   # Value objects
│   │   ├── repositories/    # Repository interfaces
│   │   ├── services/        # Domain service interfaces
│   │   └── exceptions/      # Domain exceptions
│   ├── application/         # Use cases
│   │   ├── use-cases/       # Business use cases
│   │   └── dtos/            # Data transfer objects
│   ├── infrastructure/      # External dependencies
│   │   ├── database/        # TypeORM setup
│   │   │   ├── config/      # Database config
│   │   │   ├── entities/    # ORM entities
│   │   │   ├── repositories/# Repository implementations
│   │   │   ├── migrations/  # Database migrations
│   │   │   └── seeders/     # Database seeders
│   │   ├── security/        # Security implementations
│   │   └── config/          # App configuration
│   ├── presentation/        # HTTP layer
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── routes/          # Route definitions
│   │   └── swagger/         # API documentation
│   ├── server.ts            # Express setup
│   └── index.ts             # Entry point
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
├── docs/                    # Documentation
└── postman/                 # Postman collection
```

## Development Workflow

### 1. Create a New Feature

Follow this order:

#### a. Domain Layer
```typescript
// 1. Create entity
// src/domain/entities/Product.ts
export class Product {
  constructor(private props: ProductProps) {
    this.validate();
  }
  // Business logic here
}

// 2. Create repository interface
// src/domain/repositories/IProductRepository.ts
export interface IProductRepository {
  save(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
}
```

#### b. Application Layer
```typescript
// 3. Create DTO
// src/application/dtos/ProductDTO.ts
export interface CreateProductDTO {
  name: string;
  price: number;
}

// 4. Create use case
// src/application/use-cases/product/CreateProductUseCase.ts
export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}
  
  async execute(dto: CreateProductDTO): Promise<ProductResponseDTO> {
    // Implementation
  }
}
```

#### c. Infrastructure Layer
```typescript
// 5. Create ORM entity
// src/infrastructure/database/entities/ProductEntity.ts
@Entity('products')
export class ProductEntity {
  @PrimaryColumn('uuid')
  id!: string;
  // ...
}

// 6. Implement repository
// src/infrastructure/database/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  // TypeORM implementation
}

// 7. Create migration
npm run typeorm migration:create src/infrastructure/database/migrations/CreateProductsTable
```

#### d. Presentation Layer
```typescript
// 8. Create controller
// src/presentation/controllers/ProductController.ts
export class ProductController {
  create = async (req: Request, res: Response): Promise<void> => {
    // Implementation
  };
}

// 9. Create routes
// src/presentation/routes/product.routes.ts
router.post('/', productController.create);

// 10. Register routes
// src/presentation/routes/index.ts
router.use('/products', productRoutes);
```

### 2. Database Migrations

#### Create Migration
```bash
npm run typeorm migration:create src/infrastructure/database/migrations/MigrationName
```

#### Run Migrations
```bash
npm run migration:run
```

#### Revert Migration
```bash
npm run migration:revert
```

### 3. Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Specific suite
npm run test:unit
npm run test:integration
npm run test:e2e

# With coverage
npm test -- --coverage
```

### 4. Code Quality

```bash
# Lint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Code Standards

### TypeScript

- Use strict mode
- Avoid `any` type
- Use interfaces for contracts
- Use types for data structures

### Naming Conventions

- **Classes**: PascalCase (`UserController`)
- **Interfaces**: PascalCase with `I` prefix (`IUserRepository`)
- **Variables**: camelCase (`userId`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Files**: PascalCase for classes (`UserController.ts`)

### File Organization

- One class per file
- File name matches class name
- Group related files in folders
- Use index files for exports

### Comments

- Use JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up to date
- Remove commented code

### Error Handling

```typescript
// Use domain exceptions
throw new NotFoundException('User not found');

// Don't expose internal errors
catch (error) {
  // Log error
  throw new DomainException('Operation failed');
}
```

## Environment Variables

### Development
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
```

### Testing
```env
NODE_ENV=test
DB_DATABASE=storage_db_test
```

### Production
```env
NODE_ENV=production
# Use strong secrets!
JWT_SECRET=<generated-secret>
```

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Logging

```typescript
// Development
if (Config.isDevelopment()) {
  console.log('Debug info:', data);
}

// Production: Use proper logging library
// (Winston, Pino, etc.)
```

## Common Tasks

### Add New Endpoint

1. Create use case
2. Create controller method
3. Add route
4. Add Swagger documentation
5. Write tests
6. Update Postman collection

### Add New Entity

1. Create domain entity
2. Create repository interface
3. Create ORM entity
4. Implement repository
5. Create migration
6. Write tests

### Update Database Schema

1. Create migration
2. Update ORM entity
3. Update domain entity if needed
4. Run migration
5. Test changes

## Troubleshooting

### Database Connection Issues

```bash
# Check if MariaDB is running
docker-compose ps

# View logs
docker-compose logs mariadb

# Restart database
docker-compose restart mariadb
```

### Migration Issues

```bash
# Check migration status
npm run typeorm migration:show

# Revert last migration
npm run migration:revert

# Drop database and recreate
docker-compose down -v
docker-compose up mariadb -d
npm run migration:run
npm run seed
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### TypeScript Errors

```bash
# Clean build
rm -rf dist
npm run build

# Check TypeScript version
npx tsc --version
```

## Git Workflow

### Commit Messages

Follow Conventional Commits:
```
feat: add product creation endpoint
fix: resolve authentication bug
docs: update API documentation
test: add user service tests
refactor: improve error handling
```

### Branch Strategy

```
main          # Production
develop       # Development
feature/*     # New features
fix/*         # Bug fixes
hotfix/*      # Production fixes
```

## Performance Tips

1. **Use database indexes**
2. **Implement caching** (Redis)
3. **Optimize queries** (avoid N+1)
4. **Use connection pooling**
5. **Implement pagination**
6. **Monitor performance**

## Security Checklist

- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Hash passwords
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Set security headers
- [ ] Keep dependencies updated
- [ ] Don't commit secrets

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Guide](https://expressjs.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

## Getting Help

1. Check this documentation
2. Review existing code
3. Check test files for examples
4. Ask the team
5. Create an issue
