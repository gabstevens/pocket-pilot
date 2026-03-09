# Requirements

Pocket Pilot is a pure front-end PWA designed to help users track their incomes and expenses with ease, privacy, and speed.

## Core Features (MVP)
- **Primary Navigation (3-Tab Bottom Bar):**
    1. **Add (Landing Page):** The main interface for entering new transactions.
        - **Default State:** Type set to "Expense" for faster entry.
        - **Fields:**
            - Amount (Required)
            - Type (Toggle between Income/Expense)
            - Category (Select from predefined list or add a new one on the fly)
            - Date (Defaults to today)
            - Optional Note
    2. **Dashboard:** At-a-glance summary cards showing Total Balance, Total Income, and Total Expenses.
        - **Default View:** Current calendar month.
        - **Date Filtering:** Ability to select/toggle date ranges (e.g., month, year, or custom range).
        - **Visuals:** Text-based for MVP (no charts initially).
    3. **History:** A scrollable, flat chronological list of all entries.
        - **Default View:** Current calendar month.
        - **Filtering:** 
            - Date range selector (Defaults to current month).
            - Category filter.
- **Data Management:**
    - **Editing:** Performed via a full-screen modal on the History page, reusing the "Quick Add" form logic.
    - **Deletion:** Ability to remove entries directly from the list or within the edit modal.
    - **Category Management:**
        - Ability to add, edit, and delete categories via Settings.
        - Categories can have custom colors and icons.
        - Protected deletion: Categories in use cannot be deleted.
    - **Data Portability:**
        - **Export to CSV:** Download all transaction data as a CSV file.
        - **Import from CSV:** Upload/Restore transactions from a previously exported CSV.
- **Offline Capabilities:** Fully functional without an internet connection (read/write to local storage).
- **Data Privacy:** 100% client-side persistence. No demo data (clean slate on first load). No data should be sent to a server.
