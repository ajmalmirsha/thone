# 🏥 Thone — Hospital & Patient Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://thone-avjo.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18%2B-blue.svg)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-skyblue.svg)](https://www.sqlite.org/)

🌐 **Live Demo**: [https://thone-avjo.vercel.app/](https://thone-avjo.vercel.app/)

**Thone** is an intelligent, modern hospital management system designed to streamline patient care, medical scan analysis, medication tracking, and clinical workflow management for doctors and nursing staff.

---

## ✨ Features

- **📋 Patient Info & Admission Management**: 
  - Register new patients with auto-generated UHID.
  - Track patient ward, bed allocation, blood group, contact details, and clinical history.
  - **🗑️ Delete Patient Record**: Fully integrated patient record deletion with modal confirmation and cascading database cleanup.

- **🤖 AI Medical Scan Vision & Analysis**:
  - Built-in AI vision & OCR parsing engine for **X-Rays, Lab Reports, Prescriptions, Dermatology scans, and CT/MRI scans**.
  - Auto-extracts diagnostic findings, severity levels (`normal`, `moderate`, `severe`, `critical`), confidence scores, and structured clinical action items.

- **✅ TODOs & Care Checklists**:
  - Manage patient care tasks with priority tagging (`urgent`, `high`, `normal`, `low`) and due times.

- **🧪 Lab & Radiology Investigations**:
  - Track test requests, statuses (`pending`, `in_progress`, `completed`), and upload clinical reports.

- **💊 Medication & Prescription Tracking**:
  - Log prescribed medications, dosages, administration routes (Oral, IV), and dosing schedules.
  - Track real-time administration history.

- **👥 Bystander Briefs**:
  - Generate clear, accessible summaries for patient relatives detailing current medical situations, management plans, and recovery expectations.

- **🌗 Modern UI & Design System**:
  - Sleek glassmorphism design with customizable Dark and Light modes.
  - Fully responsive layout tailored for hospital desktop workstations and mobile clinical tablets.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, React Router DOM, Axios, Vanilla CSS (Design Tokens & Glassmorphism) |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | SQLite3 (`better-sqlite3`) with WAL mode & Foreign Key constraints |
| **Authentication** | JWT (JSON Web Tokens) with Role-Based Access Control (`doctor`, `nurse`) |

---

## 📁 Repository Structure

```
thone/
├── client/                      # React Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI components (Modal, PatientInfo, AIImageScanner, etc.)
│   │   ├── context/             # AuthContext & ThemeContext
│   │   ├── pages/               # DashboardPage, PatientPage, LoginPage
│   │   ├── api.js               # Axios API configuration & endpoints
│   │   └── index.css            # Global CSS design tokens & theme styles
│   ├── package.json
│   └── vite.config.js
│
└── server/                      # Node.js Express API Server
    ├── db/
    │   ├── schema.js            # SQLite database schema & tables
    │   └── seed.js              # Database seed script for initial testing
    ├── middleware/              # Auth & role-based middleware
    ├── routes/                  # Express API route handlers
    │   ├── auth.js
    │   ├── patients.js
    │   ├── scans.js
    │   ├── investigations.js
    │   ├── medicines.js
    │   ├── todos.js
    │   └── bystanderBriefs.js
    ├── index.js                 # Server entry point
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- `npm` (v9.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/ajmalmirsha/thone.git
cd thone
```

### 2. Set Up the Backend Server
```bash
cd server
npm install

# Seed sample hospital data (Optional)
npm run seed

# Start the API server (Runs on http://localhost:5000)
npm run dev
```

### 3. Set Up the Frontend Client
Open a new terminal window:
```bash
cd client
npm install

# Start the Vite development server (Runs on http://localhost:5173)
npm run dev
```

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | User Login (Doctor / Nurse) | Public |
| `GET` | `/api/patients` | List all patients (supports search) | Authenticated |
| `POST` | `/api/patients` | Register new patient | Authenticated |
| `GET` | `/api/patients/:id` | Get patient details & care summary | Authenticated |
| `PUT` | `/api/patients/:id` | Update patient information | Authenticated |
| `DELETE` | `/api/patients/:id` | Delete patient record | Doctor |
| `GET` | `/api/patients/:id/scans` | Fetch medical scans for patient | Authenticated |
| `POST` | `/api/patients/:id/scans/analyze` | Run AI Vision analysis on scan | Authenticated |
| `POST` | `/api/scans/:id/apply` | Apply AI recommended actions | Authenticated |
| `GET` | `/api/patients/:id/investigations` | Get patient investigations | Authenticated |
| `GET` | `/api/patients/:id/medicines` | Get patient medications | Authenticated |
| `GET` | `/api/patients/:id/todos` | Get patient TODOs | Authenticated |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
