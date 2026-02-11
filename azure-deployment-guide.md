# Azure Deployment Guide

## Prerequisites
- Azure subscription with permissions to create Resource Group, Storage Account, App Service, Static Web App.
- Azure CLI logged in (`az login`).
- Publish profile for the Web App (for GitHub secret `AZURE_WEBAPP_PUBLISH_PROFILE`).

## Resource Layout (per PDF)
- Resource Group: choose your name/location (e.g., `rg-feedback`).
- Storage Account: Standard LRS, table name `Users`.
- App Service: Windows, .NET 7, F1 free tier.
- Static Web App: Free tier for Angular frontend (if using Azure SWA instead of Vercel).

## Step-by-Step (Portal)
1) **Create Resource Group**: Azure Portal → Resource groups → Create → Region (e.g., West Europe).
2) **Create Storage Account**: Storage accounts → Create → Standard / LRS → Networking: public endpoints → Advance defaults → Review + create. Note the account name.
3) **Create Table**: Open the storage account → Tables → +Table → name `Users`.
4) **Get Connection String**: Storage account → Access keys → Connection string → copy.
5) **Create App Service Plan**: App Services → Create → Hosting plan F1 (Windows).
6) **Create Web App**: App Services → Create → Runtime stack `.NET 8 (LTS)` (set to match the project) → Windows → choose the plan.
7) **Configure App Settings**: Web App → Configuration → Application settings → `StorageConnection=<connection-string>` → Save → Restart.
8) **Deploy Backend**: Use GitHub Actions (backend-api) or manual publish. Confirm https://<app>.azurewebsites.net/swagger loads.
9) **(Optional) Static Web App**: Static Web Apps → Create → build presets Angular. Set API URL in your frontend (environment prod) to the Web App URL.

## Vercel Frontend (if used)
- Set Vercel env `NG_APP_API_BASE=https://<app>.azurewebsites.net/api`.
- Deploy via GitHub Action `frontend-vercel` or Vercel dashboard.

## Verification Checklist
- Swagger opens on the Web App URL.
- POST /api/users adds a row; GET /api/users returns data (verify in Table Storage → Data → Users).
- CORS allows browser calls (AllowAll policy in Program.cs).
- Frontend calls succeed (Network tab 200s against Azure API).

## Troubleshooting
- 403/401 from storage: re-check `StorageConnection` value and restart Web App.
- 500 on API: check App Service → Logs → Application logs. Ensure table `Users` exists.
- Swagger unreachable: confirm Web App is running and not stopped; verify correct URL.
- CORS blocked: ensure hitting Web App URL (not localhost) from deployed frontend; AllowAll is enabled in code.
- Vercel build fails: confirm Node 18, run `npm ci && npm run build` locally to reproduce.

## Cost Tips
- Use F1 for Web App and Free for Static Web App; scale down when idle.
- Storage: keep Standard LRS; delete unused tables; enable lifecycle management for blobs if added later.
- Turn off always-on for free tier; stop Web App when not needed.
