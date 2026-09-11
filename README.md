# Northlight CRM

A full-stack Customer Relationship Management (CRM) system for managing client inquiries, leads, follow-ups, notes, and sales pipeline activities.

Northlight CRM provides a public client inquiry form and a secure administrator dashboard for managing submitted leads.

---

## 🚀 Live Demo

Frontend:
https://futurefs02-kappa.vercel.app/

> Backend API is deployed separately from the frontend.

---
## 🔐 Admin Demo Credentials

Use the following credentials to access the Northlight CRM admin dashboard:

**Email:** `demo@northlightcrm.com`  
**Password:** `Northlight@123`

## 📌 Project Overview

Northlight CRM is designed to help businesses manage potential customers from the initial inquiry to conversion.

The system provides:

- Public client inquiry form
- Lead management
- Lead pipeline tracking
- Lead status management
- Priority management
- Follow-up scheduling
- Notes and activity tracking
- Dashboard statistics
- Performance and conversion analytics
- Email alert/activity log
- Secure administrator login
- JWT-based authentication
- MongoDB database
- REST API using Node.js and Express.js

---

## ✨ Main Features

### 1. Public Client Site

Clients can submit their project requirements without logging into the system.

Information collected:

- Full name
- Email
- Phone
- Company
- Project / inquiry
- Budget
- Preferred contact method
- Message

Submitted inquiries are stored in MongoDB and become leads in the administrator dashboard.

---

### 2. Admin Login

Administrators can securely log into the CRM.

Authentication uses:

- JWT
- bcrypt password hashing
- Protected API routes
- Session-based token storage

---

### 3. Lead Management

Administrators can:

- Create leads
- View leads
- Edit leads
- Delete leads
- Search leads
- Filter leads
- Change lead status
- Set lead priority
- View lead details

Lead statuses:

- New
- Contacted
- Converted

Priority levels:

- Low
- Medium
- High

---

### 4. Follow-Up Management

Administrators can:

- Schedule follow-up dates
- Update follow-ups
- Track follow-up status
- View upcoming follow-ups

---

### 5. Notes

Administrators can add notes to individual leads.

They can also delete existing notes.

---

### 6. Dashboard

The dashboard displays:

- Total inquiries
- New leads
- Contacted leads
- Converted leads
- Upcoming follow-ups
- Pipeline information

---

### 7. Analytics

The analytics section provides:

- Pipeline conversion funnel
- Intake velocity
- Stage distribution
- Total leads
- Open leads
- Contacted rate
- Conversion rate
- Converted clients

---

### 8. Email Alerts Log

The CRM provides an activity log for:

- New inquiries
- Lead contact activity
- Follow-up reminders

The current version logs these activities inside the application.

---

## 🛠️ Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Lucide React
- Recharts

### Backend

- Node.js
- Express.js
- REST API

### Database

- MongoDB
- Mongoose

### Authentication

- JWT (JSON Web Token)
- bcryptjs
- Session Storage

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Vercel

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │    Public Client    │
                    │       Website       │
                    └──────────┬──────────┘
                               │
                               │ Submit Inquiry
                               ▼
                    ┌─────────────────────┐
                    │   Express REST API  │
                    │      Node.js        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │    Lead Database    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Admin Dashboard   │
                    │      React.js       │
                    └─────────────────────┘
