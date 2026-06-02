# Backend

This is the ASP.NET Core Web API for The Setup Rank. The production backend is
hosted on Azure App Service and is reached by the browser through a Cloudflare
Pages `/api/*` proxy.

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

## Production Deployment

### Services

The production deployment uses:

```txt
Frontend:       Cloudflare Pages
API proxy:      Cloudflare Pages Function at /api/*
Backend:        Azure App Service, Basic B1 plan
Database:       Azure SQL Database, free tier
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
