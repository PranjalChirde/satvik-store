# 🪔 Satvik Store

A modern, full-stack e-commerce web application for authentic Indian spiritual and natural products — including pure desi ghee and cotton diya wicks.

---

## ✨ Features

- 🛒 Product listing with detailed product pages
- 🔐 Secure user authentication (JWT-based)
- 👤 Role-based access control (Admin / User)
- 📦 Admin dashboard for managing products and orders
- 💳 Cart and checkout flow
- 📱 Fully responsive design

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + TypeScript + Vite         |
| Styling    | Tailwind CSS + shadcn/ui          |
| Backend    | Node.js + Express + TypeScript    |
| Database   | PostgreSQL / SQLite               |
| Auth       | JWT (JSON Web Tokens)             |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm i
```

### 2. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

---

## 📁 Project Structure

```
test-store/
├── src/          # React frontend source
├── server/       # Express backend (TypeScript)
├── public/       # Static assets
└── dist/         # Production build output
```

---

## 🔒 Environment Variables

Create a `.env` file in the `server` directory with the following:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

---

## 📜 License

This project is private and proprietary to **Satvik Store**.
