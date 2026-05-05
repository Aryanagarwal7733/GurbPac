# Content Broadcasting System Frontend

A React.js / Next.js frontend application for an educational Content Broadcasting System.

## Features
- **Role-based Authentication**: Separate flows for Teachers and Principals.
- **Teacher Dashboard**: Upload content with scheduling, view upload history and approval statuses.
- **Principal Dashboard**: Review pending content, approve or reject with mandatory reasoning.
- **Public Live Broadcasting**: A public polling page that displays the currently active content based on schedule.
- **Mock API Service**: No backend required. API layer simulates network latency and uses `localStorage` for persistence.

### 🚀 Bonus Features Included
- **Dark Mode**: Fully integrated Light/Dark mode via `next-themes`.
- **React Query**: Optimized data fetching, state management, and polling using `@tanstack/react-query`.
- **Client-Side Pagination**: All data tables support pagination for better UX.
- **Drag-and-Drop Uploads**: Enhanced file upload experience using `react-dropzone`.
- **Skeleton Loaders**: Layout-aware loading states using shadcn `Skeleton` to prevent layout shift.

## Technologies Used
- Next.js 15 (App Router)
- React.js 19
- Tailwind CSS
- shadcn/ui & Radix UI Primitives
- Zustand (Auth State Management)
- TanStack React Query (Data Fetching & Polling)
- React Hook Form + Zod (Form Validation)
- React Dropzone (File Upload)
- Lucide React (Icons)
- Date-fns (Date formatting)

## Setup Instructions

### Prerequisites
- Node.js 18.x or later installed
- npm or yarn

### Installation
1. Clone the repository:
```bash
git clone <repository_url>
cd GrubPac
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

You can use the following mock credentials to test the application:

**Principal Login:**
- Email: `principal@school.com`
- Password: `password`

**Teacher Login:**
- Email: `teacher@school.com`
- Password: `password`

## Public Live Page
To view the public broadcasting page for a teacher, navigate to:
`http://localhost:3000/live/t1` (Where `t1` is the mock teacher's ID).

## Folder Structure Notes
See `Frontend-notes.txt` for details on the architectural decisions, state management, and routing approach.
