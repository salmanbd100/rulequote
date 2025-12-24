# Rulequote

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

An Nx monorepo workspace powered by React, Vite, and TypeScript.

## 📋 Monorepo Overview

This is an **Nx workspace** monorepo with the following configuration:

- **Nx Version**: 22.3.3
- **Package Manager**: pnpm
- **Build Tool**: Vite 7.0
- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Testing**: Vitest 4.0
- **Linting**: ESLint 9.8

### Current Projects

- **`web`** - React application (located in `/web` directory)

## 🚀 Quick Start

### Prerequisites

- Node.js (v20 or higher recommended)
- pnpm installed globally: `npm install -g pnpm`

### Installation

```bash
# Install all dependencies
pnpm install
```

### Development

```bash
# Start the development server for the web app
npx nx dev web
# or
npx nx serve web
```

The app will be available at `http://localhost:4200`

## 📚 Available Commands

### For the `web` Project

#### Development

```bash
# Start dev server with hot reload
npx nx dev web
npx nx serve web

# Preview production build locally
npx nx preview web

# Serve static files
npx nx serve-static web
```

#### Building

```bash
# Build for production
npx nx build web

# Build dependencies
npx nx build-deps web

# Watch dependencies
npx nx watch-deps web
```

#### Testing

```bash
# Run tests
npx nx test web

# Run tests with UI
npx nx test web --ui
```

#### Code Quality

```bash
# Lint code
npx nx lint web

# Fix linting issues automatically
npx nx lint web --fix

# Type check without building
npx nx typecheck web
```

### Run Tasks Across All Projects

```bash
# Run lint on all projects
npx nx run-many -t lint

# Run build on all projects
npx nx run-many -t build

# Run only affected projects (requires git)
npx nx affected -t build

# Run tasks in parallel
npx nx run-many -t build --parallel=3
```

### Useful Nx Commands

```bash
# View project dependency graph
npx nx graph

# Show project details and available targets
npx nx show project web

# Clear Nx cache
npx nx reset

# List installed plugins
npx nx list
```

## 🎯 Available Targets

The `web` project has the following targets (automatically inferred by Nx plugins):

| Target         | Description                          |
| -------------- | ------------------------------------ |
| `lint`         | Run ESLint to check code quality     |
| `build`        | Build the application for production |
| `serve`        | Start development server             |
| `dev`          | Alias for serve (development mode)   |
| `preview`      | Preview production build locally     |
| `serve-static` | Serve static files                   |
| `typecheck`    | Run TypeScript type checking         |
| `test`         | Run tests with Vitest                |
| `build-deps`   | Build project dependencies           |
| `watch-deps`   | Watch project dependencies           |

## 🏗️ Project Structure

```
rulequote/
├── web/                 # React application
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   ├── project.json    # Project configuration
│   └── vite.config.mts # Vite configuration
├── nx.json             # Nx workspace configuration
├── package.json        # Root dependencies
├── pnpm-workspace.yaml # pnpm workspace config
└── tsconfig.base.json  # Shared TypeScript config
```

## ⚙️ Configuration Details

### Nx Configuration (`nx.json`)

- **Plugins**:
  - `@nx/eslint/plugin` - Auto-creates lint targets
  - `@nx/vite/plugin` - Auto-creates Vite targets (build, serve, test, etc.)
- **Named Inputs**: Defines cache invalidation rules for optimized builds
- **Generators**: Default options for React apps (CSS styling, ESLint, Vite bundler)

### Package Manager (`pnpm-workspace.yaml`)

- Uses pnpm workspaces for dependency management
- Auto-installs peer dependencies

### TypeScript (`tsconfig.base.json`)

- Shared TypeScript configuration for all projects
- Path aliases can be configured here for project imports

### Vite Configuration (`web/vite.config.mts`)

- Development server: `localhost:4200`
- Build output: `dist/web`
- Configured with React plugin and Nx TypeScript path support

## ➕ Adding New Projects

### Add a New React Application

```bash
npx nx g @nx/react:app my-app
```

### Add a New React Library

```bash
npx nx g @nx/react:lib my-lib
```

### Add a New Plugin

```bash
# Example: Add Node.js support
npx nx add @nx/node

# Example: Add Next.js support
npx nx add @nx/next
```

### List Available Generators

```bash
# List all installed plugins
npx nx list

# Get details about a specific plugin
npx nx list @nx/react
```

## ✨ Key Features

- **Task Inference**: Nx plugins automatically detect and create targets from configuration files
- **Smart Caching**: Nx caches task results for faster builds (connected to Nx Cloud)
- **Parallel Execution**: Run multiple tasks in parallel for better performance
- **Affected Detection**: Only run tasks for projects that have changed
- **TypeScript Path Mapping**: Ready for path aliases configuration

## 🔗 Remote Caching Setup

This workspace is connected to Nx Cloud for remote caching.

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/Lxru9eftmv)

## 🛠️ Development Tools

### Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 📖 Learn More

### Nx Resources

- [Learn more about this workspace setup](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Running tasks in Nx](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Inferred tasks](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Community

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
