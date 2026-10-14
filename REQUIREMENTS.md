# Software Requirements Specification (SRS)

**Project ID:** CS26006  
**Project Title:** Food Redistribution System: Real Life Solutions for Waste Management  
**Course Code:** CEUP301 (Project - I / SGP 3)  
**Academic Year:** 2026-2027 (Semester V)  
**Student Name:** Suyanshi Patel (24CS077)  
**Department:** Computer Science & Engineering, CHARUSAT  

---

## 1. Introduction

This document details the complete functional and non-functional requirements, user interfaces, system constraints, and hardware/software specifications for the **Food Redistribution System (FRS)**.

---

## 2. User Roles and Personas

| Role | Description | Primary Capabilities |
| :--- | :--- | :--- |
| **Donor** | Commercial entities (hotels, banquet halls, restaurants, corporate cafeterias) and domestic donors. | - Create surplus food listings.<br>- Track status of listed food batches.<br>- Access AI freshness assessment before listing. |
| **NGO / Food Bank** | Certified non-governmental charitable organizations, hunger-relief shelters, and orphanages. | - Browse available surplus food batches.<br>- Claim food batches matching requirement.<br>- Receive secure 4-digit verification OTP.<br>- Confirm safe delivery handover. |
| **Volunteer** | Individuals who provide crowdsourced transportation and delivery support. | - View claimed batches awaiting pickup.<br>- Accept pickup task.<br>- Transport food safely to recipient NGO.<br>- Submit OTP provided by NGO to complete delivery. |
| **Administrator** | Institutional supervisors overseeing system health. | - Verify new NGO and Donor registrations.<br>- Monitor system-wide distribution metrics.<br>- Audit transactions and ensure food safety compliance. |

---

## 3. Functional Requirements (FRS)

### Module 1: User Authentication & Role-Based Access Control (RBAC)
- **FR-1.1:** The system shall allow users to register under one of three public roles: `Donor`, `NGO`, or `Volunteer`.
- **FR-1.2:** The system shall enforce role-based redirection to dedicated dashboard views upon successful authentication.
- **FR-1.3:** The system shall store authentication tokens in client state and securely validate all sensitive API requests.

### Module 2: Surplus Food Listing Management
- **FR-2.1:** Donors shall be able to submit food donation batches with fields:
  - Food Title / Description
  - Category (`Veg` / `Non-Veg` / `Bakery` / `Packaged`)
  - Quantity (Portions or Weight in kg)
  - Preparation Time and Expiry Horizon
  - Storage Type (`Refrigerated`, `Hot Storage`, `Room Temperature`)
  - Pickup Address & Contact Details
- **FR-2.2:** The system shall instantly set newly posted donations to `Available` status.

### Module 3: AI-Assisted Freshness & Shelf-Life Predictor
- **FR-3.1:** The system shall provide an interactive AI Freshness tool accessible to all authenticated dashboards.
- **FR-3.2:** The prediction engine shall accept food parameters (category, time elapsed since preparation, ambient temperature, packaging) and output:
  - Estimated remaining shelf-life (hours)
  - Freshness percentage score (0-100%)
  - Recommendation status (`Safe for immediate consumption`, `Needs refrigeration`, `Unsafe / Expired`)

### Module 4: NGO Claiming & Allocation
- **FR-4.1:** NGOs shall view a live catalog of `Available` donations with location and quantity details.
- **FR-4.2:** When an NGO claims a batch:
  - The donation status transitions to `Claimed`.
  - A secure, unique 4-digit verification OTP is generated and stored with the request record.
  - The OTP is revealed strictly to the claiming NGO and hidden from public views.

### Module 5: Volunteer Pickup & Dual OTP Handshake
- **FR-5.1:** Volunteers shall view all `Claimed` donations awaiting transport.
- **FR-5.2:** Volunteers can accept a pickup, transitioning the batch status to `In Transit`.
- **FR-5.3:** Upon arriving at the NGO location, the volunteer must enter the 4-digit OTP provided verbally or visually by the NGO representative.
- **FR-5.4:** The backend verifies the OTP match; upon success, the batch status permanently updates to `Delivered`, closing the transaction.

### Module 6: System Administration & Metrics
- **FR-6.1:** Administrators shall view platform-wide statistics (Total Meals Saved, Active Donors, Registered NGOs, Delivered Batches).
- **FR-6.2:** Administrators shall have privilege to verify or suspend user accounts.

---

## 4. Non-Functional Requirements (NFRS)

### 4.1 Security
- Passwords must be hashed using industry-standard algorithms (e.g., bcrypt/SHA-256).
- Verification OTPs must never be exposed over public APIs or sent to unauthorized clients.
- Sanitized SQL queries to prevent SQL Injection vulnerabilities.

### 4.2 Usability & Responsiveness
- High-contrast, mobile-friendly interface tested across mobile phones, tablets, and desktop resolutions.
- Accessible navigation; public landing page keeps landing links (`Home`, `About`, `How It Works`, `Features`, `Contact`), while internal dashboards feature clean, distraction-free workspaces.

### 4.3 Performance & Reliability
- API responses for batch listing and claiming must execute in under 200 ms under typical loads.
- Client state updates must use optimistic caching and fast hot-module reload for seamless user experience.
- Automated fallback to an in-memory database mock if external MySQL database connectivity is interrupted.

---

## 5. Hardware and Software Specifications

### 5.1 Development & Deployment Environment
- **Processor:** Intel Core i3 / i5 / AMD Ryzen 5 or higher
- **Memory (RAM):** 8 GB RAM minimum (16 GB recommended)
- **Disk Storage:** 500 MB minimum free storage space

### 5.2 Software Environment
- **Operating System:** Windows 10/11, Ubuntu 20.04+, or macOS Monterey+
- **Frontend Framework:** React 18 with Vite build tooling
- **Styling Engine:** Tailwind CSS & Vanilla CSS design tokens
- **Backend Framework:** Python 3.10+ with Flask REST API
- **Machine Learning Libraries:** Scikit-Learn, NumPy
- **Database System:** MySQL 8.0 / Mock in-memory Python relational fallback
- **Browsers Supported:** Google Chrome (v100+), Mozilla Firefox (v100+), Microsoft Edge (v100+)
