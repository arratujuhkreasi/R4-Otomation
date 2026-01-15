# FlowAutomator

A scalable, self-hosted, node-based workflow automation tool built with Turborepo.

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js (App Router) + React Flow + Zustand + Shadcn/UI + Tailwind CSS
- **Backend**: NestJS + PostgreSQL + Prisma + BullMQ + Redis
- **Shared Types**: TypeScript shared type definitions

## Project Structure

```
├── apps/
│   ├── web/           # Next.js frontend
│   └── api/           # NestJS backend
├── packages/
│   └── shared-types/  # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Build

```bash
pnpm build
```

## License

MIT
