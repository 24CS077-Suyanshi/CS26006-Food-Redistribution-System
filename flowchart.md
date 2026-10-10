# Food Redistribution System (FRS) — System Architecture & Process Flow

```mermaid
flowchart TD
    %% Donor Pipeline
    subgraph Donor_Pipeline["1. Donor Pipeline"]
        D1[Donor Lists Surplus Food] --> D2[Food Listing: Title, Quantity, Storage, Expiry]
        D2 --> D3[AI Freshness & Shelf-Life Check]
        D3 --> D4{Safe & Fresh?}
        D4 -- Yes --> D5[Broadcast Food to NGOs]
        D4 -- No --> D6[Notification: Listing Rejected]
    end

    %% NGO Pipeline
    subgraph NGO_Pipeline["2. NGO / Recipient Pipeline"]
        N1[NGO Browses Available Food] --> N2[Submit Allocation Request]
        N2 --> N3{Stock Available?}
        N3 -- Yes --> N4[Allocation Confirmed]
        N4 --> N5[Receive Secure Pickup OTP]
        N3 -- No --> N6[Item Unavailable Alert]
    end

    %% Volunteer Pipeline
    subgraph Volunteer_Pipeline["3. Volunteer Logistics Pipeline"]
        V1[Volunteer Signup & Verification] --> V2[Receive Delivery Assignment]
        V2 --> V3[Pickup from Donor Location]
        V3 --> V4[Execute Secure OTP Handshake]
        V4 --> V5[Deliver to NGO Location]
        V5 --> V6[Confirm Delivery & Mark Completed]
    end

    %% Admin Pipeline
    subgraph Admin_Control["4. Administrative Control"]
        A1[Verify NGOs & Volunteers]
        A2[Manage Activity Audits & Logs]
        A3[CO2 Saved & Meals Impact Analytics]
    end

    D5 --> N1
    N5 --> V3
```

### Cross-Functional Process Pipelines:

1. **Donor Pipeline**:
   - `Donor Lists Surplus` $\rightarrow$ `Surplus Food Listing (Description, Quantity, Expiry)` $\rightarrow$ `AI Freshness & Shelf-Life Check` $\rightarrow$ Decision `Safe & Fresh?`
   - **If Yes:** `Broadcast Food to NGOs`
   - **If No:** `Donor Notification & Listing Rejection`

2. **NGO / Recipient Pipeline**:
   - `NGO Discovers Broadcasted Items` $\rightarrow$ `Browse Food Database & View Details` $\rightarrow$ `Submit Allocation Request` $\rightarrow$ Decision `Inventory Availability?`
   - **If Yes:** `Notify NGO of Allocation Confirmation` $\rightarrow$ `Receive Secure OTP for Pickup`
   - **If No:** `Notification: Item Unavailable`

3. **Volunteer Logistics Pipeline**:
   - `Volunteer Signup & Verification` $\rightarrow$ `Receive Delivery Assignment` $\rightarrow$ `Arrive at Donor Location for Pickup` $\rightarrow$ `Execute Secure OTP Handshake` $\rightarrow$ `Deliver to NGO Destination` $\rightarrow$ `Confirm Delivery & Status Update`

4. **Administrative Control**:
   - `Volunteer & NGO Verification Dashboard` $\rightarrow$ `Comprehensive Activity Audits` $\rightarrow$ `Environmental Impact CO2 Analytics Reporting`

5. **Technology Stack**:
   - **Frontend**: React (Vite, Tailwind CSS, Lucide Icons)
   - **Backend**: Python Flask REST API & Gateway
   - **Persistence**: MySQL Relational Database & Real-time Persistence

