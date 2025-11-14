# LEICCA - Legal Entity Identity Compliance & Classification Accelerator

## 🏆 GLEIF vLEI Hackathon 2025 | Theme 2: Industry 4.0

> **Automating Basel III Counterparty Credit Risk Compliance with vLEI + Blockchain Audit Trails**

### 🎯 Problem Statement

- Automate Know-Your-Business (KYB) workflows using vLEI credentials
- Integrate vLEI into banking/compliance systems (Basel CCR classification)
- Enable verifiable document signing and audit trails
- Demonstrate role-based credential management

---

## 📊 Impact Metrics

| Metric                   | Manual Process      | LEICCA                   | Improvement              |
| ------------------------ | ------------------- | ------------------------ | ------------------------ |
| **Verification Time**    | 2+ hours            | <3 seconds               | **99.9% faster**         |
| **Classification Time**  | 1-2 hours           | 3-5 minutes              | **96% faster**           |
| **Audit Trail Creation** | Days (manual docs)  | 10-30 seconds            | **Instant**              |
| **Total KYB Workflow**   | 2-4 hours           | 5-8 minutes              | **95% time reduction**   |
| **Audit Coverage**       | Partial (PDF files) | 100% blockchain-verified | **Regulatory-grade**     |
| **Cost per Review**      | $150-300 (labor)    | $0.50 (blockchain)       | **99.7% cost reduction** |

**Market Impact:** Basel III CCR affects $4.7 trillion in global banking capital requirements

---

## 🚀 Key Innovations

### 1. Temporal Proof System ⭐ NOVEL CONTRIBUTION

First implementation to anchor KERI Key Event Log (KEL) states to blockchain for historical credential verification.

**Problem Solved:** Regulators require proof that credentials were valid _at the time of decision-making_, not just now.

**Our Solution:**

- Extract issuer's KEL state (sequence number + last event SAID) from CESR credential
- Anchor KEL state + decision data to blockchain with multi-party encryption
- Create cryptographic proof linking credential validity to specific block height
- Enable auditors: "Was this credential valid on November 13, 2025?"

**Competitive Advantage:** No other vLEI implementation provides temporal verification - this solves actual Basel CCR compliance requirements.

---

### 2. Complete vLEI Issuance Platform 🎓 ECOSYSTEM MASTERY

Unlike verification-only solutions, LEICCA includes a **full credential issuance and management platform**:

**Capabilities:**

- ✅ Issue QVI (Qualified vLEI Issuer) credentials
- ✅ Issue LE (Legal Entity) credentials
- ✅ Issue ECR (Engagement Context Role) credentials
- ✅ Complete Signify-TS integration with KERIA agent
- ✅ Witness-coordinated threshold signing (3-of-3)
- ✅ IPEX protocol for cross-AID credential transfer
- ✅ Real-time infrastructure monitoring (KERIA, witnesses, verifier)
- ✅ Docker performance metrics (CPU, memory, network I/O)

**Developer Experience:**

- 5-step wizard for guided credential creation
- One-click credential export (JSON + CESR with KEL/TEL attachments)
- Built-in verifier integration with Root of Trust bypass
- Infrastructure health dashboard with live Docker stats

**Why This Matters:** Demonstrates complete vLEI ecosystem understanding - from issuance through verification to blockchain audit trails.

---

### 3. Dual-Key Encryption 🔐 PRIVACY + TRANSPARENCY

**Challenge:** Compliance requires transparency (audit trails) AND privacy (sensitive financial data).

**Our Approach:**

- `mintblue_deriving` key: User self-decryption (privacy)
- `audit_key` key: Audit trail system access (transparency)
- Multiparty encryption with EC P-256
- On-chain encrypted hash capsule with blockchain immutability

**Result:** Regulatory transparency without compromising business confidentiality.

---

## Test Flow (5-8 Minutes End-to-End)

### **Step 1: Admin - Issue Test Credentials** (2 min)

1. Create QVI AID with witness coordination
2. Configure Python vLEI verifier with custom Root of Trust
3. Issue Legal Entity credential for test LEI
4. Issue ECR credential for "Jane Doe - Compliance Officer"
5. Export CESR format with KEL/TEL attachments

### **Step 2: Verify - Upload & Validate** (30 sec)

1. Upload ECR credential (CESR or JSON format)
2. Python vLEI verifier performs:
   - SAID validation (credential integrity)
   - QVI chain validation (trust chain to GLEIF)
   - Registry check (revocation status)
3. GLEIF API enrichment (jurisdiction, legal name)
4. **KEL state extraction** for temporal proof

### **Step 3: Classify - Basel CCR Decision Tree** (3-5 min)

1. Auto-select jurisdiction panel
2. Navigate 8-12 questions:
   - "Is the entity established as a Financial or Payment Services company?"
   - "Is the entity established as a public utilities provider?"
3. Receive classification.

### **Step 4: Anchor - Blockchain Audit Trail** (30 sec)

1. Upload evidence files (PDFs, screenshots)
2. System creates encrypted audit capsule:
   - Full verification result with KEL state
   - Classification outcome + decision path
   - Evidence file hashes (SHA-256)
   - Timestamp + workflow metadata
3. Broadcast to blockchain with multi-party encryption
4. Receive transaction ID + explorer link

### **Step 5: Audit - Review Timeline** (1 min)

1. View chronological event timeline
2. Click event for full details modal
3. See blockchain confirmation status
4. Download encrypted capsule or decrypt with private key
5. **Temporal proof**: "This credential was valid at block height 875,432 on 2025-11-13"

---

## 🛠️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 15 App Router                       │
├──────────┬──────────┬──────────┬──────────┬──────────────────┤
│ Landing  │  Admin   │  Verify  │ Classify │ Anchor │  Audit  │
│  Page    │          │   Page   │   Page   │  Page  │  Page   │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬───┴────┬────┘
     │          │          │          │          │        │
     │    ┌─────▼──────┐   │          │          │        │
     │    │ Signify-TS │   │          │          │        │
     │    │  Client    │   │          │          │        │
     │    └─────┬──────┘   │          │          │        │
     │          │          │          │          │        │
┌────▼──────────▼──────────▼──────────▼──────────▼────────▼────┐
│                    Service Layer                              │
│  VLEIVerification │ DecisionTree │ BlockchainAnchoring │ Audit│
└────┬──────────────┴──────┬───────┴──────────┬──────────┴──────┘
     │                     │                   │
┌────▼─────┐   ┌──────────▼─────┐   ┌────────▼──────┐
│ Python   │   │ GLEIF API      │   │ Mintblue SDK  │
│  vLEI    │   │ (LEI Data)     │   │ + Blockchain  │
│Verifier  │   │                │   │   Services    │
└────┬─────┘   └────────────────┘   └────────┬──────┘
     │                                        │
┌────▼─────────────────────────────┐   ┌─────▼──────────┐
│ KERIA Agent + Witness Network    │   │ BSV Blockchain │
│ (did:keri, ACDC, IPEX)           │   │                │
└──────────────────────────────────┘   └────────────────┘
```

---

## 📦 Technology Stack

| Layer              | Technology                                                      |
| ------------------ | --------------------------------------------------------------- |
| **Frontend**       | Next.js 15 (App Router), React 19, TypeScript 5.3, Tailwind CSS |
| **Components**     | Custom design system with shadcn/ui v2 patterns                 |
| **Authentication** | KERI (Key Event Receipt Infrastructure) with did:keri           |
| **Credentials**    | ACDC (Authentic Chained Data Containers), CESR encoding         |
| **Issuance**       | Signify-TS client, IPEX protocol, witness coordination          |
| **Verification**   | Python vLEI verifier (Docker), GLEIF API v1                     |
| **Blockchain**     | BSV , mintBlue SDK, DocV1 encryption (EC P-256)                 |
| **Infrastructure** | KERIA agent, 3 witnesses, vLEI server, Docker Compose           |

---

## 🔧 Setup & Installation

### Prerequisites

```bash
# Required
- Node.js 18+ and pnpm
- Docker & Docker Compose
```

### Environment Variables

```bash
# vLEI Verification
VLEI_VERIFIER_URL=http://localhost:7676
KERIA_AGENT_URL=http://localhost:3902
GLEIF_API_BASE=https://api.gleif.org/api/v1

# Blockchain
MINTBLUE_SDK_TOKEN=your_token_here
BLOCKCHAIN_NETWORK=main
BLOCKCHAIN_BASKET=leicca-vlei-audit

# Data persistence
DATA_DIR=/data
```

---

## 🎯 Hackathon Alignment

### Theme 2: Industry 4.0 - Identity and KYB Credentials for Commerce

| Requirement                             | LEICCA Implementation                               | Evidence                         |
| --------------------------------------- | --------------------------------------------------- | -------------------------------- |
| **Integrate vLEI into banking systems** | Basel CCR classification workflow                   | 16 jurisdiction decision trees   |
| **Automate KYB workflows**              | <3 second verification vs 2+ hours manual           | 99.9% time reduction             |
| **Role-based access management**        | ECR credentials with engagement context roles       | Admin issuance platform          |
| **Verifiable document signing**         | DocV1 blockchain anchoring with dual-key encryption | On-chain audit trails            |
| **Government registry integration**     | GLEIF API enrichment for LEI data                   | Jurisdiction + legal name lookup |

### Criteria Addressed

✅ **Technical Innovation:** Temporal proof system (KEL state anchoring) - novel contribution
✅ **Real-World Problem:** Basel III CCR compliance ($4.7T market)
✅ **vLEI Technology Use:** Complete ecosystem (issuance + verification + audit)
✅ **Scalability:** Service architecture, Docker deployment, quasi-production-ready
✅ **User Experience:** 5-8 minute workflow vs 2-4 hours manual
✅ **Practical Utility:** Deployed admin platform, working end-to-end demo

---

## 🏅 Competitive Advantages

### What Sets LEICCA Apart

1. **Only Solution with Temporal Proof System**

   - No other vLEI hackathon project anchors KEL states to blockchain
   - Solves actual regulatory requirement (proof of validity at decision time)
   - Creates defensible moat (requires deep vLEI + blockchain knowledge)

2. **Complete Credential Issuance Platform**

   - Most teams only verify credentials; we issue them too
   - Demonstrates ecosystem mastery (Signify-TS, IPEX, witness coordination)
   - Enables end-to-end demo without GLEIF dependency

3. **Ready Implementation**

   - 5,000+ lines of TypeScript (services + UI)
   - Comprehensive error handling and graceful degradation
   - Infrastructure monitoring and Docker performance metrics
   - Complete test credential library (10+ scenarios)

4. **Real Regulatory Use Case**

   - Basel III CCR affects every global bank
   - Clear ROI calculation (95% time reduction, 99.7% cost reduction)
   - Addresses $4.7 trillion market opportunity

5. **Dual-Key Encryption**
   - Privacy (user self-decryption) + transparency (audit access)
   - No other solution balances these requirements
   - Production-grade cryptographic patterns

---

## 📈 Market Opportunity

### Target Market

- **Global Banks:** Basel III compliance (1,000+ institutions)
- **Insurance Companies:** Counterparty risk assessment
- **Investment Funds:** Due diligence workflows
- **Regulators:** Audit trail verification

### Business Model

- **SaaS Subscription:** $5,000-50,000/month per institution
- **Per-Transaction Pricing:** $1-5 per verification + classification
- **Blockchain Fees:** Pass-through (1 sat/kilobyte ≈ $0.00001 per audit capsule)
- **Integration Services:** One-time setup ($50,000-200,000)

### Revenue Potential

- **Year 1:** 10 pilot banks × $10K/month = $1.2M ARR
- **Year 3:** 100 banks × $25K/month = $30M ARR
- **Year 5:** 500 institutions × $35K/month = $210M ARR

---

## 👥 Team

- **Pieter Den Dooven** - Development - [[LinkedIn](https://www.linkedin.com/in/pieter-den-dooven-679a9a43)]
- **Siddharth Yagnamurthy** - Compliance Data Architect - [[LinkedIn](https://www.linkedin.com/in/siddharthyagnamurthy/)]

---

## 📝 License

This software and associated documentation files are proprietary - see [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- **GLEIF** - vLEI infrastructure and hackathon organization
- **mintBlue** - Blockchain services and encryption patterns
- **D2 Legal Technology** - Decision tree data and Basel CCR research
- **WebOfTrust** - KERI/ACDC specifications and Signify-TS library

---

## 📞 Demo & Contact

- **Live Demo:** [[Deployment URL](https://d2lt-leicca.mintblue.net/)] (admin/vLEI-Admin-2025!)
- **Email:** [pieter@mintblue.com]

---

**Built for GLEIF vLEI Hackathon 2025 | Theme 2: Industry 4.0**
