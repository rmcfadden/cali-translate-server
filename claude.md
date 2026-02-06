# Node.js + TypeScript Best Practices

This document outlines best practices for Node.js/TypeScript development with Prettier formatting and ESLint.

## Code Style and Formatting

### Prettier Configuration

Use Prettier for consistent code formatting across the project.

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 4,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### ESLint Configuration

Use ESLint with TypeScript support for code quality and consistency. **Enforce strict no-any policy.**

```javascript
// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error", // ERROR on 'any' type
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
```

## Project Structure

```
src/
├── app.ts              # Application entry point
├── models/             # TypeScript types/interfaces
├── repositories/       # Database access layer
├── services/           # Business logic
├── routes/             # API route handlers
├── middleware/         # Express middleware
├── caching/            # Caching implementations
├── translators/        # Translation service implementations
├── cli/                # Command-line tools
└── tests/              # Test files
```

## TypeScript Best Practices

### 1. NEVER Use 'any' Type - Use Strict Type Checking

**Rule #1: Absolutely NO `any` types allowed in the codebase.**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Instead of `any`, use:

**a) Specific Types** when you know the structure:

```typescript
// Good: Define specific type for SQL parameters
export type SqlParameter = string | number | boolean | null | Buffer | Date;

export async function query<T>(
    sql: string,
    params: SqlParameter[] = [],
): Promise<T[]> {
    // Implementation
}

// Bad: Using 'any'
export async function query<T = any>(
    sql: string,
    params: any[] = [],
): Promise<T[]> {
    // Implementation
}
```

**b) `unknown` Type** when type is truly unknown (requires type guards):

```typescript
// Good: Using 'unknown' forces type checking
function processValue(value: unknown): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    }
    if (typeof value === "number") {
        return value.toString();
    }
    if (value && typeof value === "object" && "name" in value) {
        return String((value as { name: unknown }).name);
    }
    return String(value);
}

// Bad: Using 'any' bypasses all type safety
function processValue(value: any): string {
    return value.toUpperCase(); // Compiles even if value is a number!
}
```

**c) Generic Types** for reusable code:

```typescript
// Good: Generic with constraint
function findById<T extends { id: number }>(
    items: T[],
    id: number,
): T | undefined {
    return items.find((item) => item.id === id);
}

// Bad: Using 'any' loses type information
function findById(items: any[], id: number): any {
    return items.find((item) => item.id === id);
}
```

**d) Union Types** for multiple possibilities:

```typescript
// Good: Union type
type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse): void {
    if ("error" in response) {
        console.error(response.error);
    } else {
        console.log(response.data);
    }
}

// Bad: Using 'any'
function handleResponse(response: any): void {
    // No type checking!
}
```

### 2. Define Clear Interfaces/Types

```typescript
// Good: Clear, explicit types
export type User = {
    id: number;
    username: string;
    email: string;
    created: Date;
};

// Bad: Using 'any' defeats the purpose of TypeScript
export type User = {
    id: any;
    username: any;
};
```

### 3. Use Type Inference Where Appropriate

```typescript
// Good: Let TypeScript infer obvious types
const count = 42;
const message = "Hello";
const isActive = true;

// Bad: Redundant type annotations
const count: number = 42;
const message: string = "Hello";
```

### 4. Avoid Type Assertions Unless Necessary

```typescript
// Good: Use type guards
function isUser(obj: unknown): obj is User {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "id" in obj &&
        "username" in obj
    );
}

// Bad: Excessive type assertions
const user = data as User;
```

## Repository Pattern Best Practices

### 1. Use Consistent Method Naming

```typescript
export const UsersRepository = {
    // CRUD operations
    create: async (data: Partial<User>): Promise<number> => {},
    findById: async (id: number): Promise<User | undefined> => {},
    findByUsername: async (username: string): Promise<User | undefined> => {},
    list: async (): Promise<User[]> => {},
    update: async (id: number, data: Partial<User>): Promise<void> => {},
    delete: async (id: number): Promise<void> => {},
};
```

### 2. Return Consistent Types

```typescript
// Good: Consistent return types
findById: async (id: number): Promise<User | undefined> => {};
findByName: async (name: string): Promise<User | undefined> => {};

// Bad: Mixing null and undefined
findById: async (id: number): Promise<User | null> => {};
findByName: async (name: string): Promise<User | undefined> => {};
```

### 3. Use Parameterized Queries

```typescript
// Good: Parameterized query
await query("SELECT * FROM users WHERE id = ?", [id]);

// Bad: String concatenation (SQL injection risk)
await query(`SELECT * FROM users WHERE id = ${id}`);
```

## Error Handling

### 1. Use Try-Catch for Async Operations

```typescript
async function getUser(id: number): Promise<User> {
    try {
        const user = await UsersRepository.findById(id);
        if (!user) {
            throw new Error(`User ${id} not found`);
        }
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}
```

### 2. Create Custom Error Classes

```typescript
export class NotFoundError extends Error {
    constructor(resource: string, id: number | string) {
        super(`${resource} with id ${id} not found`);
        this.name = "NotFoundError";
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}
```

## Testing Best Practices

### 1. Use Descriptive Test Names

```typescript
// Good: Clear test description
test("should create a user and return its ID", async () => {});
test("should return undefined when user not found", async () => {});

// Bad: Vague test description
test("user test", async () => {});
test("works", async () => {});
```

### 2. Mock External Dependencies

```typescript
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("UsersRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should find user by id", async () => {
        const mockUser = { id: 1, username: "test" };
        mockQuery.mockResolvedValue([mockUser]);

        const result = await UsersRepository.findById(1);

        expect(result).toEqual(mockUser);
    });
});
```

### 3. Test Success, Error, and Edge Cases

```typescript
describe("findById", () => {
    test("should find a user by ID", async () => {
        // Success case
    });

    test("should return undefined when user not found", async () => {
        // Edge case
    });

    test("should handle database errors", async () => {
        // Error case
    });
});
```

## Security Best Practices

### 1. Hash Passwords with Argon2

```typescript
import argon2 from "argon2";

async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
}

async function verifyPassword(
    hash: string,
    password: string,
): Promise<boolean> {
    return await argon2.verify(hash, password);
}
```

### 2. Validate User Input

```typescript
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 30;
}
```

### 3. Use Environment Variables for Secrets

```typescript
// .env file (never commit this)
DB_PASSWORD=your_secure_password
API_KEY=your_api_key

// Load with dotenv
import dotenv from "dotenv";
dotenv.config();

const dbPassword = process.env.DB_PASSWORD;
```

## Database Best Practices

### 1. Use Connection Pooling

```typescript
export const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
```

### 2. Handle Database Connections Properly (No 'any' types!)

```typescript
// Define specific type for SQL parameters
export type SqlParameter = string | number | boolean | null | Buffer | Date;

async function query<T>(
    sql: string,
    params: SqlParameter[] = [],
): Promise<T[]> {
    const [rows] = await pool.execute<T[] & mysql.RowDataPacket[]>(
        sql,
        params,
    );
    return rows as T[];
}
```

### 3. Use Transactions for Multiple Operations

```typescript
async function transferFunds(
    fromId: number,
    toId: number,
    amount: number,
): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            "UPDATE accounts SET balance = balance - ? WHERE id = ?",
            [amount, fromId],
        );

        await connection.execute(
            "UPDATE accounts SET balance = balance + ? WHERE id = ?",
            [amount, toId],
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
```

## API Design Best Practices

### 1. Use Consistent HTTP Methods

- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT`/`PATCH` - Update resources
- `DELETE` - Delete resources

### 2. Return Appropriate HTTP Status Codes

```typescript
// 200 OK - Success
res.status(200).json({ data: user });

// 201 Created - Resource created
res.status(201).json({ id: newUserId });

// 400 Bad Request - Invalid input
res.status(400).json({ error: "Invalid email format" });

// 401 Unauthorized - Authentication required
res.status(401).json({ error: "Authentication required" });

// 404 Not Found - Resource not found
res.status(404).json({ error: "User not found" });

// 500 Internal Server Error - Server error
res.status(500).json({ error: "Internal server error" });
```

### 3. Use Middleware for Common Tasks

```typescript
// Authentication middleware
export const authenticate = async (req, res, next) => {
    try {
        const apiKey = req.headers["x-api-key"];
        if (!apiKey) {
            return res.status(401).json({ error: "API key required" });
        }
        // Verify API key
        const user = await verifyApiKey(apiKey);
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid API key" });
    }
};
```

## Performance Best Practices

### 1. Use Caching Strategically

```typescript
// Cache expensive operations
const cachedResult = await cache.get(cacheKey);
if (cachedResult) {
    return JSON.parse(cachedResult);
}

const result = await expensiveOperation();
await cache.set(cacheKey, JSON.stringify(result));
return result;
```

### 2. Implement Rate Limiting

```typescript
const rateLimit = async (apiKey: string, limit: number, interval: string) => {
    const count = await getRequestCount(apiKey, interval);
    if (count >= limit) {
        throw new Error("Rate limit exceeded");
    }
};
```

### 3. Use Indexes in Database

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_api_keys_secret ON api_keys(secret);
CREATE INDEX idx_api_logs_created ON api_logs(created);
```

## Code Organization

### 1. Separate Concerns

```typescript
// Bad: Everything in one file
// app.ts contains routes, business logic, and database queries

// Good: Separated by concern
// routes/users.ts - Route handlers
// services/user-service.ts - Business logic
// repositories/users-repository.ts - Database access
```

### 2. Use Dependency Injection

```typescript
export class TranslationService {
    constructor(
        private translator: Translator,
        private cache: ICache,
    ) {}

    async translate(text: string, targetLang: string): Promise<string> {
        const cacheKey = this.getCacheKey(text, targetLang);
        const cached = await this.cache.get(cacheKey);
        if (cached) return cached;

        const result = await this.translator.translate(text, targetLang);
        await this.cache.set(cacheKey, result);
        return result;
    }
}
```

## Logging

### 1. Use Structured Logging

```typescript
// Good: Structured logs
console.log({
    level: "info",
    message: "User created",
    userId: user.id,
    timestamp: new Date().toISOString(),
});

// Bad: Unstructured logs
console.log("User created: " + user.id);
```

### 2. Log Important Events

```typescript
// Authentication events
console.log({ level: "info", event: "user_login", userId, ip });

// Errors with context
console.error({
    level: "error",
    message: "Database query failed",
    error: error.message,
    query: sql,
});
```

## Documentation

### 1. Document Public APIs

```typescript
/**
 * Creates a new user with the given username and password.
 *
 * @param username - The username for the new user
 * @param password - The plain text password (will be hashed)
 * @returns The ID of the newly created user
 * @throws {ValidationError} If username is invalid
 */
async create(username: string, password: string): Promise<number>;
```

### 2. Keep README Updated

Include:
- Project description
- Installation instructions (using Yarn)
- Environment variables
- API documentation
- Development workflow
- Testing instructions

**Example Installation Section:**

```markdown
## Installation

1. Clone the repository
   ```bash
   git clone <repo-url>
   cd project-name
   ```

2. Install dependencies with Yarn
   ```bash
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations
   ```bash
   yarn migrate
   ```

5. Start development server
   ```bash
   yarn dev
   ```
```

## Package Management with Yarn

This project uses **Yarn** as the package manager for faster, more reliable dependency management.

### Installing Yarn

```bash
# Install Yarn globally via npm
npm install -g yarn

# Or via Corepack (recommended for Node.js 16.10+)
corepack enable
```

### Common Yarn Commands

```bash
# Install dependencies
yarn install

# Add a package
yarn add package-name

# Add a dev dependency
yarn add -D package-name

# Remove a package
yarn remove package-name

# Upgrade dependencies
yarn upgrade

# Upgrade interactive
yarn upgrade-interactive
```

### Yarn Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js",
    "dev": "nodemon --watch 'src/**/*.ts' --exec ts-node src/app.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\""
  }
}
```

**Run scripts with Yarn:**

```bash
# Development
yarn dev

# Build
yarn build

# Start production
yarn start

# Run tests
yarn test
yarn test:watch
yarn test:coverage

# Linting
yarn lint
yarn lint:fix

# Formatting
yarn format
yarn format:check
```

### Why Yarn?

**Advantages over npm:**
- **Faster**: Parallel installation and caching
- **Deterministic**: `yarn.lock` ensures consistent installs across environments
- **Offline Mode**: Can install packages without internet if cached
- **Workspaces**: Better monorepo support
- **Security**: Built-in integrity checking

### Yarn Lock File

**Always commit `yarn.lock`** to version control:

```bash
git add yarn.lock
git commit -m "Update dependencies"
```

This ensures all team members and CI/CD systems install identical dependency versions.

### Yarn Best Practices

**1. Use Exact Versions for Critical Dependencies**

```json
{
  "dependencies": {
    "express": "5.1.0",
    "mysql2": "3.15.3"
  }
}
```

**2. Use `yarn.lock` for Reproducible Builds**

Never manually edit `yarn.lock`. Let Yarn manage it.

**3. Clean Install in CI/CD**

```bash
# In CI/CD pipelines, use frozen lockfile
yarn install --frozen-lockfile
```

This ensures CI fails if lock file is out of sync with package.json.

**4. Audit Dependencies Regularly**

```bash
# Check for security vulnerabilities
yarn audit

# Fix vulnerabilities automatically
yarn audit fix
```

**5. Keep Dependencies Updated**

```bash
# Check for outdated packages
yarn outdated

# Interactive upgrade
yarn upgrade-interactive --latest
```

**6. Use Workspaces for Monorepos**

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

## Git Workflow

### 1. Meaningful Commit Messages

```
Good:
- "Add user authentication middleware"
- "Fix SQL injection vulnerability in user search"
- "Refactor repository methods to use arrow functions"

Bad:
- "update"
- "fix bug"
- "changes"
```

### 2. Use .gitignore

```
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Yarn
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
.pnp.*
```

### 3. Always Commit Lock Files

```bash
# Commit yarn.lock with dependency changes
git add package.json yarn.lock
git commit -m "Update dependencies"
```

**Never** add `yarn.lock` to `.gitignore`. It ensures consistent installations across all environments.

## CI/CD with Yarn

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run linter
        run: yarn lint

      - name: Run tests
        run: yarn test:coverage

      - name: Build
        run: yarn build
```

### Docker with Yarn

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build
RUN yarn build

# Remove dev dependencies
RUN yarn install --frozen-lockfile --production=true

# Start
CMD ["yarn", "start"]
```

## Quick Reference

### Yarn Commands Cheat Sheet

| Task | Command |
|------|---------|
| Install dependencies | `yarn install` |
| Add package | `yarn add <package>` |
| Add dev dependency | `yarn add -D <package>` |
| Remove package | `yarn remove <package>` |
| Update package | `yarn upgrade <package>` |
| Run script | `yarn <script-name>` |
| Check outdated | `yarn outdated` |
| Security audit | `yarn audit` |
| Clean cache | `yarn cache clean` |
| List installed | `yarn list` |
| Check why package exists | `yarn why <package>` |

### TypeScript + Yarn Project Setup

```bash
# Create new project
mkdir my-project && cd my-project

# Initialize package.json
yarn init -y

# Add TypeScript and dependencies
yarn add -D typescript @types/node ts-node nodemon

# Add ESLint and Prettier
yarn add -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Add Jest for testing
yarn add -D jest ts-jest @types/jest

# Add Express (example)
yarn add express
yarn add -D @types/express

# Initialize TypeScript config
yarn tsc --init

# Create directory structure
mkdir -p src/{models,repositories,services,routes,middleware}
mkdir -p src/tests
```

## Summary

Following these best practices will help ensure your Node.js/TypeScript project is:

- **Maintainable** - Consistent code style and clear organization
- **Secure** - Input validation, password hashing, parameterized queries
- **Testable** - Mocked dependencies, comprehensive test coverage
- **Performant** - Caching, connection pooling, rate limiting
- **Reliable** - Error handling, logging, type safety
- **Reproducible** - Yarn lock file ensures consistent builds
- **Type-Safe** - Zero `any` types, strict TypeScript configuration
