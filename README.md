# Food Redistribution System: Real Life Solutions for Waste Management

[![Course](https://img.shields.io/badge/Course-CEUP301%20Project--I-blue.svg)](https://charusat.ac.in)
[![Semester](https://img.shields.io/badge/Semester-V%20(SGP--3)-orange.svg)](https://charusat.ac.in)
[![Institution](https://img.shields.io/badge/Institution-CHARUSAT-brightgreen.svg)](https://charusat.ac.in)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TailwindCSS-61DAFB.svg)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Python%20%2B%20Flask-000000.svg)](https://flask.palletsprojects.com/)
[![ML](https://img.shields.io/badge/AI%2FML-Random%20Forest%20Classifier-FF6F00.svg)](https://scikit-learn.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20In--Memory%20Mock-4479A1.svg)](https://mysql.com)

---

## 📌 Project Information

- **Project ID:** CS26006
- **Project Title:** Food Redistribution System: Real Life Solutions for Waste Management
- **Course Code:** CEUP301 (Project - I / SGP 3)
- **Academic Year / Semester:** 2026-2027 / Semester V
- **Student Name:** Suyanshi Patel
- **Student ID:** 24CS077
- **Repository Name:** CS26006-Food-Redistribution-System
- **Department:** Department of Computer Science & Engineering
- **Institute:** Chandubhai S. Patel Institute of Technology (CSPIT)
- **University:** Charotar University of Science and Technology (CHARUSAT), Changa, Anand, Gujarat - 388421

---

## 📑 Required Project Documentation (CEUP301 Deliverables)

As mandated by the Project-I CEUP301 curriculum, the detailed documentation files are structured and accessible below:

| Document | Description | Direct Link |
| :--- | :--- | :--- |
| **Problem Statement** | Problem definition, background, target audience, and societal relevance | [📄 View PROBLEM_STATEMENT.md](PROBLEM_STATEMENT.md) |
| **Literature Survey** | Review of existing solutions, research papers, and comparative gap analysis | [📄 View LITERATURE_SURVEY.md](LITERATURE_SURVEY.md) |
| **Project Timeline** | Week 1 to Week 12 milestone breakdown and progress schedule | [📄 View PROJECT_TIMELINE.md](PROJECT_TIMELINE.md) |
| **Requirements Specification** | Functional (FRS), Non-Functional (NFRS), and Hardware/Software specs | [📄 View REQUIREMENTS.md](REQUIREMENTS.md) |
| **Project Proposal** | Formal softcopy proposal formatted for mentor review & submission | [📄 View PROJECT_PROPOSAL.md](PROJECT_PROPOSAL.md) |

---

## 💡 Executive Summary

Millions of tons of edible food from restaurants, weddings, banquets, and supermarkets are discarded daily while underprivileged populations face acute food insecurity. The **Food Redistribution System (FRS)** bridges this critical gap through a full-stack, data-driven, and AI-assisted platform.

### Key Pillars:
1. **Four Role-Based Portals:** Personalized interfaces for **Donors**, **NGOs/Food Banks**, **Volunteers**, and **System Administrators**.
2. **AI Freshness & Shelf-Life Predictor:** Machine learning model predicting consumption suitability based on food category, prepared time, ambient temperature, and storage conditions.
3. **Secure Dual OTP Handshake:** Cryptographic delivery verification where the recipient NGO receives a unique OTP, which the delivery volunteer enters upon physical drop-off to eliminate false claims.
4. **Real-Time Operational Lifecycle:** Dynamic status updates (`Available` ➔ `Claimed` ➔ `In Transit` ➔ `Delivered`) backed by automated synchronization.

---

## 🏗️ System Architecture & Workflow

The platform follows a clean **3-Tier Architecture**:

```
+------------------------------------------------------------------------+
|                          1. CLIENT TIER (UI)                          |
|  React 18 + Vite | Tailwind CSS | Responsive Dashboards (4 Roles)       |
+------------------------------------------------------------------------+
                                   ▲
                                   │  RESTful JSON APIs (Axios)
                                   ▼
+------------------------------------------------------------------------+
|                      2. APPLICATION TIER (BACKEND)                    |
|  Flask REST Server | Auth Middleware | AI Freshness Predictor (ML)      |
|  OTP Generation & Handshake Engine | Batch Lifecycle Manager           |
+------------------------------------------------------------------------+
                                   ▲
                                   │  SQL / ORM Connection
                                   ▼
+------------------------------------------------------------------------+
|                          3. DATA TIER (STORAGE)                       |
|  MySQL Relational Database  <--->  Auto In-Memory Fallback Engine       |
+------------------------------------------------------------------------+
```

### Complete Workflow:
1. **Listing:** A Donor adds a food listing specifying food title, category, portion count, preparation timestamp, and storage type.
2. **AI Quality Check:** The AI Freshness engine calculates estimated remaining shelf-life hours and safety recommendations.
3. **Claiming:** Registered NGOs browse nearby listings and claim a batch. The backend generates a secure 4-digit verification OTP accessible only to the NGO.
4. **Pickup & Transit:** Available Volunteers accept the delivery assignment and collect food from the donor.
5. **Secure Handshake:** At the NGO shelter, the NGO shares their private OTP with the volunteer. The volunteer enters the OTP to complete the handshake and mark the batch `Delivered`.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+), Tailwind CSS, Lucide React Icons, React Hot Toast |
| **Backend** | Python 3.10+, Flask, Flask-CORS, Werkzeug Security |
| **Machine Learning** | Scikit-Learn, Random Forest Classifier / Heuristic Predictor, NumPy |
| **Database** | MySQL 8.0 (`mysql-connector-python`) with resilient Mock In-Memory DB Fallback |
| **Version Control** | Git & GitHub (`main` branch workflow, issue tracking, milestones) |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)
- [Git](https://git-scm.com/)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/24CS077-Suyanshi/CS26006-Food-Redistribution-System.git
cd CS26006-Food-Redistribution-System
```

---

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server (runs on http://127.0.0.1:5000)
python app.py
```

---

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 👥 Demo Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@frs.org` | `password123` | Create food listings, view batch statuses |
| **NGO** | `ngo@frs.org` | `password123` | Claim food, view claimed batches & private OTPs |
| **Volunteer** | `volunteer@frs.org` | `password123` | Accept pickups, enter OTP to complete delivery |
| **Admin** | `admin@frs.org` | `password123` | System oversight, user verification, platform metrics |

