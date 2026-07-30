# Manutwin: Production Speed and Downtime Tracker

Manutwin is a web-based manufacturing telemetry platform designed for food processing plants in East Africa. The system provides floor operators with a touch-optimized interface to record production counts and line stoppages, while enabling supervisors to monitor real-time line velocity, receive automated alerts, and audit downtime metrics.

---

## System Features

1. Session Authentication (FR-1)
   Operators log into assigned workstation stations using a 4-digit numeric PIN. Session data persists locally to maintain station continuity.

2. Downtime Stoppage Logging (FR-2)
   High-contrast touch targets allow operators to record precise machine stoppage timestamps with low interaction latency.

3. Mandatory Reason Categorization (FR-3)
   Stoppage events require operators to classify downtime causes under standardized codes: POWER, MECHANICAL, JAM, or MAINTENANCE before resolving the event.

4. Production Output Entry (FR-4)
   Operators log physical unit counts at 30-minute intervals using a touchscreen-friendly numeric keypad interface. 

5. Real-Time Speed Monitoring (FR-5)
   The supervisor interface calculates production rates in units per minute, rendering live velocity trend charts and triggering visual warnings when speed drops exceed 10% of operational baselines.

6. Automated Alert Dispatch (FR-6)
   Continuous active stoppages trigger simulated urgent notification payloads to plant management when downtime duration thresholds are breached.

7. Aggregated Report Export (FR-7)
   Aggregated downtime statistics categorized by reason codes compile into downloadable PDF reports for management auditing.

8. Offline Operational Resilience (NFR-5)
   Local logs store safely inside browser IndexedDB storage during network disruptions, automatically synchronizing queued data with the cloud once connection returns.

9. Multilingual Support (NFR-4)
   Interface text supports real-time switching between English, Kiswahili, and Kinyarwanda.

---

## Technology Stack

* Framework: Next.js 14 (App Router)
* Language: TypeScript
* Styling: Tailwind CSS
* Visualization: Recharts
* Offline Storage: IndexedDB via idb-keyval
* Report Generation: jsPDF
* Deployment: Vercel

---

## Local Development Setup

Follow these exact steps to run the project locally on your machine.

### Prerequisites

Ensure Node.js version 18.0.0 or higher is installed on your environment.

Check your current version:
node -v

### Installation

1. Clone the repository:
git clone <YOUR_PUBLIC_GITHUB_REPO_URL>

2. Navigate into the project directory:
cd Manutwin

3. Install project dependencies:
npm install

4. Launch the local development server:
npm run dev

5. Access the application in your browser:
Open http://localhost:3000 to view the station launcher portal.

---

## Project Directory Architecture

* app/ - Next.js App Router layout, pages, and API handlers.
* components/ - Modular UI controls divided into shared, operator, and supervisor views.
* lib/ - Core calculation services, i18n dictionaries, offline sync queues, and PDF exporters.
* public/ - Static icons and Web App manifest configuration.

---

## Deployment Information

The live production instance is deployed on Vercel and accessible publicly across web browsers and mobile devices.

Public URL: <YOUR_VERCEL_DEPLOYMENT_URL>

---

## Author

Brian Mahui
African Leadership University