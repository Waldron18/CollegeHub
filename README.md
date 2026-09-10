# CollegeHub

An institutional enterprise academic portal engineered for colleges and universities, modeled after VIERP and modern campus communication systems.

## Key Features

- **Role-Tailored Dashboards**: Specialized portals for Students, Faculty, and Institutional Administrators.
- **VIERP Academic & Profile Management**: Full 15-rail academic profile dossier matching official institutional systems, including personal details, identity, academic records, fee ledgers, and document archives.
- **Permanent Semester Timetable & VoIP Live Schedule**: Static Monday–Friday master timetable matrix decoupled from dynamic live daily lectures and extra lecture workflows.
- **Extra Lecture Workflow**: Faculty can request extra curriculum sessions with administrative review, approval, and live VoIP scheduling integration.
- **Official Digital Smart ID Card**: Cryptographically verifiable institutional virtual ID card replica with QR and barcode integration.
- **Header Profile Utility**: User avatar card, change password modal with real-time password strength analyzer, and secure sign-out confirmation.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Database / ORM**: PostgreSQL, Prisma ORM
- **Authentication**: Institutional session-based auth with bcrypt credential verification

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-jwt-secret"
```

3. Run Prisma migrations and seed the database:
```bash
npx prisma db push
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access CollegeHub.
