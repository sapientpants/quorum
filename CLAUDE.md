# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Setup & Development
- `mix setup` - Install dependencies, create database, and build assets
- `mix phx.server` - Start Phoenix server at http://localhost:4000
- `iex -S mix phx.server` - Start server with interactive Elixir shell

### Testing & Quality
- `mix test` - Run all tests
- `mix test path/to/test.exs` - Run specific test file
- `mix test path/to/test.exs:42` - Run test at specific line
- `mix format` - Format all Elixir files
- `mix format --check-formatted` - Check formatting without changing files

### Database
- `mix ecto.create` - Create database
- `mix ecto.migrate` - Run pending migrations
- `mix ecto.rollback` - Rollback last migration
- `mix ecto.reset` - Drop, create, and migrate database

### Assets & Deployment
- `mix assets.build` - Build assets for development
- `mix assets.deploy` - Build minified assets for production
- `MIX_ENV=prod mix release` - Build production release

## Architecture Overview

This is a Phoenix LiveView application following standard Phoenix conventions:

### Core Structure
- `lib/quorum/` - Business logic and data layer (contexts)
- `lib/quorum_web/` - Web layer (controllers, views, components)
- `lib/quorum_web/live/` - LiveView modules
- `lib/quorum_web/components/` - Reusable Phoenix Components
- `priv/repo/migrations/` - Database migrations
- `test/` - Test files mirroring lib/ structure

### Key Technologies
- **Phoenix 1.7.21** - Web framework with LiveView for real-time UI
- **Ecto** - Database wrapper and query generator for PostgreSQL
- **Tailwind CSS 3.4.3** - Utility-first CSS framework with JIT compilation
- **esbuild** - Fast JavaScript bundler
- **Heroicons** - SVG icon library integrated via Phoenix Components

### Development Patterns
- LiveView modules handle real-time user interactions server-side
- Phoenix Components provide reusable UI elements with HEEx templates
- Contexts in `lib/quorum/` encapsulate business logic
- Database queries use Ecto's composable query syntax
- Asset pipeline uses esbuild for JavaScript and Tailwind for CSS

### Configuration
- `config/config.exs` - Base configuration
- `config/dev.exs` - Development environment settings
- `config/test.exs` - Test environment settings
- `config/prod.exs` - Production environment settings
- `config/runtime.exs` - Runtime configuration (environment variables)

### Testing Strategy
- Unit tests for context functions
- LiveView tests using Phoenix.LiveViewTest
- Integration tests for full user workflows
- Use `describe` blocks to group related tests
- Prefer `conn_test` and `live_test` helpers