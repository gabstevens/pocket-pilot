# Design & Tech Stack

## Tech Stack
- **Framework:** React 19 + TypeScript (via Vite).
- **Styling:** Modern Vanilla CSS (using CSS Variables for theming, Flexbox, and Grid for layout).
- **State Management:** React `useContext` and `useReducer` for global transaction flow.
- **Persistence:** `localStorage` for 100% local data storage.
- **Icons:** `lucide-react` for a consistent, lightweight iconography.
- **PWA Integration:** `vite-plugin-pwa` for service worker management and manifest generation.

## UI/UX Strategy
- **Mobile-First Design:** Optimized for one-handed operation via a 3-tab bottom navigation bar.
- **Navigation:**
    - **Tab 1: Add (Landing)** - The primary transaction entry form.
    - **Tab 2: Dashboard** - Financial overview and summaries.
    - **Tab 3: History** - Transaction list and data management.
- **Visual Feedback:**
    - **Success Green:** Used for Income and positive balances.
    - **Destructive Red:** Used for Expenses and negative balances.
    - **Interactive States:** High-contrast focus and active states.
- **Aesthetics:**
    - **Sharp & Minimalist:** High contrast, minimal border-radius (0px), clean lines.
    - **Customizable Theme:** The user can select from 4 primary colors (Black, Blue, Green, Purple) via Settings.
    - **Theme Persistence:** The selected color is stored in `localStorage` and applied globally via CSS Variables.
- **Settings/Actions:** accessible via the Settings tab.
- **Modals:** Full-screen modal for editing transactions on the History page.
