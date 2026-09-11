Northlight CRM

A full-stack Customer Relationship Management (CRM) application for managing leads, customer enquiries, follow-ups, notes, priorities, and admin access.

🚀 Live Demo

Frontend: https://futurefs02-kappa.vercel.app/

Backend API: https://northlight-crm-api.onrender.com/

Backend Health Check: https://northlight-crm-api.onrender.com/api/health

🔐 Admin Demo Credentials

Email: demo@northlightcrm.com
Password: Northlight@123

⚠️ These credentials are for demonstration and project evaluation purposes only. Do not use real passwords or sensitive credentials in a public repository.

✨ Features

Secure admin login with JWT authentication

Password hashing with bcrypt

Lead creation and management

Customer enquiry management

Lead status and priority tracking

Follow-up date and task management

Notes for individual leads

Lead filtering and search

Dashboard analytics

Responsive user interface

Public enquiry form

MongoDB database integration

RESTful backend API

Protected admin API routes

🛠️ Tech Stack

Frontend

React

Vite

JavaScript

CSS

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT

bcryptjs

CORS

dotenv

Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

🏗️ Architecture

React + Vite Frontend
        |
        | REST API + JWT
        v
Node.js + Express Backend
        |
        v
MongoDB Atlas

📁 Project Structure

FUTURE_FS_02/
├── src/
├── server/
│   ├── models/
│   │   ├── Admin.js
│   │   └── Lead.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── public/
├── package.json
├── vite.config.js
├── .gitignore
└── README.md

⚙️ Local Setup

1. Clone the repository

git clone https://github.com/madhu200520/FUTURE_FS_02.git
cd FUTURE_FS_02

2. Install frontend dependencies

npm install

3. Install backend dependencies

cd server
npm install

4. Configure backend environment variables

Create server/.env:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

Never commit .env files or real credentials to GitHub.

5. Start the backend

cd server
npm start

Backend:

http://localhost:5000

6. Start the frontend

From the project root:

npm run dev

Frontend:

http://localhost:5173

🔗 API Endpoints

Public

GET  /api/health
POST /api/auth/setup
POST /api/auth/login
POST /api/leads

Protected

GET    /api/auth/me
GET    /api/leads
GET    /api/leads/:id
PUT    /api/leads/:id
DELETE /api/leads/:id
POST   /api/leads/:id/notes
POST   /api/leads/:id/followups
PUT    /api/leads/:id/followups/:followUpId
DELETE /api/leads/:id/followups/:followUpId

Protected endpoints require a valid JWT Bearer token.

🔒 Security

JWT-based authentication

bcrypt password hashing

Protected admin routes

Environment variables for secrets

CORS configuration

MongoDB connection through environment variables

Sensitive configuration excluded through .gitignore

🌐 Deployment

Frontend — Vercel

Production frontend:

https://futurefs02-kappa.vercel.app/

Production API configuration:

VITE_API_URL=https://northlight-crm-api.onrender.com/api

Backend — Render

Production backend:

https://northlight-crm-api.onrender.com/

Health check:

https://northlight-crm-api.onrender.com/api/health

The Render service uses the server directory as its root directory and connects to MongoDB Atlas through MONGO_URI.

Note: The Render free instance may sleep after inactivity, so the first request after inactivity can take longer.

🎓 Internship Project

This project was developed as part of the Future Interns Full-Stack Web Development Internship.

Task: FUTURE_FS_02
Project: Northlight CRM

👩‍💻 Developer

Madhura S

GitHub: https://github.com/madhu200520

📌 Important

This project is intended for educational, internship, and demonstration purposes.

Do not store real user passwords, API keys, database credentials, or other secrets in the public repository.
