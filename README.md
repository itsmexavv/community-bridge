# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Welcome to CommunityBridge

**CommunityBridge** is a modern, real-time extension program management system built specifically for the University of Saint Louis — Tuguegarao City. It is designed to streamline how the university organizes community outreach programs, tracks volunteer hours, manages documents, and coordinates tasks.

Here is a quick breakdown of how the platform works:

---

## 👥 Role-Based Access Control
The system tailors the experience based on who is logged in. 

### 1. 🛡️ Administrator (Exclusive)
*The Director or Head of Extension Services.*
- **Capabilities:** Has full control over the entire system. Can view and manage all modules, including internal partners and system-wide reports.
- **Task Management:** Can assign tasks to specific staff members or volunteers and view a real-time progress dashboard of everyone's workload.
- **Access:** Admin accounts cannot be created via the public registration page. They use exclusive credentials known only to the system owners (`admin@usl.edu.ph`).

### 2. 👔 Staff
*Faculty or Extension Coordinators.*
- **Capabilities:** Can create new Programs, register Beneficiaries, log Activities, and manage Documents.
- **Task Management:** They receive tasks assigned by the Admin. They can update their task status (Pending → In Progress → Completed) and adjust their progress slider (0% to 100%).

### 3. 🙋 Volunteer
*Student Volunteers.*
- **Capabilities:** A focused, restricted view. Volunteers can only access the Dashboard, Activities (to see past and upcoming events), and their personal Tasks page.
- **Task Management:** They only see tasks explicitly assigned to them. They use this page to report back to coordinators on how far along they are on a given assignment.

---

## 🛠️ Core Modules Explained

### 📊 Dashboard
The central hub. It provides an at-a-glance view of total active programs, registered beneficiaries, total volunteer hours served, and how the university's programs align with the **UN Sustainable Development Goals (SDGs)**.

### 📋 Programs & Beneficiaries
- **Programs:** Where staff outline the main outreach initiatives (e.g., "Digital Literacy Drive", "Coastal Clean-up"). Programs are tracked by status (Active, Planned, Completed).
- **Beneficiaries:** A database of the communities, schools, or groups that receive aid from the university.

### 📝 Activities & Tasks (Real-Time Tracking)
- **Activities:** Used to document specific events under a Program (e.g., Day 1 of the Literacy Drive). It tracks the date, location, and which volunteers were deployed.
- **Tasks:** A project management board. Admins assign to-do items to staff/volunteers. As workers drag their progress sliders, the Admin's overview dashboard updates instantly to reflect completion rates.

### 📂 Documents & Reports
- **Documents:** A secure file repository where users can drag-and-drop MOAs (Memorandums of Agreement), waivers, and accomplishment reports for safekeeping.
- **Reports (Admin Only):** Allows the admin to export system data and perform **Data Backup & Restores** (downloading the entire database as a JSON file to prevent data loss).

---

## ☁️ Cloud Sync vs. Local Mode
Look at the top-right corner of the screen. You will see a badge that says either **☁️ Cloud Sync** or **💾 Local Mode**.
- **Local Mode:** The system saves data instantly to your browser. This means the app is lightning fast and works perfectly offline or for demonstrations.
- **Cloud Sync:** When the system is connected to Firebase, data syncs in real-time across all devices. If an Admin assigns a task on their laptop, the Volunteer will see it instantly on their phone.

---

### How to Get Started
1. Go to the [Live Website](https://itsmexavv.github.io/community-bridge/).
2. Click **"Register here"** at the bottom of the sign-in page to create a Staff or Volunteer account using any email address (e.g., your Gmail).
3. Log in, check out your Dashboard, and start exploring the modules!
