# Vendor MDM Portal

This is the **Vendor Master Data Management** application frontend - built on the core platform.

## Application Architecture

This application leverages the core platform services:
- **Core Platform APIs**: Authentication, attachments, common services
- **Core Artifact Processors**: Email notifications, file processing

## Technology Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Azure Static Web Apps** for hosting

## Local Development

```bash
npm install
npm run dev
```

Access at: `http://localhost:5173`

## Configuration

Create `.env.local` from `.env.example` and configure:
- API endpoint URLs
- Feature flags
- Environment-specific settings
Deployment check Wed Dec 10 21:12:54 +04 2025
