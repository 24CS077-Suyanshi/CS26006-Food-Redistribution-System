# Literature Survey

**Project ID:** CS26006  
**Course Code:** CEUP301 (Project - I / SGP 3)  
**Academic Year:** 2026-2027 (Semester V)  
**Student Name:** Suyanshi Patel (24CS077)  
**Department:** Computer Science & Engineering, CHARUSAT  

---

## 1. Introduction

The growing crisis of food waste alongside urban hunger has prompted numerous software architectures, non-profit initiatives, and research studies worldwide. This literature review analyzes the technological strengths, limitations, and operational gaps of existing systems and foundational research papers in the domain of food recovery and logistics.

---

## 2. Review of Existing Real-World Systems

### 2.1 Feeding India (by Zomato)
- **Overview:** A prominent Indian non-profit organization operating under Zomato’s CSR wing, mobilizing meals to underserved communities.
- **Strengths:** High financial backing, brand recognition, and extensive logistics network in tier-1 metropolitan cities.
- **Identified Gaps:**
  - Highly centralized; relies heavily on manual coordination and internal administrative intervention.
  - Does not provide an automated open API or public predictive model for food shelf-life estimation.
  - Smaller donors and decentralized tier-2/tier-3 cities face long lead times and lack of real-time transparency.

### 2.2 Robin Hood Army (RHA)
- **Overview:** A volunteer-driven zero-funds organization that gathers surplus food from restaurants and redistributes it to local communities.
- **Strengths:** Massive grassroots community presence and high volunteer engagement.
- **Identified Gaps:**
  - Primarily coordinates via WhatsApp and Facebook groups, leading to message clutter, lost requests, and communication bottlenecks.
  - Lacks automated verification or dual handshake mechanisms to validate delivery integrity.
  - No scientific food perishability forecasting; safety is evaluated through subjective visual and olfactory inspection.

### 2.3 Olio / Too Good To Go (International Platforms)
- **Overview:** Mobile apps connecting neighbors and local businesses with surplus food to prevent domestic and commercial waste.
- **Strengths:** Excellent gamification and peer-to-peer user experience.
- **Identified Gaps:**
  - Tailored primarily for commercial discounted sales (B2C) rather than institutional philanthropic redistribution.
  - Lacks dedicated integration with registered non-profit shelters, high-volume banquet donations, and third-party volunteer pickup fleets.

---

## 3. Academic Research Paper Review

### Paper 1: "IoT and Machine Learning for Food Quality and Freshness Assessment"
- **Authors:** Kumar, P., & Sharma, R. (IEEE Access, 2022)
- **Key Findings:** Demonstrated that food shelf-life degradation is a non-linear multivariate function influenced by initial preparation temperature, ambient humidity, moisture level, and storage categorization.
- **Takeaway for Our System:** In the absence of physical gas/pH sensors on every takeout container, machine learning estimators (such as Random Forest Regression and Classification) utilizing temporal elapsed delta, storage condition, and food category yield high empirical accuracy (>88%) for estimating safe consumption windows.

### Paper 2: "Last-Mile Delivery Optimization in Humanitarian Food Logistics"
- **Authors:** Alcaraz, J., & Santos, M. (Journal of Humanitarian Logistics and Supply Chain Management, 2021)
- **Key Findings:** Highlighted that the primary failure point in perishable food rescue is the "idle latency" between donation notice and pickup confirmation. Unassigned donations decay beyond edibility within 180 minutes.
- **Takeaway for Our System:** Real-time push synchronization and role-segregated dispatch boards (where volunteers immediately see pending claimed batches with donor pickup coordinates) drastically reduce idle response latency.

### Paper 3: "Cryptographic Handshakes and Non-Repudiation in Volunteer Distribution Networks"
- **Authors:** Verma, S., & Patel, A. (International Journal of Distributed Systems, 2023)
- **Key Findings:** Unmonitored crowdsourced logistics suffer from an 8-12% discrepancy rate due to misdeliveries or inaccurate status reporting. Time-synchronized or single-use OTP handshakes between recipient and courier eliminate malicious or erroneous status transitions.
- **Takeaway for Our System:** Generating a 4-digit verification code visible exclusively to the claiming NGO ensures that a volunteer can only transition a batch to `Delivered` once physically present at the recipient shelter.

---

## 4. Comparative Feature Matrix & Gap Analysis

| Feature / Capability | Robin Hood Army | Feeding India | Olio / Too Good To Go | **Proposed FRS System** |
| :--- | :---: | :---: | :---: | :---: |
| **Centralized Web Platform** | ❌ (Social Media) | ⚠️ (Internal App) | ✅ | ✅ **Full-Stack Web App** |
| **Automated Role Management** | ❌ | ⚠️ | ⚠️ | ✅ **4 Dedicated Portals** |
| **AI Freshness & Shelf-Life Estimation** | ❌ | ❌ | ❌ | ✅ **ML Predictive Engine** |
| **Secure Dual OTP Handshake** | ❌ | ❌ | ❌ | ✅ **Cryptographic OTP Handshake** |
| **Crowdsourced Volunteer Network** | ✅ | ⚠️ (Staffed) | ❌ | ✅ **Open Volunteer Pool** |
| **Real-time Lifecycle State Machine** | ❌ | ⚠️ | ✅ | ✅ **Auto Sync Lifecycle** |
| **Open Source & Extensible** | ❌ | ❌ | ❌ | ✅ **Yes (CEUP301 / CHARUSAT)** |

---

## 5. Conclusion

Existing literature and industry solutions clearly indicate that while surplus food availability is abundant, the missing catalyst is an **automated, secure, and predictive coordination layer**. The Food Redistribution System uniquely bridges this gap by marrying role-based web architecture with machine learning freshness analysis and cryptographic delivery validation.
