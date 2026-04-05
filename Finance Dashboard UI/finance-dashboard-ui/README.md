# Finance Dashboard UI

A clean, interactive, and responsive finance dashboard built with React, TypeScript, and Tailwind-inspired custom CSS.

## Features

- **Dashboard Overview**: Summary cards for Total Balance, Income, and Expenses.
- **Visualizations**: 
  - **Balance Trend**: Interactive line chart showing balance changes over time.
  - **Spending Breakdown**: Categorical breakdown of expenses using a pie chart.
- **Transaction Management**:
  - View a detailed list of all transactions.
  - Search by title or category.
  - Filter by transaction type (Income/Expense) and category.
  - Sort by date or amount.
- **Role-Based UI**:
  - **Viewer**: Read-only access to the dashboard and transactions.
  - **Admin**: Ability to add, edit, and delete transactions.
  - Switch roles easily via the topbar toggle.
- **Insights**: Automated insights such as highest spending category and monthly comparison.
- **UI/UX**:
  - **Responsive Design**: Works on mobile, tablet, and desktop.
  - **Dark Mode**: Toggle between light and dark themes.
  - **Animations**: Smooth transitions and entry animations using Framer Motion.
  - **State Management**: Robust state handling with Zustand.

## Tech Stack

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **State Management**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Styling**: Custom CSS (Utility-first approach)

## Setup Instructions

1.  **Navigate to the project directory**:
    ```bash
    cd finance-dashboard-ui
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in browser**:
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

## Project Structure

- `src/store/`: Zustand store for state management.
- `src/data/`: Mock transaction data.
- `src/types.ts`: TypeScript interfaces and types.
- `src/App.tsx`: Main dashboard component and logic.
- `src/App.css`: Custom styles for the dashboard.
- `src/index.css`: Global styles and dark mode variables.
