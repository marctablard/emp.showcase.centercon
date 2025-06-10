# Deployment Process Documentation

This document describes the deployment process for the Emporix Showcase application, which uses Vercel for hosting and GitHub Actions for continuous integration and deployment.

## Table of Contents

- [Overview](#overview)
- [Vercel Configuration](#vercel-configuration)
- [GitHub Actions Workflows](#github-actions-workflows)
  - [PR Preview Workflow](#1-pr-preview-workflow-github-actions-deploy-pr-previewyml)
  - [Development Deployment](#2-development-deployment-github-actions-deploy-devyml)
  - [Staging Deployment](#3-staging-deployment-github-actions-deploy-stageyml)
  - [Production Deployment](#4-production-deployment-github-actions-deploy-prodyml)
- [Deployment Process Flow](#deployment-process-flow)
- [Environment Variables](#environment-variables)
- [Caching Strategy](#caching-strategy)
- [Testing](#testing)
- [Vercel CLI](#vercel-cli)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Overview

The Emporix Showcase application follows a multi-environment deployment strategy with four distinct environments:

1. **Preview Environment**: Temporary deployments for pull request reviews (URLs automatically assigned by Vercel)
2. **Development Environment**: Continuous deployment from the `develop` branch (URL automatically assigned by Vercel)
3. **Staging Environment**: Deployment from `release/**` branches (URL: stage.emporix-showcase.vercel.app)
4. **Production Environment**: Deployment triggered by version tags on the `master` branch (URL: emporix-showcase.vercel.app)

## Vercel Configuration

The application uses Vercel for hosting with different deployment environments:

- **Project Name**: `emporix-showcase`
- **Environments**:
  - **Production**: Main production environment (emporix-showcase.vercel.app)
  - **Staging**: Staging environment for pre-release testing (stage.emporix-showcase.vercel.app)
  - **Preview**: Automatically generated environments for development and pull requests

Vercel automatically assigns URLs for development and PR preview deployments.

## GitHub Actions Workflows

### 1. PR Preview Workflow (`github-actions-deploy-pr-preview.yml`)

**Purpose**: Creates preview deployments for pull requests.

**Trigger**:

- Pull requests against the `develop` branch
- Triggered on PR open or synchronize events

**Key Features**:

- Installs dependencies
- Runs lint checks
- Runs Jest tests
- Deploys to Vercel preview environment
- Preview URL is automatically assigned by Vercel

### 2. Development Deployment (`github-actions-deploy-dev.yml`)

**Purpose**: Deploys to the development environment.

**Trigger**:

- Push to the `develop` branch

**Key Features**:

- Installs dependencies
- Runs lint checks
- Runs Jest tests
- Deploys to Vercel preview environment
- URL is automatically assigned by Vercel

### 3. Staging Deployment (`github-actions-deploy-stage.yml`)

**Purpose**: Deploys to the staging environment.

**Trigger**:

- Push to `release/**` branches

**Key Features**:

- Installs dependencies
- Runs lint checks
- Runs Jest tests
- Deploys to Vercel staging environment
- URL: stage.emporix-showcase.vercel.app

### 4. Production Deployment (`github-actions-deploy-prod.yml`)

**Purpose**: Deploys to the production environment.

**Trigger**:

- Push of tags starting with `v` (e.g., v1.0.0)

**Key Features**:

- Installs dependencies
- Runs lint checks
- Runs Jest tests
- Deploys to Vercel production environment
- URL: emporix-showcase.vercel.app

## Deployment Process Flow

1. **Development Workflow**:

   - Developers work on feature branches
   - Create pull requests to `develop` branch
   - PR checks run automatically, creating preview deployments with Vercel
   - After PR approval and merge, the code is automatically deployed to the development environment

2. **Release Process**:

   - Create a `release/x.y.z` branch from `develop` when ready to release
   - This automatically triggers deployment to the staging environment (stage.emporix-showcase.vercel.app)
   - Test the application in the staging environment

3. **Production Release**:
   - After successful testing in staging, merge the release branch to `master`
   - Create and push a version tag (e.g., `v1.0.0`) on the `master` branch
   - This automatically triggers deployment to the production environment (emporix-showcase.vercel.app)

## Environment Variables

All workflows use environment variables that are managed through Vercel and GitHub:

- **Vercel Environment Variables**: Stored in the Vercel project settings for each environment (production, staging, preview)
- **GitHub Secrets**: Used in the GitHub Actions workflows
  - VERCEL_TOKEN: Authentication token for Vercel CLI
  - VERCEL_ORG_ID: Organization ID for Vercel
  - VERCEL_PROJECT_ID: Project ID for the Vercel project

During deployment, the Vercel CLI pulls the appropriate environment variables for each target environment:

```bash
vercel env pull .env --environment=[preview|stage|production] --token=${{ secrets.VERCEL_TOKEN }}
```

This ensures that the correct environment-specific variables are used for each deployment.

## Caching Strategy

All workflows implement caching for npm dependencies using GitHub Actions' built-in caching mechanism:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'npm'
    cache-dependency-path: package-lock.json
```

Additionally, Vercel provides its own build caching mechanisms to optimize deployment speed.

## Testing

All deployments include:

- Linting checks
- Jest unit tests

Playwright E2E tests are currently commented out in the workflows but can be enabled when needed.

## Vercel CLI

All workflows use the Vercel CLI to interact with Vercel's deployment platform. The CLI is installed in each workflow:

```yaml
- name: Install Vercel CLI
  run: npm i -g vercel
```

## Troubleshooting

If a deployment fails, check:

1. GitHub Actions logs for build or test failures
2. Vercel deployment logs in the Vercel dashboard
3. Environment variables configuration in Vercel
4. Vercel CLI version and authentication

## Future Improvements

Potential improvements to the deployment process:

1. Re-enable and enhance E2E testing with Playwright
2. Add automated smoke tests after deployment
3. Implement performance monitoring and alerting
4. Configure automatic rollback on failed deployments
5. Implement environment-specific approval workflows for production deployments
6. Set up domain aliases for easier access to environments
