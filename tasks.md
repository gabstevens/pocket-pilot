# Tasks

## Phase 1: Scaffolding
- [x] Initialize Vite + React (TypeScript) project.
- [x] Configure `vite-plugin-pwa` and basic manifest.
- [x] Set up project folder structure:
    - `src/components`: Reusable UI elements.
    - `src/context`: State management.
    - `src/hooks`: Custom logic (e.g., localStorage sync).
    - `src/styles`: Global CSS and variables.
    - `src/types`: TypeScript interfaces.

## Phase 2: Core Logic & State
- [x] Define TypeScript interfaces for `Transaction`.
- [x] Implement `TransactionContext` with `useReducer` for CRUD operations.
- [x] Create a custom hook for `localStorage` persistence and hydration.
- [x] Implement CSV Export logic.
- [x] Implement CSV Import logic (with basic validation).
- [x] Unit test the transaction logic.

## Phase 3: UI Implementation
- [x] Implement global styles (Sharp/Minimalist theme).
- [x] Build the `BottomNavigation` (3 Tabs: Add, Dashboard, History).
- [x] Build the `AddTransaction` page (Landing).
- [x] Build the `Dashboard` page.
- [x] Build the `History` page with full-screen edit modal.
- [x] Build CSV Export/Import UI.

## Infrastructure & Quality
- [x] Configure Vitest with JSDOM for React/DOM testing.
- [x] Establish Senior Engineering Guidelines (`GEMINI.md`).
- [x] Fix core bugs (Toast IDs, TransactionForm validation).
- [x] Achieve 100% logic coverage in unit tests.
- [x] Implement core E2E tests with Playwright.
- [x] Configure base path and routing for GitHub Pages deployment.
- [x] Update PWA configuration for subfolder hosting.

## Phase 4: Polish & PWA
- [x] Fix iOS PWA safe area and keyboard layout issues.
- [ ] Add animations/transitions for a "native app" feel.
- [ ] Finalize manifest and offline configuration.
- [ ] Test on mobile devices (simulated and/or actual).
- [ ] Ensure accessible labeling (Aria labels, etc.).
