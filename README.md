# 📦 StockFlow MVP

> **A secure, multi-tenant inventory management system.**

[![Live Demo](https://img.shields.io/badge/demo-live-green?style=for-the-badge)](https://stockflow-mvp-azure.vercel.app/)

---

## 🚀 Project Overview
StockFlow is built to handle complex inventory needs within an **Organization Context**. It allows users to manage products while ensuring data is never leaked between different companies.

## 🛠️ Tech Stack
* **Frontend**: React + Vite + Tailwind CSS
* **Backend**: Node.js + Express
* **Database**: SQLite + Prisma ORM
* **Auth**: JWT (JSON Web Tokens)

## ✨ Key Features
* **Multi-tenant Architecture**: Automatic organization creation upon signup.
* **Dashboard**: High-level metrics for Total Products and Stock count.
* **Inventory Alerts**: Automated "Low Stock" flagging based on thresholds.
* **Product CRUD**: Full management of SKUs, pricing, and stock.

## 🏗️ Getting Started

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn

### Setup Instructions
1. **Clone & Install**
   ```bash
   git clone [https://github.com/ArupK1/Stockflow-MVP.git](https://github.com/ArupK1/Stockflow-MVP.git)
   cd Stockflow-MVP
   npm install

2. **Database Migration**
    ```bash
    npx prisma migrate dev

3. **Run Application**
    ```bash
    npm run dev
