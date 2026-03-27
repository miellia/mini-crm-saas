# 🧠 Mini CRM for Small Businesses

A production-style Mini CRM system designed to simulate real-world SaaS workflows.  
Built with the MERN stack, this application helps small businesses manage customers, track interactions, and visualize their sales pipeline — all through a clean, modern interface.

---

## 🧠 Problem & Purpose

Small businesses often struggle to keep track of customer conversations, follow-ups, and sales progress. Existing CRM tools are often too complex, bloated, or expensive.

This project was built to provide a **lightweight, intuitive CRM solution** that allows business owners to:

- Organize and manage customer data
- Track communication history in one place
- Monitor sales progress visually
- Make better follow-up decisions

---

## ✨ Features

- 🔐 **Authentication**  
  Secure JWT-based admin login system

- 📊 **Dashboard**  
  Visual insights with charts (customer growth, pipeline distribution, activity)

- 👥 **Customer Management**  
  Full CRUD operations with search and filtering

- 📄 **Customer Profiles**  
  Detailed view including:
  - Tags (VIP, Lead, etc.)
  - Interaction timeline
  - Current pipeline status

- 📝 **Interaction Tracking**  
  Log calls, emails, meetings, and notes with timestamps

- 🧩 **Pipeline Board (Kanban)**  
  Drag-and-drop interface to manage customer stages:
  - Lead → Contacted → Converted

- 🌗 **Dark / Light Mode**  
  Persistent theme toggle using local storage

- 🔔 **Notifications Panel**  
  Real-time activity and system alerts

- 🎨 **Modern UI/UX**  
  Glassmorphism design, smooth animations, and responsive layout

---

## 📸 Screenshots

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)

### 👥 Customers Page
![Customers](./screenshots/customers.png)

### 📄 Customer Profile
![Customer Profile](./screenshots/customer-profile.png)

### 🧩 Pipeline Board
![Pipeline](./screenshots/pipeline.png)

### 🌗 Dark Mode UI
![Dark Mode](./screenshots/darkmode.png)

### 🔔 Notifications Panel
![Notifications](./screenshots/notifications.png)

### 🧾 Customer Details & Interactions
![Customer Details](./screenshots/customer-details.png)

---

## 🏗️ Architecture Overview

- **Frontend:** React (Vite) with Tailwind CSS and shadcn/ui  
- **Backend:** Node.js + Express (REST API)  
- **Database:** MongoDB (Mongoose ODM)  
- **Authentication:** JWT-based session handling  
- **Charts:** Recharts for data visualization  

### System Design

- Modular backend structure (routes, controllers, models)
- Component-based frontend architecture
- RESTful API communication between client and server
- Centralized state handling for UI consistency

---

## ⚡ Key Challenges & Solutions

- **Flexible Data Modeling**  
  Designed MongoDB schemas to support dynamic customer interactions and tagging

- **Pipeline System (Kanban)**  
  Implemented drag-and-drop logic for intuitive status updates

- **State Synchronization**  
  Managed consistent data flow between frontend UI and backend APIs

- **Reusable UI Components**  
  Built scalable components for forms, tables, and cards

---

## 💻 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- shadcn/ui (Radix UI + CVA)
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- BcryptJS

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas (or local MongoDB instance)

---

### 1. Database Configuration

Update your environment variables:

```
server/.env
```

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

---

### 3. Seed Database

Populate with demo data:

```bash
cd server
npm run seed
```

---

### 4. Run the Application

Start backend:
```bash
cd server
npm run dev
```

Start frontend (new terminal):
```bash
cd client
npm run dev
```

---

### 5. Access the App

Open:
```
http://localhost:3000
```

---

## 🔑 Demo Credentials

- **Email:** admin@crm.com  
- **Password:** admin123  

---

## 🚀 Future Improvements

- AI-based follow-up suggestions
- Email integration
- Multi-user role system (team access)
- Activity analytics & reporting
- Cloud deployment (Vercel + Render)

---

## 📌 Final Notes

This project was built to simulate a real-world SaaS CRM product with a focus on:

- Clean architecture
- Scalable design
- Modern UI/UX
- Practical business use-case

---

## 👨‍💻 Author

Built as part of a full-stack portfolio showcasing real-world application development.

