# Backend

This is the ASP.NET Core Web API for The Setup Rank. The production backend is
hosted on Azure App Service and is reached by the browser through a Cloudflare
Pages `/api/*` proxy.

## Production Deployment

### Services

The production deployment uses:

```txt
Frontend:       Cloudflare Pages
API proxy:      Cloudflare Pages Function at /api/*
Backend:        Azure App Service, Basic B1 plan
Database:       Azure SQL Database, Basic tier, 5 DTUs
Image storage:  Azure Blob Storage
Auth provider:  Google OAuth
Domain/DNS:     Cloudflare
```

The public domains are:

```txt
Frontend:        https://thesetuprank.com
Browser API URL: https://thesetuprank.com/api/*
Backend origin:  https://api.thesetuprank.com
```

The browser should normally call `/api/*` on `thesetuprank.com`. Cloudflare then
proxies those requests to the Azure App Service custom domain.

### Request Flow

Normal API requests:

```txt
Browser
  -> https://thesetuprank.com/api/*
  -> Cloudflare Pages Function
  -> https://api.thesetuprank.com/api/*
  -> Azure App Service
  -> Azure SQL Database / Azure Blob Storage
```

### Production Server

The backend runs on Azure App Service Basic B1: 1 vCPU, 1.75 GB memory,
10 GB remote storage, and up to 3 scale-out instances. Estimated cost is about
13.87 USD/month per instance.

### Production Database

The production database runs on Azure SQL Database Basic tier with 5 DTUs.
Backups use locally-redundant backup storage. Current estimated cost is about
5.39 USD/month, excluding other Azure resources.

### Backend CI/CD

Backend changes pushed to `main` are published by `.github/workflows/deploy-backend.yml`.
The workflow builds the ASP.NET Core project and deploys the publish output to
Azure App Service.

GitHub Actions authenticates to Azure with OIDC through a Microsoft Entra app
registration. This avoids storing a publish profile or long-lived Azure password
in GitHub. Required GitHub Actions secrets:

```txt
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
AZURE_WEBAPP_NAME
```

## Local SQL Server

This backend uses SQL Server through Entity Framework Core.

Start the local SQL Server container from the repository root:

```bash
docker compose -f backend/sql-docker-compose.yml up -d
```

Stop the container:

```bash
docker compose -f backend/sql-docker-compose.yml down
```

The compose file uses a named Docker volume, so stopping the container does not delete the database files.

Delete the local SQL Server data as well:

```bash
docker compose -f backend/sql-docker-compose.yml down -v
```

The local user-secrets connection string should point to:

```txt
Server=localhost,1433;Database=thesetuprank;User Id=sa;Password=Your_strong_password123;TrustServerCertificate=True;
```

If you change `MSSQL_SA_PASSWORD` in `sql-docker-compose.yml`, update the user-secrets connection string to match.

Run database migrations:

Currently, when the backend starts, it applies pending EF Core migrations
automatically.

To manually apply database migrations:

```bash
dotnet ef database update
```
