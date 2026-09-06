# Northlight CRM

Northlight CRM is a professional mini CRM for managing client inquiries, pipeline stages, follow-ups, notes, and conversion performance.

It currently runs as a complete local/demo MVP using browser `localStorage`, so it works without a backend configuration.

## Features

### Authentication

- Protected CRM workspace
- Recruiter-friendly Try Demo access
- Sign in and sign out
- Fictional demo data with a visible DEMO MODE badge
- Use the visible `Try Demo` button for credential-free fictional demo access.

> Demo access is for demonstration only. The current MVP stores fictional records in browser `localStorage` and is not intended for production client data.

### Pipeline Leads

- View all leads
- Add leads
- Edit lead details
- Delete leads
- Search by name, email, company, or project
- Filter by status and priority
- Change status and priority
- View lead details
- Add and delete notes
- Add or change follow-up dates

Lead statuses:

- New
- Contacted
- Converted

Lead priorities:

- Low
- Medium
- High

Lead sources:

- Website
- LinkedIn
- Referral
- Other

### Dashboard

- Total inquiry count
- New, contacted, and converted counts
- Recent pipeline leads
- Upcoming follow-ups
- Empty states and validation
- Toast feedback after actions

### Performance & Funnel

- Dynamic KPI cards
- Last 7, 30, and 90 day range selector
- Pipeline conversion funnel
- Intake velocity line chart
- Stage distribution donut chart
- Conversion insights
- Follow-up overview
- Recent CRM activity
- Quick actions for common workflows

All displayed statistics are calculated from the current lead records.

### Email Alerts Log

The activity log records local CRM events such as:

- New inquiry received
- Lead contacted
- Follow-up reminder

Demo mode does not send real emails.

### Public Client Site

The public site includes an inquiry form with:

- Name
- Email
- Phone
- Company
- Project or inquiry
- Budget
- Preferred contact method
- Message

Submitted inquiries are saved as new demo leads and show a success confirmation.

## Technology

- React
- Vite
- Recharts
- Lucide React
- CSS
- Browser `localStorage` for demo persistence

## Project Structure

```text
src/
  components/
    AnalyticsEnhanced.jsx
    analytics.css
  services/
    demoService.js
  main.jsx
  styles.css
index.html
package.json
vite.config.js
README.md
```

## Requirements

- Node.js 18 or newer
- npm

## Installation

From the project directory:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Vercel Deployment

Import the repository into Vercel with these settings:

- Framework preset: Vite
- Root directory: project root
- Build command: `npm run build`
- Output directory: `dist`

No environment variables are required for the current demo MVP.

## Demo Data

The first load creates fictional leads covering all pipeline stages. Changes are stored in browser `localStorage` under the key:

```text
northlight-crm-demo-v2
```

To reset demo data, clear that local storage entry in the browser developer tools and reload the application.

## Supabase Production Path

Supabase is not configured in the current workspace. The application therefore runs in demo mode.

For a production implementation, add these frontend environment variables using the public Supabase client credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never expose a Supabase service-role key in frontend code.

A production backend should provide these tables and relationships:

- `profiles`
- `leads`
- `notes`
- `follow_ups`

Recommended access rules:

- Authenticated administrators can read and manage CRM data.
- Public visitors can insert new inquiries only.
- Public visitors cannot read, update, or delete existing leads.
- Row Level Security should be enabled for all production tables.

## Verification Checklist

The current MVP has been verified for:

- Demo login
- Protected CRM view
- Logout
- Lead creation
- Lead editing
- Lead deletion
- Search and filters
- Status and priority changes
- Lead details
- Notes
- Follow-up dates
- Dashboard totals
- Performance funnel
- Dynamic chart ranges
- Public inquiry submission
- Inquiry success confirmation
- Responsive layout
- Production build

## Notes

This project intentionally focuses on a working CRM MVP. It does not include real email delivery, payment systems, AI features, or enterprise permissions.
