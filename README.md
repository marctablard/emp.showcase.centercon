# Emporix Showcase

A Next.js-based showcase application for the Emporix platform.

## Prerequisites

- Node.js (v20+)
- npm or yarn

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

To run the development server:

```bash
# Start the development server with hot-reload
npm run dev
```

This will:

- Start the Next.js development server with Turbopack
- Run the dependency injection generator in watch mode
- Open the application at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

The build process:

1. Generates dependency injection files
2. Builds the Next.js application

## Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run generate` - Generate dependency injection files
- `npm run generate:watch` - Generate dependency injection files in watch mode

## Documentation

Detailed documentation is available in the `/docs` directory:

### [Dependency Injection Framework](/docs/dependency-injection.md)

- Overview of the DI framework based on InversifyJS
- Explains separation of concerns, testability, and code reusability
- Details on environment-specific implementations
- Instructions for registering and using services

### [Internationalization (i18n)](/docs/i18n-implementation.md)

- Implementation using next-intl
- Configuration for locale-aware routing
- Type-safe translation system
- Support for both server and client components

### [Layered Architecture](/docs/layered-architecture.md)

- Explanation of the three-layer architecture (Integrations, Services, Repositories)
- Benefits including separation of concerns and maintainability
- Guidelines for implementing each layer
- Best practices for cross-layer communication

### [Testing](/docs/testing-strategy.md)

- Overview of testing setup and available scripts
- Instructions for running tests
- Details on test coverage and reporting

## Project Structure

```
emporix-showcase/
├── docs/               # Documentation files
├── i18n/               # Internationalization resources
├── resources/          # Static resources
├── scripts/            # Build and utility scripts
└── src/                # Source code
    ├── app/            # Next.js app directory
    ├── platform/       # Platform services and models
    └── ui/             # UI components
```

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [InversifyJS](https://inversify.io/) - Dependency injection
- [next-intl](https://next-intl-docs.vercel.app/) - Internationalization
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
