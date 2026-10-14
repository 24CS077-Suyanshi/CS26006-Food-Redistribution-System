# Problem Statement

**Project ID:** CS26006  
**Course Code:** CEUP301 (Project - I / SGP 3)  
**Academic Year:** 2026-2027 (Semester V)  
**Student Name:** Suyanshi Patel (24CS077)  
**Department:** Computer Science & Engineering, CHARUSAT  

---

## 1. Context and Background

Globally, approximately **1.3 billion tons** of food produced for human consumption is lost or wasted annually, equivalent to roughly one-third of global food production. In India, despite significant agricultural output:
- Over **40% of food produced is wasted** across the supply chain, retail sector, and consumer events (Food and Agriculture Organization - FAO).
- Paradoxically, India ranks poorly on the Global Hunger Index, with millions of individuals experiencing acute nutritional deficiencies and food insecurity every day.
- Urban hubs, banquets, university campuses, catered corporate events, and restaurants discard metric tons of perfectly edible, high-quality cooked meals daily simply due to a lack of rapid, coordinated redistribution channels.

---

## 2. Problem Definition

Current surplus food recovery processes suffer from critical systemic bottlenecks:

1. **Fragmented Communication Channels:**
   - Donors typically rely on informal phone calls or uncoordinated social media group messages when surplus food becomes available. This lack of centralized infrastructure causes communication delays, often leading to food spoilage before assistance can arrive.

2. **Perishability & Food Safety Concerns:**
   - Prepared cooked food has a limited safe consumption window (typically 3 to 6 hours depending on storage temperature and food category). Donors and NGOs have no objective, scientific method to predict remaining shelf life or verify whether food is safe for human consumption upon arrival.

3. **Logistics & Volunteer Scarcity:**
   - NGOs and food distribution shelters often lack internal transport fleets. Without an on-demand crowd-sourced volunteer pickup network, transporting large quantities of food across city corridors remains cost-prohibitive and slow.

4. **Lack of Transparency & Auditability:**
   - Existing charitable drop-offs lack verification mechanisms. There is no cryptographic or handshake mechanism to prove that claimed food was actually delivered to the legitimate intended charity rather than misplaced, siphoned, or disposed of.

---

## 3. Proposed Solution

The **Food Redistribution System (FRS)** provides a full-stack, cloud-accessible, and AI-enabled digital solution to systematically conquer these bottlenecks:

- **Centralized Surplus Marketplace:** Enables institutional and household donors to list surplus food batches in under 60 seconds with key metadata (food category, portion count, preparation timestamp, and storage type).
- **AI-Powered Freshness & Shelf-Life Predictor:** Integrates machine learning algorithms to evaluate food safety dynamically, calculating remaining shelf life hours and recommending optimal distribution windows.
- **Role-Based Collaboration Engine:** Connects four distinct user archetypes:
  1. **Donors:** Restaurants, hotels, cafeterias, and event organizers listing surplus.
  2. **NGOs:** Certified food banks, shelters, and orphanages claiming meals.
  3. **Volunteers:** Crowd-sourced local individuals picking up and delivering food.
  4. **Admins:** Institutional supervisors validating participant credentials and auditing platform health.
- **Dual-Verification Secure OTP Handshake:** Guarantees proof-of-delivery by issuing a confidential 4-digit token to the recipient NGO. The delivery volunteer enters this OTP into the mobile-responsive system upon physical handover, securely closing the delivery cycle.

---

## 4. Target Beneficiaries & Societal Impact

| Beneficiary Group | Key Benefits Delivered |
| :--- | :--- |
| **Underprivileged Communities & Shelters** | Direct access to freshly cooked, nutritious meals at zero cost. |
| **Donors (Hotels, Caterers, Households)** | Zero-friction platform to fulfill CSR goals, reduce disposal costs, and prevent waste. |
| **NGOs & Food Banks** | Automated notifications of available nearby food batches with guaranteed safety metrics. |
| **Environment & Society** | Substantial reduction in methane emissions caused by decomposing organic landfill waste. |

---

## 5. Alignment with United Nations Sustainable Development Goals (SDGs)

This project directly addresses two key UN Sustainable Development Goals:
- **SDG 2: Zero Hunger (Target 2.1 & 2.2):** Ensuring access to safe, nutritious, and sufficient food for all people year-round.
- **SDG 12: Responsible Consumption and Production (Target 12.3):** Halving per capita global food waste at retail and consumer levels and reducing food losses along production and supply chains.
