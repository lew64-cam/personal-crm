# Setup Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be set up (usually 1-2 minutes)

3. **Get your Supabase credentials**:
   - Go to Project Settings > API
   - Copy your Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy your anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Go to Project Settings > Database
   - Copy the Connection string (URI format) → `DATABASE_URL`

4. **Create `.env` file**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

5. **Set up the database schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## First Time Use

1. Click "Sign up" on the login page
2. Enter your email and password
3. Check your email for the confirmation link (if email confirmation is enabled)
4. Click the confirmation link
5. Sign in to your account
6. Start adding contacts!

## Features Overview

### Dashboard
- View upcoming birthdays
- See contacts that need reaching out to
- Check overdue contacts
- Quick stats overview
- Quick-add new contacts

### Contacts List
- Search contacts by name, email, company, or tags
- Filter by relationship type, tags, or company
- View all contacts in a grid layout

### Contact Details
- View complete contact information
- Add timestamped notes/entries
- Mark contacts as "contacted" to update last contacted date
- Edit all contact details
- View interaction history

### Settings
- Enable browser notifications
- Configure daily digest time

## Troubleshooting

### Database Connection Issues
- Make sure your `DATABASE_URL` is in the correct format
- Verify your Supabase project is active
- Check that you've run `npx prisma db push`

### Authentication Issues
- Verify your Supabase URL and anon key are correct
- Check Supabase project settings for auth configuration
- Make sure email confirmation is set up correctly in Supabase dashboard

### Notification Issues
- Ensure you've granted browser notification permissions
- Check browser settings if notifications aren't appearing
- Make sure you're using a browser that supports notifications (Chrome, Firefox, Edge)

## Next Steps

- Add your contacts
- Set reminder intervals for important contacts
- Configure birthday reminders
- Enable notifications
- Customize your relationship management workflow

