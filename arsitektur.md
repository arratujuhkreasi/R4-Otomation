# PROJECT: FlowAutomator (n8n Clone)
# ROLE: Senior Full Stack Architect & Algorithm Specialist

## 1. PROJECT OBJECTIVE
Build a scalable, self-hosted, node-based workflow automation tool similar to n8n. The system must allow users to drag-and-drop nodes, connect them, and execute complex workflows involving HTTP requests, Webhooks, and custom JavaScript code.

## 2. TECHNOLOGY STACK
- **Language:** TypeScript (Strict Mode)
- **Monorepo Strategy:** Turborepo or Nx
- **Frontend:**
  - Framework: React (Next.js App Router preferred for full-stack simplicity or Vite for SPA)
  - State Management: Zustand (for canvas state)
  - UI Library: Shadcn/UI + Tailwind CSS
  - Visual Graph Engine: **React Flow** (CRITICAL: Use this for the canvas)
- **Backend:**
  - Framework: NestJS (Modular architecture)
  - Database: PostgreSQL (via Prisma ORM or TypeORM)
  - Queue/Worker: BullMQ + Redis (For decoupling workflow execution)
  - Sandbox: `isolated-vm` (To safely execute user-defined JavaScript code nodes)

## 3. CORE ARCHITECTURE

### A. The "Node" Concept
Every node must follow a strict Interface:
```typescript
interface WorkflowNode {
  id: string;
  type: string; // e.g., 'httpRequest', 'webhook', 'cron', 'code'
  position: { x: number; y: number };
  data: {
    parameters: Record<string, any>; // User config (URLs, Headers, etc.)
    credentialsId?: string;
  };
}