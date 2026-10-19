# AVMLabs Camp — Diagnostic Rate Card & Health Camp Management Platform

A modern, high-performance web platform built for diagnostic laboratories, franchise partners, and healthcare camp organizers. **AVMLabs Camp** empowers teams to plan and register health checkup camps, dynamically explore diagnostic tests and packages, build customized patient profiles with real-time B2B/B2C margin analysis, and export professional branded reports.

---

## 🌟 Key Features

### 1. Health Camp Registration & Planning
- **Multi-Venue Support**: Optimized workflows for **Corporate Offices**, **Housing Societies**, **Exhibition Stalls**, and **Village Schools**.
- **Automated Preparation Countdown**: Dynamically calculates days to prepare based on target camp dates.
- **Instant WhatsApp & Clipboard Dispatch**: Formats comprehensive camp booking summaries ready for instant sharing with field coordinators and laboratory staff.

### 2. Dynamic Rate Card & Diagnostic Catalog
- **LPL & CRL Test Menus**: Instant access to 78+ Local Processing Laboratory (LPL) tests, 147+ Central Reference Laboratory (CRL) tests, and 68+ curated profiles.
- **Dynamic Excel Ingestion**: Backed by structured diagnostic data parsed from laboratory master menus (`CRL TEST MENU FINAL 07.10.2026 (KKK).xlsx`).
- **Granular Filtering & Search**: Instant filtering by department, methodology/technology, specimen/sample type (Serum, Whole Blood, Fluoride Plasma, etc.), and price bands (e.g., ₹50 or below, ₹51–₹100).

### 3. Smart Profile Builder & Cart
- **Intelligent Conflict & Overlap Prevention**: Proprietary package hierarchy (`AVM_TIER_ORDER`) that detects and blocks duplicate tests or smaller overlapping packages when comprehensive profiles are selected.
- **B2B vs B2C Margin Calculator**: Real-time breakdown of internal reagent/processing costs against recommended patient prices with dynamic profit margin percentages.
- **Customer View Toggle**: Safe presentation mode that hides B2B cost metrics when demonstrating packages directly to patients or corporate clients.
- **Persistent Selection**: Auto-saves active profile configurations in browser storage across sessions.

### 4. Export & Branded Printouts
- **Customer-Safe Printable PDF**: Letterhead-ready health profile view (`/print-profile`) formatted for high-resolution printing or PDF export.
- **Full Excel Export**: One-click download of selected profiles or entire test catalogs into formatted `.xlsx` spreadsheets for administrative audits.

### 5. Extended Lab Portals & Admin Dashboard
- **SARC Pricing Engine (`/sarc`)**: Transparent Services At Reagent Cost breakdown.
- **Central Reference Lab (`/crl`)**: Comprehensive catalog of specialized advanced diagnostics.
- **Franchise Hub (`/franchise`)**: Dedicated portal for B2B partners and lab collection center onboarding.
- **Admin Management Suite (`/admin`)**:
  - Test & Parameter management
  - Ready-made Profile and Package configuration
  - Historical pricing audits
  - Excel menu batch importer

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) |
| **UI Library** | [React](https://react.dev/) 19 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 & PostCSS |
| **Spreadsheet Engine** | [SheetJS (xlsx)](https://docs.sheetjs.com/) |
| **PDF & Canvas Export** | [jspdf](https://github.com/parallax/jsPDF) & [html2canvas-pro](https://github.com/niklasvh/html2canvas) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```text
camp-main/
├── app/
│   ├── admin/             # Laboratory admin console (tests, packages, pricing, import)
│   ├── crl/               # Central Reference Laboratory directory
│   ├── franchise/         # Franchise partner portal and onboarding
│   ├── login/             # Authentication gateway
│   ├── print-profile/     # Printable letterhead profile & report view
│   ├── sarc/              # Services At Reagent Cost (SARC) pricing engine
│   ├── globals.css        # Global CSS & Tailwind CSS v4 design tokens
│   ├── layout.js          # Root application layout
│   └── page.js            # Main Camp homepage & interactive profile builder
├── components/
│   ├── CampRegistrationSection.jsx # Camp booking form with WhatsApp generator
│   ├── CartDrawer.jsx              # Profile builder drawer with margin analysis
│   ├── Header.jsx                  # Navigation header with profile counter
│   ├── Hero.jsx                    # Multi-venue banner carousel with touch swipe
│   ├── RateListSection.jsx         # Test & profile rate card browser with filters
│   ├── TestDetailDrawer.jsx        # Test metadata, specimen & methodology drawer
│   └── ...                         # Shared UI components (Toast, Footer, FaqSection)
├── data/                  # Static laboratory datasets and price catalogs (JSON)
├── lib/                   # Business logic, calculations, package hierarchy & formatters
├── public/                # Static assets, camp banners, icons, and sample menus
├── scripts/               # Catalog generation scripts from raw Excel menus
├── next.config.mjs        # Next.js runtime configuration
├── package.json           # Project dependencies and npm scripts
└── vercel.json            # Deployment configuration for Vercel
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or later (v20+ recommended)
- **npm**: v9+ (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AVMLABS-Tech/Camp-Rate.git
   cd Camp-Rate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build & Production

To generate an optimized production bundle:

```bash
# Build the production application
npm run build

# Start the production server locally
npm run start
```

---

## 📄 License

Internal proprietary software developed for **AVMLabs**. All rights reserved.
