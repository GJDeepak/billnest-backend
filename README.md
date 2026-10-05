# BillNest Backend

A scalable billing and invoice management backend built with **Node.js, TypeScript, NestJS, PostgreSQL, and Drizzle ORM**.

## 🚀 Tech Stack

* **Node.js** – JavaScript runtime
* **TypeScript** – Type-safe development
* **NestJS** – Backend framework
* **PostgreSQL** – Relational database
* **Drizzle ORM** – Type-safe ORM for PostgreSQL
* **REST API** – API architecture
* **JWT** – Authentication and authorization
* **Git & GitHub** – Version control

## 📌 Features

* User authentication and authorization
* JWT-based authentication
* Customer management
* Billing management
* Invoice management
* PostgreSQL database integration
* Type-safe database queries using Drizzle ORM
* Database migrations using Drizzle Kit
* RESTful APIs
* Request validation
* Centralized error handling
* Environment-based configuration
* Modular NestJS architecture

## 📁 Project Structure

```text
billnest-backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── customers/
│   ├── invoices/
│   ├── database/
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── database.module.ts
│   ├── common/
│   ├── app.module.ts
│   └── main.ts
├── drizzle.config.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/GJDeepak/billnest-backend.git
cd billnest-backend
```

### 2. Install dependencies

```bash
npm install
```

## 🗄️ PostgreSQL Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE billing_db;
```

Make sure PostgreSQL is running before starting the application.

## 🔧 Drizzle ORM Setup

BillNest uses **Drizzle ORM** to communicate with PostgreSQL.

Drizzle provides:

* Type-safe SQL queries
* PostgreSQL schema definitions
* Database migrations
* Compile-time type safety
* Lightweight ORM functionality

### Install Drizzle

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit
```

### Configure environment variables

Create a `.env` file:

```env
PORT=3000

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/billing_db

JWT_SECRET=your_jwt_secret
```

For GitHub, keep only an example configuration:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/billing_db
```

**Never commit the real `.env` file.**

### Drizzle configuration

Create `drizzle.config.ts`:

```typescript
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schema/*.ts",
  out: "./src/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Database connection

Example Drizzle database connection:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
```

## 🏗️ Drizzle Schema Example

Example user schema:

```typescript
import {
  pgTable,
  serial,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  }).notNull().unique(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});
```

## 🔄 Database Migrations

Generate migrations from schema changes:

```bash
npx drizzle-kit generate
```

Apply migrations:

```bash
npx drizzle-kit migrate
```

For development, you can also use:

```bash
npx drizzle-kit push
```

Open Drizzle Studio:

```bash
npx drizzle-kit studio
```

## 🔍 Example Drizzle Query

Fetch all users:

```typescript
const result = await db.select().from(users);
```

Fetch a user by email:

```typescript
const result = await db
  .select()
  .from(users)
  .where(eq(users.email, email));
```

Insert a user:

```typescript
await db.insert(users).values({
  name: "John",
  email: "john@example.com",
});
```

Update a user:

```typescript
await db
  .update(users)
  .set({
    name: "John Updated",
  })
  .where(eq(users.id, userId));
```

Delete a user:

```typescript
await db
  .delete(users)
  .where(eq(users.id, userId));
```

## 🔐 Authentication

Authentication is implemented using **JWT**.

Typical flow:

```text
Client
  ↓
Login API
  ↓
Validate credentials
  ↓
Generate JWT
  ↓
Return access token
  ↓
Client sends token
  ↓
JWT Guard validates token
  ↓
Protected API
```

## 🛡️ API Security

The backend follows common API security practices:

* JWT authentication
* Password hashing
* Request validation
* Protected routes
* Environment variables for secrets
* Centralized exception handling
* PostgreSQL parameterized/type-safe queries

## ▶️ Running the Application

Development mode:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

The API will be available at:

```text
http://localhost:3000
```

## 🧪 Testing

Run tests:

```bash
npm run test
```

Run test coverage:

```bash
npm run test:cov
```

## 🔄 Git Workflow

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Add changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Add billing API"
```

Push:

```bash
git push origin feature/your-feature
```

## 👨‍💻 Author

**Jothi Deepak G**

Backend Developer

**Technologies:** Node.js · TypeScript · NestJS · PostgreSQL · Drizzle ORM

## 📄 License

This project is for development and learning purposes.
