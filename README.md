# AgriSupply — Smart Agricultural Supply Chain & Cold Chain Management System

🚀 **Live Demo:** [https://agrisupply.onrender.com](https://agrisupply.onrender.com)

A full-stack SaaS web application for managing the agricultural supply chain, from farmer registration to cold chain temperature monitoring.

## 🌱 Features

- **Farmer Management**: CRUD operations for farmer profiles with search & pagination
- **Product Management**: Track agricultural products by category, with expiry monitoring
- **Warehouse Dashboard**: Capacity visualization with utilization metrics
- **Shipment Tracking**: Status pipeline (Pending → In Transit → Delivered)
- **Temperature Monitoring**: Cold chain monitoring with alert system for threshold violations
- **Dashboard Analytics**: Charts (bar, line, pie) for supply chain insights
- **JWT Authentication**: Login/signup with role-based access (Admin, Farmer, Transporter)
- **Dark/Light Mode**: Theme toggle with persistence

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, Recharts, Lucide Icons |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2.0 (async) |
| Database | SQLite (dev) / PostgreSQL (production) |
| Auth | JWT with bcrypt password hashing |

## 🚀 Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt

# Seed database with demo data
python -m app.seed

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agrisupply.com | admin123 |
| Farmer | farmer1@agrisupply.com | farmer123 |
| Transporter | transport@agrisupply.com | transport123 |

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/          # Config, database, security
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── routers/       # API route handlers
│   │   ├── services/      # Business logic (CRUD)
│   │   ├── main.py        # FastAPI app entry point
│   │   └── seed.py        # Database seeding script
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client
│   │   ├── components/    # Layout & UI components
│   │   ├── contexts/      # Auth & Theme contexts
│   │   ├── pages/         # Route-level pages
│   │   ├── App.jsx        # Main router
│   │   └── index.css      # Tailwind + design system
│   └── vite.config.js
│
└── README.md
```

## 📊 Database Schema

The database follows **3NF normalization** with 8 tables:
- Users, Farmers, Products, Warehouses, Inventory, Transports, Shipments, Temperature Logs

## 🔑 API Documentation

With the backend running, visit **http://localhost:8000/docs** for the interactive Swagger API documentation.
