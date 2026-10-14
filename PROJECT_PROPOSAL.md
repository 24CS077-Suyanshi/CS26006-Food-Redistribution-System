# PROJECT PROPOSAL (CEUP301)

**DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING**  
**CHANDUBHAI S. PATEL INSTITUTE OF TECHNOLOGY (CSPIT)**  
**CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY (CHARUSAT)**  

---

### Project Metadata

| Field | Details |
| :--- | :--- |
| **Project ID** | **CS26006** |
| **Project Title** | **Food Redistribution System: Real Life Solutions for Waste Management** |
| **Course Code & Name** | **CEUP301: Project - I (SGP - 3)** |
| **Academic Year & Semester** | **2026 - 2027 \| Semester V (B.Tech CSE)** |
| **Student Name** | **Suyanshi Patel** |
| **Student ID / Roll No.** | **24CS077** |
| **GitHub Repository** | [https://github.com/24CS077-Suyanshi/CS26006-Food-Redistribution-System](https://github.com/24CS077-Suyanshi/Food-Redistribution-System) |
| **Date of Submission** | **30th July, 2026** |

---

## 1. Abstract

Food waste is one of the most pressing socio-environmental challenges of modern urban civilization. In India, staggering amounts of high-quality cooked surplus meals from hotels, weddings, university cafeterias, and restaurants are discarded daily into municipal landfills. Concurrently, millions of vulnerable citizens face acute malnutrition and hunger. 

This project, titled **Food Redistribution System (FRS)**, develops a full-stack, AI-enhanced, crowdsourced redistribution platform designed to bridge the chasm between commercial food donors and charitable hunger-relief shelters. Built upon a robust 3-tier architecture (React.js frontend, Python Flask REST backend, and MySQL database), the platform incorporates an intelligent **AI Freshness & Shelf-Life Predictor** to scientifically evaluate food perishability and a **Dual-Verification Cryptographic OTP Handshake** to guarantee transparent, tamper-proof physical delivery.

---

## 2. Problem Statement

Commercial surplus food recovery currently suffers from:
1. **Lack of Instantaneous Communication:** Disorganized phone calls and social media groups cause severe communication lag, letting perishable food decay.
2. **Food Safety & Spoilage Uncertainty:** Donors and NGOs have no scientific mechanism to evaluate the remaining consumption window of prepared food.
3. **Logistics & Volunteer Deficit:** Small NGOs cannot afford dedicated transport fleets to retrieve distant donations.
4. **Absence of Proof of Delivery:** Without physical delivery verification, donated food risks mismanagement or loss during transit.

---

## 3. Project Objectives

1. Develop a high-performance web platform supporting 4 distinct user roles: **Donor**, **NGO**, **Volunteer**, and **Administrator**.
2. Construct an automated surplus listing lifecycle with dynamic status transitions: `Available` ➔ `Claimed` ➔ `In Transit` ➔ `Delivered`.
3. Implement an interactive **AI Freshness Engine** that predicts remaining shelf-life hours based on food category, elapsed time, and storage medium.
4. Establish a **Dual OTP Verification Handshake** between recipient NGO and volunteer courier to eliminate false claims and guarantee delivery non-repudiation.
5. Provide a responsive, modern interface that functions seamlessly on mobile devices and desktop workstations.

---

## 4. Methodology & Architecture

The application adopts an industry-standard **3-Tier Architecture**:

1. **Client Tier (Presentation Layer):**
   - Built with **React 18** and **Vite** for rapid hot-module reloading and reactive state management.
   - Styled using Tailwind CSS and custom tokens for accessible, high-contrast user interfaces.
   - Separate dashboards tailored for each role with role-based navigation.

2. **Application Tier (Business Logic Layer):**
   - Implemented using **Python Flask** providing RESTful JSON endpoints.
   - Houses the **AI Freshness Prediction Model** utilizing Scikit-Learn.
   - Manages state machines for batch lifecycles and cryptographic OTP generation.

3. **Data Tier (Persistence Layer):**
   - **MySQL Relational Database** modeling Users, Batches, Claims, and Verification Logs.
   - Features an integrated in-memory fallback mechanism to ensure 100% platform availability during local demonstrations.

---

## 5. Hardware and Software Requirements

### Hardware Requirements:
- Standard PC/Laptop with Intel Core i3/i5 or AMD equivalent.
- 8 GB RAM (16 GB recommended).
- 500 MB minimum available hard disk space.

### Software Requirements:
- **Operating System:** Windows 10/11, Linux, or macOS.
- **Frontend Stack:** Node.js (v18+), React.js 18, Vite, Tailwind CSS.
- **Backend Stack:** Python 3.10+, Flask, Flask-CORS.
- **Machine Learning:** Scikit-Learn, NumPy.
- **Database:** MySQL 8.0 / Python in-memory DB fallback.
- **Version Control:** Git, GitHub repository.

---

## 6. Project Timeline & Milestones (16-Week Semester Plan)

| Phase | Duration | Planned Milestones |
| :--- | :--- | :--- |
| **Phase 1: Inception & Proposal** | Weeks 1 - 4 | Domain analysis, literature survey, proposal submission (July 30, 2026), GitHub repository setup. |
| **Phase 2: System Design** | Weeks 5 - 6 | UML modeling, database schema, 3-tier architecture design. |
| **Phase 3: Core Implementation** | Weeks 7 - 10 | Flask backend APIs, React UI, 4 user role dashboards, batch claiming lifecycle. |
| **Phase 4: AI & Security** | Weeks 11 - 12 | AI Freshness predictor integration, secure dual OTP delivery handshake. |
| **Phase 5: Testing & Polishing** | Weeks 13 - 14 | Integration testing, usability polish, performance optimization. |
| **Phase 6: Evaluation & Viva** | Weeks 15 - 16 | Final documentation, presentation deck, viva defense. |

---

## 7. Expected Outcomes & Societal Impact

- A functional, live prototype ready for campus and municipal trial deployments.
- Substantial reduction in landfill methane emissions through timely surplus redistribution.
- Direct nutritional support to impoverished individuals and orphanages.
- Full compliance with CHARUSAT Project-I (CEUP301) continuous GitHub evaluation criteria.

