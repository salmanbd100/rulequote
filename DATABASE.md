# Database Documentation

This document contains important information about database setup, configuration, and best practices for this monorepo project. Use this as a reference when making database-related decisions.

## Table of Contents

- [Quick Start Workflow](#quick-start-workflow)
- [Prisma Initialization Location](#prisma-initialization-location)
- [Current Database Setup](#current-database-setup)
- [Database Architecture Decisions](#database-architecture-decisions)
- [Understanding Migrations](#understanding-migrations)
- [Common Commands](#common-commands)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Quick Start Workflow

### First Time Setup

```bash
# 1. Initialize Prisma (if not already done)
cd apps/api
pnpm prisma init
cd ../..

# 2. Configure your schema.prisma file with your models

# 3. Set up DATABASE_URL in .env file
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# 4. Create and apply initial migration
pnpm prisma migrate dev --name init

# 5. Generate Prisma Client (usually done automatically by migrate dev)
pnpm prisma generate
```

### Daily Development Workflow

```bash
# 1. Modify schema.prisma

# 2. Create and apply migration
pnpm prisma migrate dev --name descriptive_migration_name

# 3. Use Prisma Client in your code
# import { PrismaClient } from '../../generated/prisma';
```

### Production Deployment

```bash
# Apply pending migrations
pnpm prisma migrate deploy

# Generate Prisma Client
pnpm prisma generate
```

## Prisma Initialization Location

### Why Run `prisma init` in `apps/api` Instead of Root?

**IMPORTANT**: When initializing Prisma in this monorepo, always run `prisma init` from within the `apps/api` directory, not from the root.

#### Correct Approach:
```bash
cd apps/api
pnpm prisma init
cd ../..
```

#### Problems with Running `prisma init` at Root:

##### 1. **Path Resolution and Generator Output**
The Prisma schema uses relative paths for generator output:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

If you run `prisma init` at the root:
- It may overwrite or conflict with existing `prisma/` directory
- The generator output path (`../generated/prisma`) is relative to the schema location
- When the API app tries to import Prisma Client, the path resolution may fail
- The generated client location may not be accessible from `apps/api/`

##### 2. **Monorepo Isolation**
In an Nx monorepo, each application typically needs:
- **Own database connection** (different `DATABASE_URL`)
- **Own environment variables** (`.env` file)
- **Own Prisma Client instance**

Running `prisma init` at the root creates a shared setup, which can cause:
- **Conflicts** if multiple apps need different databases
- **Import path issues** when apps try to use the client
- **Build/caching issues** with Nx's build system

##### 3. **Nx Build System Compatibility**
When Nx builds `apps/api`:
- It expects dependencies to be relative to the app's location
- Running Prisma commands from `apps/api` ensures paths resolve correctly
- The generated client will be in a location the API app can reliably import
- Build caching and dependency tracking work correctly

##### 4. **Environment Variables**
`prisma init` creates a `.env` file. If run at the root:
- The `DATABASE_URL` and other variables are at the root level
- The API app may need its own `.env` or may not find the root one
- Paths in migrations and generated files may be incorrect
- Environment variable resolution can become confusing

### Recommendation

**For API-specific Prisma setup**: Run `prisma init` in `apps/api`. This will:
- ✅ Create `apps/api/prisma/` with the schema
- ✅ Create `apps/api/.env` for the API's database configuration
- ✅ Generate the client in a location the API can import
- ✅ Keep the setup isolated and aligned with Nx conventions

**For shared Prisma setup**: If you want a shared Prisma setup for the entire monorepo, keep it at the root, but ensure:
- ✅ The generator output path works for all consuming apps
- ✅ All apps can resolve the generated client correctly
- ✅ Environment variables are accessible to all apps
- ✅ Migration paths are consistent across the workspace

## Current Database Setup

### Prisma Configuration

**Location**: `/prisma/schema.prisma` (root level)

**Current Configuration**:
- **Provider**: PostgreSQL
- **Client Output**: `../generated/prisma` (relative to schema location)
- **Migrations Path**: `prisma/migrations` (configured in `prisma.config.ts`)

**Configuration File**: `/prisma.config.ts`
- Uses `dotenv` to load environment variables
- References schema at `prisma/schema.prisma`
- Configures migrations path

### Environment Variables

**Required**: `DATABASE_URL`
- Should be set in `.env` file (not committed to version control)
- Format: `postgresql://user:password@host:port/database`

### Generated Client Location

The Prisma Client is generated to: `generated/prisma/` (relative to workspace root)

**Import in code**:
```typescript
import { PrismaClient } from '../generated/prisma';
// or from apps/api:
import { PrismaClient } from '../../generated/prisma';
```

## Database Architecture Decisions

### Decision Matrix

When deciding where to place Prisma setup:

| Scenario | Location | Reason |
|----------|----------|--------|
| Single API app needs database | `apps/api/prisma/` | Isolation, clear ownership |
| Multiple apps share same database | Root `prisma/` | Shared schema, single source of truth |
| Multiple apps with different databases | Each app's `prisma/` | Complete isolation, independent schemas |
| Library needs database access | Root `prisma/` or shared lib | Reusable across apps |

### Current Architecture

**Current Setup**: Root-level Prisma schema
- **Pros**: Single schema, shared migrations, centralized management
- **Cons**: All apps must use same database, path resolution complexity
- **Best For**: Monorepo with single database shared across apps

**Alternative Setup**: App-level Prisma (in `apps/api/prisma/`)
- **Pros**: App isolation, independent databases, clearer paths
- **Cons**: Duplication if multiple apps need same schema
- **Best For**: Apps with different databases or independent services

## Understanding Migrations

### Why Run `pnpm prisma migrate dev --name init`?

**Purpose**: This command creates the **initial migration** that sets up your database schema for the first time.

#### What It Does:

1. **Creates Migration Files**:
   - Generates SQL migration files in `prisma/migrations/` directory
   - Creates a timestamped folder (e.g., `20240101120000_init/`)
   - Contains `migration.sql` with all the DDL statements (CREATE TABLE, etc.)

2. **Applies Migration to Database**:
   - Executes the SQL against your database
   - Creates all tables, indexes, constraints defined in your schema
   - Updates the `_prisma_migrations` table to track applied migrations

3. **Generates Prisma Client**:
   - Automatically runs `prisma generate` after migration
   - Updates TypeScript types based on your schema
   - Makes the client ready to use in your code

#### When to Use:

- ✅ **First time setup**: After creating your schema and before using the database
- ✅ **New project**: When initializing Prisma in a new application
- ✅ **Fresh database**: When setting up a new database from scratch

#### Example Workflow:

```bash
# 1. Create/update your schema.prisma file
# 2. Run the initial migration
pnpm prisma migrate dev --name init

# This will:
# - Create prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql
# - Apply the migration to your database
# - Generate Prisma Client
# - Update your database schema
```

#### Important Notes:

- **`--name init`**: The name is just a label for the migration. Use descriptive names like `init`, `add_user_table`, `add_email_index`, etc.
- **Development Only**: `migrate dev` is for development. Use `migrate deploy` in production.
- **Idempotent**: Safe to run multiple times - Prisma tracks which migrations are applied.
- **Schema Sync**: The migration reflects the current state of your `schema.prisma` file.

## Common Commands

### Prisma Migration Commands

#### `pnpm prisma migrate dev --name <migration_name>`
**Purpose**: Create and apply a new migration in development.

**What it does**:
- Compares your current `schema.prisma` with the database state
- Creates a new migration file with the differences
- Applies the migration to your database
- Regenerates Prisma Client automatically

**When to use**:
- After modifying your schema (adding/removing models, fields, indexes)
- During active development
- When you want to test schema changes

**Example**:
```bash
# Add a new field to your User model, then:
pnpm prisma migrate dev --name add_user_email_field

# This creates: prisma/migrations/20240101120000_add_user_email_field/migration.sql
```

**Flags**:
- `--name`: Required. Descriptive name for the migration
- `--create-only`: Create migration file without applying it
- `--skip-generate`: Skip Prisma Client generation after migration

---

#### `pnpm prisma migrate deploy`
**Purpose**: Apply pending migrations in production/staging environments.

**What it does**:
- Applies all migrations that haven't been run yet
- Does NOT modify your schema file
- Safe for production use (no prompts, no schema changes)

**When to use**:
- ✅ Production deployments
- ✅ CI/CD pipelines
- ✅ Staging environment updates
- ❌ NOT for development (use `migrate dev` instead)

**Example**:
```bash
# In production/staging:
pnpm prisma migrate deploy
```

**Important**: This command only applies existing migrations. It does not create new ones.

---

#### `pnpm prisma migrate status`
**Purpose**: Check the migration status of your database.

**What it does**:
- Shows which migrations have been applied
- Shows which migrations are pending
- Displays migration history

**When to use**:
- Before deploying to check migration state
- Debugging migration issues
- Verifying database is up to date

**Example**:
```bash
pnpm prisma migrate status

# Output:
# Database schema is up to date!
# Or:
# The following migrations have not yet been applied:
#   20240101120000_add_user_table
```

---

#### `pnpm prisma migrate reset`
**Purpose**: Reset your development database and apply all migrations from scratch.

**What it does**:
- ⚠️ **DROPS ALL DATA** in your database
- Recreates the database
- Applies all migrations in order
- Runs seed script if configured

**When to use**:
- ✅ Development only (NEVER in production)
- ✅ When you want a fresh start
- ✅ After major schema changes
- ✅ Testing migration scripts

**Example**:
```bash
# WARNING: This deletes all data!
pnpm prisma migrate reset

# With seed:
pnpm prisma migrate reset --seed
```

**Flags**:
- `--force`: Skip confirmation prompt (use in scripts)
- `--skip-seed`: Skip running seed script

---

#### `pnpm prisma migrate resolve`
**Purpose**: Mark a migration as applied or rolled back (manual intervention).

**What it does**:
- Manually marks a migration as applied without running it
- Useful when you've manually fixed a migration issue

**When to use**:
- After manually fixing a failed migration
- When migration state is out of sync
- Recovery from migration errors

**Example**:
```bash
# Mark migration as applied:
pnpm prisma migrate resolve --applied 20240101120000_init

# Mark migration as rolled back:
pnpm prisma migrate resolve --rolled-back 20240101120000_init
```

---

### Prisma Client Commands

#### `pnpm prisma generate`
**Purpose**: Generate Prisma Client based on your current schema.

**What it does**:
- Reads your `schema.prisma` file
- Generates TypeScript types and client code
- Outputs to the location specified in `generator.output`

**When to use**:
- After modifying schema without running migrations
- After pulling schema changes from version control
- When Prisma Client is missing or outdated
- In CI/CD pipelines before building

**Example**:
```bash
pnpm prisma generate

# Client generated to: generated/prisma/
```

**Note**: `migrate dev` automatically runs this, but you may need to run it manually in some cases.

---

### Prisma Studio (Database GUI)

#### `pnpm prisma studio`
**Purpose**: Open a visual database browser and editor.

**What it does**:
- Launches a web-based GUI (usually at http://localhost:5555)
- Browse and edit data in your database
- View relationships between tables
- Useful for development and debugging

**When to use**:
- ✅ Viewing database contents during development
- ✅ Manual data entry for testing
- ✅ Debugging data issues
- ✅ Exploring relationships

**Example**:
```bash
pnpm prisma studio

# Opens browser at http://localhost:5555
```

**Flags**:
- `--port <port>`: Specify custom port (default: 5555)
- `--browser none`: Don't open browser automatically
- `--schema <path>`: Use custom schema path

---

### Schema Management Commands

#### `pnpm prisma format`
**Purpose**: Format your `schema.prisma` file.

**What it does**:
- Formats the schema file according to Prisma's style guide
- Ensures consistent formatting
- Validates basic syntax

**When to use**:
- Before committing schema changes
- After manual edits
- To ensure consistent code style

**Example**:
```bash
pnpm prisma format

# Formats: prisma/schema.prisma
```

---

#### `pnpm prisma validate`
**Purpose**: Validate your Prisma schema without generating client.

**What it does**:
- Checks schema syntax and semantics
- Validates relationships and references
- Ensures schema is correct

**When to use**:
- In CI/CD pipelines to validate schema
- Before running migrations
- Debugging schema issues

**Example**:
```bash
pnpm prisma validate

# Output: The schema at prisma/schema.prisma is valid ✓
```

---

#### `pnpm prisma db pull`
**Purpose**: Introspect your database and update schema.prisma to match.

**What it does**:
- Connects to your database
- Reads the current database structure
- Updates `schema.prisma` to reflect the database

**When to use**:
- ✅ When starting with an existing database
- ✅ After manual database changes
- ✅ Syncing schema with database

**Example**:
```bash
pnpm prisma db pull

# Updates schema.prisma to match your database
```

**Warning**: This overwrites your schema file. Make sure to commit changes first!

---

#### `pnpm prisma db push`
**Purpose**: Push schema changes to database without creating migrations.

**What it does**:
- Applies schema changes directly to database
- Does NOT create migration files
- Useful for prototyping

**When to use**:
- ✅ Rapid prototyping
- ✅ Development only
- ❌ NOT for production (use migrations instead)

**Example**:
```bash
pnpm prisma db push

# Applies schema changes without migration files
```

**Warning**: Use `migrate dev` for production workflows. `db push` doesn't create migration history.

---

#### `pnpm prisma db seed`
**Purpose**: Run seed script to populate database with initial data.

**What it does**:
- Executes seed script defined in `package.json`
- Populates database with test/initial data

**When to use**:
- After `migrate reset`
- Setting up development environment
- Testing with sample data

**Setup in package.json**:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Example**:
```bash
pnpm prisma db seed
```

---

### Utility Commands

#### `pnpm prisma init`
**Purpose**: Initialize Prisma in a new project.

**What it does**:
- Creates `prisma/schema.prisma` file
- Creates `.env` file with `DATABASE_URL`
- Sets up basic Prisma configuration

**When to use**:
- Setting up Prisma for the first time
- Adding Prisma to a new project

**Example**:
```bash
# From apps/api directory:
cd apps/api
pnpm prisma init
```

**Note**: See [Prisma Initialization Location](#prisma-initialization-location) for monorepo-specific guidance.

---

#### `pnpm prisma version`
**Purpose**: Display Prisma version information.

**What it does**:
- Shows installed Prisma CLI version
- Shows Prisma Client version
- Useful for debugging version issues

**Example**:
```bash
pnpm prisma version
```

---

### Command Summary Table

| Command | Purpose | Use Case | Production Safe? |
|---------|---------|----------|------------------|
| `migrate dev` | Create & apply migration | Development | ❌ No |
| `migrate deploy` | Apply pending migrations | Production | ✅ Yes |
| `migrate status` | Check migration state | All environments | ✅ Yes |
| `migrate reset` | Reset database | Development only | ❌ No |
| `generate` | Generate Prisma Client | All environments | ✅ Yes |
| `studio` | Database GUI | Development | ❌ No |
| `format` | Format schema file | Development | ✅ Yes |
| `validate` | Validate schema | All environments | ✅ Yes |
| `db pull` | Introspect database | Development | ⚠️ Careful |
| `db push` | Push schema changes | Prototyping only | ❌ No |
| `db seed` | Run seed script | Development | ❌ No |

### Prisma Commands (from apps/api - if using app-level setup)

If you're using app-level Prisma setup, run all commands from `apps/api/`:

```bash
cd apps/api

# All commands work the same way:
pnpm prisma migrate dev --name migration_name
pnpm prisma generate
pnpm prisma studio
# etc.
```

### Environment Setup

```bash
# Create .env file (if it doesn't exist)
cp .env.example .env

# Edit .env file with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

## Best Practices

### 1. Schema Management
- ✅ Keep schema file well-documented with comments
- ✅ Use meaningful model and field names
- ✅ Add indexes for frequently queried fields
- ✅ Use enums for fixed value sets
- ✅ Add `@@map` and `@map` for database naming conventions

### 2. Migrations
- ✅ Always create migrations for schema changes
- ✅ Review migration SQL before applying
- ✅ Test migrations on development database first
- ✅ Never edit existing migrations (create new ones)
- ✅ Keep migration history clean and meaningful

### 3. Environment Management
- ✅ Never commit `.env` files to version control
- ✅ Use `.env.example` as a template
- ✅ Use different databases for dev/staging/production
- ✅ Use connection pooling in production

### 4. Code Organization
- ✅ Create a database service/utility module
- ✅ Use transactions for multi-step operations
- ✅ Handle connection errors gracefully
- ✅ Close Prisma Client connections properly
- ✅ Use Prisma's type safety features

### 5. Performance
- ✅ Use `select` to fetch only needed fields
- ✅ Add database indexes for query optimization
- ✅ Use `include` and `select` wisely (avoid N+1 queries)
- ✅ Consider using Prisma Accelerate for edge/serverless
- ✅ Monitor query performance

## Troubleshooting

### Common Issues

#### Issue: Cannot find module '../generated/prisma'
**Solution**:
- Run `pnpm prisma generate` from the root
- Check that the output path in schema matches your import path
- Verify the generated client exists in `generated/prisma/`

#### Issue: Migration path not found
**Solution**:
- Ensure `prisma.config.ts` has correct migrations path
- Run migrations from the root directory
- Check that `prisma/migrations` directory exists

#### Issue: DATABASE_URL not found
**Solution**:
- Create `.env` file in root (or in `apps/api/` if using app-level setup)
- Ensure `.env` file is loaded (check `dotenv/config` import)
- Verify the environment variable name matches exactly

#### Issue: Path resolution errors in Nx build
**Solution**:
- Ensure Prisma commands are run from the correct directory
- Check that generator output path is relative to schema location
- Verify import paths in your code match the generated client location
- Consider using app-level Prisma setup for better isolation

### Migration Issues

#### Issue: Migration conflicts
**Solution**:
- Review migration history: `pnpm prisma migrate status`
- Resolve conflicts manually if needed
- Consider resetting dev database: `pnpm prisma migrate reset`

#### Issue: Migration fails to apply
**Solution**:
- Check database connection
- Review migration SQL for errors
- Ensure database user has necessary permissions
- Check for existing data conflicts

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Nx](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-nx)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Nx Documentation](https://nx.dev)

---

**Last Updated**: 2024
**Maintained By**: Development Team
