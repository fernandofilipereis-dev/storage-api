# Testing Documentation

## Overview

This project uses a comprehensive testing strategy covering unit, integration, and end-to-end tests.

## Testing Stack

- **Framework**: Jest
- **HTTP Testing**: Supertest
- **Coverage**: Istanbul (built into Jest)
- **Mocking**: Jest mocks

## Test Structure

```
tests/
├── setup.ts              # Test configuration
├── unit/                 # Unit tests
│   ├── domain/
│   │   ├── entities/     # Entity tests
│   │   └── value-objects/# Value object tests
├── integration/          # Integration tests
│   └── use-cases/        # Use case tests
└── e2e/                  # End-to-end tests
    └── auth.test.ts      # API endpoint tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E tests only
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm test -- --coverage
```

Coverage reports are generated in `coverage/` directory.

## Testing Layers

### 1. Unit Tests

**Purpose**: Test individual components in isolation

**Location**: `tests/unit/`

**Characteristics**:
- No external dependencies
- Fast execution
- Test single responsibility
- Mock all dependencies

**Example - Entity Test**:
```typescript
// tests/unit/domain/entities/User.test.ts
describe('User Entity', () => {
  it('should create a user with valid data', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
    });

    expect(user.name).toBe('John Doe');
    expect(user.id).toBeDefined();
  });

  it('should throw error when name is empty', () => {
    expect(() => new User({
      name: '',
      email: 'john@example.com',
      password: 'hashedPassword',
    })).toThrow('Name is required');
  });
});
```

**What to Test**:
- Entity validation
- Business logic
- Value object behavior
- Domain rules

### 2. Integration Tests

**Purpose**: Test component interactions with mocked external dependencies

**Location**: `tests/integration/`

**Characteristics**:
- Mock infrastructure layer
- Test use case logic
- Verify component collaboration
- Faster than E2E tests

**Example - Use Case Test**:
```typescript
// tests/integration/use-cases/RegisterUserUseCase.test.ts
describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockTokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      // ... other methods
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      // ... other methods
    };

    useCase = new RegisterUserUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenService
    );
  });

  it('should register a new user successfully', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
    mockUserRepository.save.mockImplementation(async (user) => user);
    mockTokenService.generateAccessToken.mockReturnValue('accessToken');
    mockTokenService.generateRefreshToken.mockReturnValue('refreshToken');

    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken');
    expect(mockPasswordHasher.hash).toHaveBeenCalled();
  });
});
```

**What to Test**:
- Use case logic
- Error handling
- Business rule enforcement
- Dependency interactions

### 3. End-to-End Tests

**Purpose**: Test complete request/response cycle

**Location**: `tests/e2e/`

**Characteristics**:
- Use real database (test environment)
- Test HTTP endpoints
- Verify authentication flow
- Slower but comprehensive

**Example - API Test**:
```typescript
// tests/e2e/auth.test.ts
describe('Auth E2E Tests', () => {
  let app: any;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const server = new Server();
    app = server.getApp();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
    });
  });
});
```

**What to Test**:
- API endpoints
- Authentication flow
- Authorization
- Error responses
- Rate limiting

## Writing Tests

### Test Structure

Follow AAA pattern:
```typescript
it('should do something', () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = doSomething(input);
  
  // Assert
  expect(result).toBe('expected');
});
```

### Naming Conventions

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test
    });
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Cover all use cases
- **E2E Tests**: Cover all API endpoints

### Mocking

#### Mock Repository
```typescript
const mockRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  save: jest.fn(),
  // ... all interface methods
};
```

#### Mock Return Values
```typescript
mockRepository.findById.mockResolvedValue(user);
mockRepository.save.mockRejectedValue(new Error('DB Error'));
```

#### Verify Calls
```typescript
expect(mockRepository.save).toHaveBeenCalledWith(user);
expect(mockRepository.save).toHaveBeenCalledTimes(1);
```

## Test Data

### Factory Pattern

Create test data factories:
```typescript
// tests/factories/UserFactory.ts
export class UserFactory {
  static create(overrides?: Partial<UserProps>): User {
    return new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      ...overrides,
    });
  }
}

// Usage
const user = UserFactory.create({ name: 'Custom Name' });
```

### Unique Data

For E2E tests, use unique data:
```typescript
const email = `test${Date.now()}@example.com`;
```

## Best Practices

### 1. Test Isolation

Each test should be independent:
```typescript
beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
});
```

### 2. Test One Thing

```typescript
// Good
it('should validate email format', () => {
  expect(() => new Email('invalid')).toThrow();
});

// Bad - testing multiple things
it('should validate email and create user', () => {
  // Too much in one test
});
```

### 3. Descriptive Names

```typescript
// Good
it('should throw ConflictException when user already exists', () => {});

// Bad
it('should work', () => {});
```

### 4. Avoid Test Interdependence

```typescript
// Bad - tests depend on order
let user;
it('creates user', () => { user = createUser(); });
it('updates user', () => { updateUser(user); });

// Good - each test is independent
it('creates user', () => {
  const user = createUser();
  expect(user).toBeDefined();
});

it('updates user', () => {
  const user = createUser();
  const updated = updateUser(user);
  expect(updated).toBeDefined();
});
```

### 5. Test Error Cases

```typescript
it('should handle database errors gracefully', async () => {
  mockRepository.save.mockRejectedValue(new Error('DB Error'));
  
  await expect(useCase.execute(dto)).rejects.toThrow();
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mariadb:
        image: mariadb:11.2
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: storage_db_test
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint
```

## Coverage Reports

### View Coverage

```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Configure in `jest.config.js`:
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

## Debugging Tests

### Run Single Test

```bash
npm test -- User.test.ts
```

### Debug in VS Code

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

### Verbose Output

```bash
npm test -- --verbose
```

## Common Issues

### Test Timeout

```typescript
// Increase timeout for slow tests
it('slow operation', async () => {
  // Test
}, 10000); // 10 seconds
```

### Database Cleanup

```typescript
afterEach(async () => {
  // Clean up test data
  await AppDataSource.query('DELETE FROM users WHERE email LIKE "test%"');
});
```

### Async Issues

```typescript
// Always await async operations
it('async test', async () => {
  const result = await asyncOperation();
  expect(result).toBeDefined();
});
```

## Testing Checklist

- [ ] Unit tests for all entities
- [ ] Unit tests for all value objects
- [ ] Integration tests for all use cases
- [ ] E2E tests for all endpoints
- [ ] Test error cases
- [ ] Test validation
- [ ] Test authentication
- [ ] Test authorization
- [ ] Achieve coverage goals
- [ ] All tests pass in CI

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
