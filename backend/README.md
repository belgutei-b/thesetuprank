# Backend

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

Currently, when the backend starts, it applies the pending EF core migrations autmoatically.


To manually apply database migrations:

```bash
dotnet ef database update
```

### Deployment

Backend is deployend on Azure App Services with
B1 service plan (1 Core, 1.75GB RAM, 10GB Storage).
