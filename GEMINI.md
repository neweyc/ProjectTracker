# ProjectTracker Architecture & Conventions

## Vertical Slice Architecture (VSA)
The project follows a Vertical Slice Architecture. Each feature is encapsulated within its own folder under the `Features/` directory in the API.

## Design Patterns & Standards

### 1. Service Layer Abstraction
- **Mandate:** DO NOT use `ProjectTrackerDbContext` directly in feature handlers (command/query handlers).
- **Pattern:** Always create a service (e.g., `IProjectService`, `ITaskService`) to handle data access and business logic.
- **Goal:** This ensures the application remains composable, promotes code reuse across different features, and simplifies unit testing by allowing services to be mocked.

### 2. Feature Structure
- Each feature folder should typically contain:
    - The feature implementation (e.g., `CreateProjectFeature.cs`).
    - Request/Response models (often as records within the feature file or a separate `Models.cs`).
- Features must implement the `IEndpoint` interface to be automatically registered during startup.

### 3. API Routing
- Endpoints are mapped using Minimal APIs within the `MapEndpoint` method of each feature class.
- Use `WithName` and `WithTags` for better OpenAPI documentation and client generation.

### 4. Dependency Injection
- Register new services in `Init.cs`.
- Prefer `Scoped` lifetime for services interacting with the database.

## UI Conventions
- **State Management:** Use TanStack React Query for all server-state interactions.
- **Styling:** Follow the existing Tailwind CSS and Radix UI patterns.
- **API Client:** Use the `apiClient` defined in `src/api/client.ts`.
