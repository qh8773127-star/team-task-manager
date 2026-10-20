# Team Task Manager

A full-stack web application that allows users to create teams, assign tasks, and manage their workflow securely.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Neon / Google Cloud SQL)
- **Authentication:** Passport.js, Express-Session, Bcrypt, Zod (Validation)

## Features

- **Secure Authentication:** Custom Register/Login using Passport.js with HTTP-only cookies.
- **Database Sessions:** User sessions are stored securely in PostgreSQL using `connect-pg-simple` (survives server restarts).
- **Input Validation:** Request bodies are strictly validated using Zod.
- **Password Security:** Passwords are hashed using Bcrypt.
- **Protected Routes:** Custom Auth Middleware to protect all non-auth routes.

## Security Notes

Never commit .env files or database credentials to GitHub.

Use a strong, randomly generated session secret.

Ensure HTTP-only cookies and session security settings are configured appropriately for your deployment.

## Setup Instructions

Prerequisites

Make sure you have the following installed:

Node.js

npm (included with Node.js)

PostgreSQL database (Neon or Google Cloud SQL)

1. Clone the Repository

git clone <https://github.com/qh8773127-star/team-task-manager>
cd <task-manager-assessment>

2. Backend Setup

cd backend
npm install

Create a .env file inside the backend directory and configure the following environment variables:

PORT=5000
DATABASE_URL="your_postgresql_connection_string"
SESSION_SECRET="your_secure_random_secret"
NODE_ENV=development

Replace the placeholder values with your own configuration. Keep your .env file private and never commit secrets to version control.

Start the backend server:

npm run dev

# Environment Variables

PORT (Backend server port)

DATABASE_URL (PostgreSQL connection string)

SESSION_SECRET (Secret used to sign session cookies)
