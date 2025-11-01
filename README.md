# Personal CRM

A modern personal CRM application built with Next.js, Supabase, and Prisma to help you maintain personal and professional relationships.

## Features

### Contact Management
- Store comprehensive contact information (name, birthday, job title, company, location, email, phone)
- Custom fields: "How we met", relationship type (mentor/colleague/friend/family/professional), notes
- Tag system for categorization
- Social media links (LinkedIn, Twitter, personal website)
- Timestamped notes/entries for each contact

### Reminder System
- Birthday reminders (configurable: day of, 1 day before, 1 week before)
- Custom "reach out" intervals per contact (e.g., check in monthly, quarterly)
- "Last contacted" tracking with manual log functionality
- Dashboard showing:
  - Upcoming birthdays
  - People to reach out to
  - Overdue contacts

### Push Notifications
- Browser push notifications for birthdays and reach-out reminders
- Daily digest option at a specified time
- Notification preferences per contact

### UI/UX
- Clean, modern design with a dashboard homepage
- Contact list view with search and filters (by tag, location, relationship type, company)
- Individual contact detail pages
- Quick-add modal for rapid entry
- Mobile-responsive design
- Dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- A Supabase account and project

### Setup Instructions

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API to get your project URL and anon key
   - Go to Project Settings > Database > Connection string to get your database connection string

4. **Configure environment variables**:
   
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_supabase_database_connection_string
   ```

5. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

   This will create the database schema in your Supabase database.

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. Sign up for an account on the login page
2. Check your email for the confirmation link (if email confirmation is enabled in Supabase)
3. Sign in to your account
4. Start adding contacts!

### Adding Contacts

- Use the "Quick Add Contact" button on the dashboard for rapid entry
- Use the "Add Contact" button on the contacts page for full entry
- Edit contacts anytime by clicking on a contact and using the Edit button

### Setting Up Reminders

1. Edit a contact
2. Set a "Reach Out Interval" (e.g., 30 days for monthly check-ins)
3. Configure "Birthday Reminder" (days before birthday to remind)
4. Enable/disable notifications per contact

### Notifications

1. Enable browser notifications when prompted
2. Configure daily digest time in notification settings
3. You'll receive push notifications for:
   - Upcoming birthdays (based on your reminder settings)
   - Contacts that need reaching out to (based on their interval)

## Project Structure

```
personal-crm/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication routes
│   ├── contacts/          # Contact pages
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Dashboard.tsx
│   ├── ContactsList.tsx
│   ├── ContactDetail.tsx
│   ├── QuickAddModal.tsx
│   ├── ContactEditModal.tsx
│   ├── NotificationSettings.tsx
│   ├── Navbar.tsx
│   └── DarkModeToggle.tsx
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── supabase/         # Supabase clients
│   ├── auth.ts           # Auth helpers
│   ├── utils.ts          # General utilities
│   └── notifications.ts  # Notification utilities
├── hooks/                 # React hooks
│   └── useNotifications.ts
├── prisma/
│   └── schema.prisma     # Database schema
└── middleware.ts          # Next.js middleware for auth
```

## Database Schema

### Contact Model
- Basic information (name, email, phone, etc.)
- Professional details (job title, company, location)
- Relationship metadata (type, how we met, tags)
- Social links (LinkedIn, Twitter, website)
- Reminder settings (birthday reminder days, reach out interval)
- Timestamped entries for interaction history

### ContactEntry Model
- Timestamped notes/entries linked to contacts
- Automatic cascade delete when contact is deleted

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
