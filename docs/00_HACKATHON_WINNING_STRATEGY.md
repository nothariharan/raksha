# Build What Moves India — Hackathon Winning Strategy & Architectural Playbook

> **Event:** Build What Moves India (Presented by Varun Mayya in partnership with OpenAI)  
> **Submission Cutoff:** August 28, 2026, 8:00 PM IST (Hard deadline)  
> **Key Goal:** Pick ONE real citizen problem on an Indian public digital service and build a working, simpler, clearer, OpenAI/Codex-powered web prototype.

---

## 1. The Winning Meta-Strategy: "A UPI-Style Protocol" vs. "A Nicer Form"

To win this hackathon, we must separate two fundamentally different types of civic tech submissions:

| Category | Typical Submission | The Champion Winning Move (SetuID) |
|---|---|---|
| **Concept Framing** | **A UX Fix:** "We redesigned this one EPFO withdrawal form." | **A Protocol / Rail:** "We built the missing verification layer that 10 departments were independently hacking around." |
| **Systemic Impact** | Solves 1 department's symptom for 1 portal. | Solves the root-cause data fragmentation for all of Digital India. |
| **Analogy** | Building a prettier ATM machine. | Building UPI so banks don't have to build custom payment rails. |
| **Judges' Takeaway** | "Nice clean UI, good execution." | **"This completes the India Stack. This is foundational civic infrastructure."** |

---

## 2. Deconstructing the Hackathon DNA & Judging Ethos

### A. The "Ideas Over Code" & "Useful Beats Flashy" Rule
- **The Trap:** Spending 80% of time building heavy 3D visualizations (Three.js), complex distributed microservices, or full production auth pipelines.
- **The Reality:** Organizers explicitly state: *"Put your energy into the experience, not the plumbing... Crazy 3D and Three.js showpieces look impressive but don't actually help the end user. Useful beats flashy."*
- **The Winning Formula:** A clean, accessible, zero-friction interface (Next.js / Tailwind / Shadcn UI) that solves a real Indian citizen pain point in under 60 seconds of live user interaction.

### B. The 2-Minute Video Anatomy (The Make-or-Break Filter)
The judges evaluate hundreds of builds through a strict 2-minute video:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 2-MINUTE SUBMISSION VIDEO SCRIPT                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MINUTE 0:00 - 1:00 (Citizen Experience Walkthrough):                       │
│  • No preamble, no slides, no corporate buzzwords.                          │
│  • Hook: "Meet Ramesh, a 54-year-old teacher. His ₹4.8 Lakh EPF retirement  │
│    savings, his daughter's passport, and his farmer pension are all BLOCKED │
│    because on Aadhaar his name is 'Rajesh Kumar Sharma', on PAN it's        │
│    'Rajesh Sharma', and in EPFO it's 'Rajesh K. Sharma'."                   │
│  • The Action: Ramesh connects DigiLocker. In 3 seconds, SetuID resolves    │
│    the identity graph across 4 documents, proves 98% semantic equivalence,  │
│    and generates his official Notarized 'One & Same Person' Stamp Affidavit │
│    and EPFO Joint Declaration SOP 3.0 Dossier with zero guesswork.          │
│                                                                             │
│  MINUTE 1:00 - 2:00 (Engineering, Codex & The Protocol Narrative):          │
│  • The UPI Narrative: "UPI didn't win by building a prettier bank branch;   │
│    it won by establishing an open protocol for value transfer. SetuID is    │
│    the open protocol for Identity Equivalence in Digital India."            │
│  • Show the Code / API: Live call to `POST /v1/identity/reconcile` returning │
│    cryptographic Verifiable Credential tokens with Zod schema validation.   │
│  • Show how EPFO, Passport Seva, Income Tax, and Land Registries can plug   │
│    into SetuID with a single API call instead of building custom forms.     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### C. Strict Constraints Checklist
| Rule | What it Means for Us |
|---|---|
| **Codex / OpenAI Meaningful Involvement** | Not just a generic chatbot widget stuck in the corner. OpenAI is the core semantic reasoning engine driving phonetic normalization, initial expansion, and legal affidavit generation. |
| **No Live Gov API Interfacing** | Must design deterministic, rich mock backends (synthetic schemas with realistic Indian personas: Ramesh Kumar Sharma, Pooja Sharma/Iyer, K.S. Ramanathan). |
| **No Real PII / Aadhaar / OTPs** | Provide 1-click "Instant Demo Login" / "Load Profile" buttons so judges test it in 1 second. |
| **Web-Accessible Live Link** | Vercel hosted, mobile-responsive, zero login friction. |
| **Every Feature Demoed Must Work** | Zero "coming soon" placeholders. The complete flow (DigiLocker load -> Graph Resolve -> PDF generation -> API docs) is 100% interactive. |

---

## 3. High-Leverage Tech Stack Recommendations

```mermaid
graph LR
    subgraph "Frontend Layer"
        A[Next.js 15 App Router]
        B[Tailwind CSS & Shadcn UI]
        C[Framer Motion Interactive Graph]
    end
    
    subgraph "Reasoning & AI Layer"
        D[OpenAI GPT-4o / Codex API]
        E[Indic Phonetic Normalizer]
        F[Zod Structured JSON Schemas]
    end
    
    subgraph "Data & Artifact Generation"
        G[Mock DigiLocker Vault]
        H[@react-pdf/renderer Stamp Papers]
        I[REST API Gateway /v1/reconcile]
    end
    
    A --> D
    B --> G
    C --> D
    D --> E
    E --> F
    F --> H
    F --> I
```

---

## 4. Key Documentation Index

- 👑 [**`00_CHAMPION_PROBLEM_STATEMENT_SETU_ID.md`**](file:///C:/Users/HARIHARAN/Desktop/Scratchpad/BuildWHatMovesIndia/00_CHAMPION_PROBLEM_STATEMENT_SETU_ID.md): Complete technical specification, API payloads, and prompt engineering blueprints for SetuID.
- 📊 [**`00_MASTER_PROBLEM_STATEMENTS_MATRIX.md`**](file:///C:/Users/HARIHARAN/Desktop/Scratchpad/BuildWHatMovesIndia/00_MASTER_PROBLEM_STATEMENTS_MATRIX.md): 20-track comparative evaluation matrix with ratings and rankings.
- 🗂️ Tracks 01 through 20 deep-dive files in `BuildWHatMovesIndia/`.
