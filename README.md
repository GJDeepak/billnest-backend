# BillNest Backend

A backend API for a billing and invoice management system, built with **NestJS, TypeScript, Node.js, and PostgreSQL**.

## 🚀 Tech Stack

* **Node.js** – JavaScript runtime
* **TypeScript** – Type-safe development
* **NestJS** – Backend framework
* **PostgreSQL** – Relational database
* **REST API** – API architecture
* **JWT** – Authentication and authorization
* **Git & GitHub** – Version control

## 📌 Features

* User authentication and authorization
* JWT-based authentication
* Billing and invoice management
* Customer management
* PostgreSQL database integration
* RESTful APIs
* Request validation
* Centralized error handling
* Environment-based configuration
* Modular and scalable backend architecture

## 📁 Project Structure

```text
billnest-backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── customers/
│   ├── invoices/
│   ├── common/
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

> The folder structure may vary depending on the modules implemented in the project.

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

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

### 3. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=billing_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
```

> Never commit your `.env` file to GitHub.

### 4. Start PostgreSQL

Make sure your PostgreSQL server is running and the configured database exists.

### 5. Run the application

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

## 🔐 Environment Variables

| Variable            | Description                            |
| ------------------- | -------------------------------------- |
| `PORT`              | Application port                       |
| `DATABASE_HOST`     | PostgreSQL host                        |
| `DATABASE_PORT`     | PostgreSQL port                        |
| `DATABASE_NAME`     | Database name                          |
| `DATABASE_USER`     | PostgreSQL username                    |
| `DATABASE_PASSWORD` | PostgreSQL password                    |
| `JWT_SECRET`        | Secret key used for JWT authentication |

## 🗄️ Database

BillNest uses **PostgreSQL** as its relational database.

The application uses PostgreSQL for storing and managing billing-related data such as:

* Users
* Customers
* Invoices
* Billing information

## 🔑 Authentication

Authentication is implemented using **JWT (JSON Web Tokens)**.

Typical authentication flow:

```text
Client
  ↓
Login API
  ↓
Validate credentials
  ↓
Generate JWT
  ↓
Return token
  ↓
Client sends token with protected requests
  ↓
JWT Guard validates token
  ↓
Access protected API
```

## 🛡️ API Security

The backend follows common API security practices including:

* JWT authentication
* Password hashing
* Request validation
* Protected routes
* Environment variables for sensitive configuration
* Centralized exception handling

## 🧪 Testing

Run the test suite with:

```bash
npm run test
```

For test coverage:

```bash
npm run test:cov
```

## 📦 Build

Create a production build:

```bash
npm run build
```

The compiled application will be generated in the `dist` directory.

## 🔄 Git Workflow

Clone the repository:

```bash
git clone https://github.com/GJDeepak/billnest-backend.git
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Commit changes:

```bash
git add .
git commit -m "Add billing API"
```

Push the branch:

```bash
git push origin feature/your-feature
```

## 👨‍💻 Author

**Jothi Deepak G**

Backend Developer | Node.js | TypeScript | NestJS | PostgreSQL

## 📄 License

This project is for development and learning purposes.
