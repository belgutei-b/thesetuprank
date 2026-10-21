# Backend

This is the ASP.NET Core Web API for The Setup Rank. It uses Entity Framework
Core with a MySQL database, Google OAuth for sign-in, and S3 for images.

The project is being migrated from Azure to AWS on the `aws-migration` branch.
This README describes the AWS setup. See [Migration Status](#migration-status)
for what is done and what is left. Until the cutover, the live site still runs
on Azure from `main`.

## Architecture

Everything runs on a single EC2 instance: nginx serves the React frontend and
proxies `/api/*` to the .NET backend, and MySQL runs on the same machine.
Cloudflare sits in front for DNS, TLS, and caching static files.

```txt
Browser
  -> https://thesetuprank.com          (Cloudflare: DNS, TLS, CDN cache)
  -> EC2 Elastic IP :443
     nginx
       /api/*  -> Kestrel 127.0.0.1:5000 (ASP.NET Core)
                    -> MySQL 127.0.0.1:3306 (data on EBS volume /data)
                    -> S3 (via IAM role)
       /*      -> /var/www/thesetuprank (React build)

Images: browser loads them directly from S3 using presigned URLs
```

```txt
DNS / TLS / CDN:  Cloudflare
Server:           AWS EC2 t4g.micro (arm64), Amazon Linux 2023, ap-southeast-2
Web server:       nginx (static frontend + reverse proxy)
Backend:          ASP.NET Core (.NET 10), systemd service
Database:         MySQL 8.4 on the same instance, data on a dedicated EBS volume
Image storage:    AWS S3, private bucket, presigned URLs
Auth provider:    Google OAuth
CI/CD:            GitHub Actions, deploys over SSH
```

Frontend and API share one origin (`thesetuprank.com`), so the auth cookie works
without CORS or a separate proxy.

## Production Server

### Instance

- `t4g.micro` (2 vCPU, 1 GB RAM, arm64) with a 2 GB swap file. Resize to
  `t4g.small` if memory runs low (stop, change instance type, start; the EBS
  volumes and Elastic IP stay attached).
- An Elastic IP so the address doesn't change when the instance restarts.
- The EBS data volume must be in the same Availability Zone as the instance.

### File Layout

```txt
/opt/thesetuprank/backend/      published backend (self-contained linux-arm64)
/var/www/thesetuprank/          frontend build (contents of frontend/build/client)
/etc/thesetuprank/backend.env   production config and secrets (root only, chmod 600)
/etc/ssl/cloudflare/            Cloudflare Origin CA certificate and key
/data/                          dedicated EBS volume
/data/mysql/                    MySQL data directory
/data/keys/                     ASP.NET Core Data Protection keys
```

### Backend Service

The backend runs as a systemd service under its own `thesetuprank` user.

`/etc/systemd/system/thesetuprank-backend.service`:

```ini
[Unit]
Description=The Setup Rank backend
After=network.target mysqld.service

[Service]
User=thesetuprank
WorkingDirectory=/opt/thesetuprank/backend
ExecStart=/opt/thesetuprank/backend/backend
EnvironmentFile=/etc/thesetuprank/backend.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`WorkingDirectory` matters because the app serves `wwwroot/openapi.yaml` with a
relative path.

### Configuration

Production config comes from environment variables in
`/etc/thesetuprank/backend.env`. ASP.NET Core maps `__` to `:`, so
`Jwt__Key` becomes `Jwt:Key`.

```txt
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://127.0.0.1:5000
ConnectionStrings__DefaultConnection=server=127.0.0.1;port=3306;database=thesetuprank;user=thesetuprank;password=...
Jwt__Key=...
Authentication__Google__ClientId=...
Authentication__Google__ClientSecret=...
AWS__Region=ap-southeast-2
S3__BucketName=thesetuprank-bucket
```

There are no AWS access keys on the server. The instance has an IAM role, and
the AWS SDK picks up its credentials automatically.

### nginx

```nginx
server {
    listen 443 ssl;
    server_name thesetuprank.com;
    ssl_certificate     /etc/ssl/cloudflare/origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin.key;

    root /var/www/thesetuprank;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20m;            # image uploads
    }

    location /assets/ {                      # hashed Vite files, safe to cache forever
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        try_files $uri /index.html;          # SPA fallback for client-side routes
    }
}
```

### DNS and TLS (Cloudflare)

- `thesetuprank.com`: `A` record to the Elastic IP, proxied.
- `www.thesetuprank.com`: proxied, redirects to `thesetuprank.com`.
- SSL/TLS mode: **Full (strict)**, with "Always Use HTTPS" on.
- nginx uses a Cloudflare Origin CA certificate (free, 15-year validity, no
  renewal job needed).
- Cloudflare caches JS, CSS, and image files at the edge. Only `index.html` and
  API requests reach the instance.

Google OAuth redirect URI: `https://thesetuprank.com/api/signin-google`.

### Security Group

```txt
443   Cloudflare IP ranges only (https://www.cloudflare.com/ips/)
22    open, SSH key authentication only (password and root login disabled)
```

Nothing else is open. Port 80 isn't needed because Cloudflare redirects HTTP to
HTTPS. Port 3306 is never opened, and MySQL listens on `127.0.0.1` only.

Port 22 can't be limited to one IP because GitHub Actions runners don't have
fixed addresses.

### Server Access

Cloudflare only proxies HTTP, so SSH goes straight to the Elastic IP:

```bash
ssh -i ~/.ssh/thesetuprank.pem ec2-user@<elastic-ip>
```

## Production Database

MySQL 8.4 runs on the EC2 instance, with its data directory on a dedicated EBS
volume (gp3, 10 GB) mounted at `/data`.

Why not Amazon RDS: the expected traffic is small (up to 10-15 concurrent
requests), and the smallest RDS instance costs more per month than this whole
server. Keeping the data on its own volume means it survives if the instance is
replaced, and the volume can be snapshotted and resized on its own. RDS is the
next step if the site ever needs high availability or the maintenance stops
being worth the savings.

Because the database is self-hosted, these are handled manually:

- **Backups**
  - Daily EBS snapshots of the data volume with Amazon Data Lifecycle Manager,
    keeping the last 7.
  - A nightly `mysqldump`, compressed and uploaded to a separate S3 bucket
    (`thesetuprank-backups`), with a lifecycle rule that deletes dumps after
    30 days.
- **Security**: `bind-address = 127.0.0.1`, no port 3306 in the security group,
  and a dedicated `thesetuprank` MySQL user with access to the `thesetuprank`
  database only.
- **Memory**: `innodb_buffer_pool_size` kept small (128-256 MB) and
  `performance_schema` turned off to fit in 1 GB of RAM.
- **Updates**: OS and MySQL updates are applied manually with `dnf`.

The AWS database started empty. Data from the Azure SQL database was not
migrated.

## Image Storage (S3)

Images are stored in a private S3 bucket (`thesetuprank-bucket`) with Block
Public Access on.

Upload flow:

```txt
Browser --multipart--> POST /api/setups
  -> backend validates, resizes, and compresses the image
  -> backend uploads it to S3 (PutObject)
  -> the S3 object key is saved in the database
```

Serving flow:

```txt
GET /api/... -> backend creates a presigned GET URL for each image key
             -> browser loads the image directly from S3
```

- The database stores the S3 object key, not a URL, because presigned URLs expire.
- Presigned URLs are short-lived (about 1 hour). Signing them with a fixed
  expiry window (for example, rounded to the hour) returns the same URL for a
  while, so browsers can cache the images.
- The bucket doesn't need a CORS rule: uploads go through the backend, and
  `<img>` tags don't need CORS.
- The instance's IAM role allows `s3:PutObject`, `s3:GetObject`, and
  `s3:DeleteObject` on `thesetuprank-bucket`, and `s3:PutObject` on
  `thesetuprank-backups`.

## Deployment (CI/CD)

Pushing to `main` runs a GitHub Actions workflow that builds both apps and
deploys them over SSH.

```txt
1. dotnet publish backend/backend.csproj -c Release -r linux-arm64 --self-contained
2. npm ci && npm run build   (in frontend/, output in frontend/build/client)
3. rsync backend publish output  -> /opt/thesetuprank/backend/
4. rsync frontend/build/client/  -> /var/www/thesetuprank/
5. ssh: sudo systemctl restart thesetuprank-backend
```

The backend is published as self-contained, so the server doesn't need the .NET
runtime installed. EF Core migrations run automatically when the service starts.

The workflow connects as a `deploy` user whose `sudo` access is limited to
restarting the backend service.

Required GitHub Actions secrets:

```txt
EC2_HOST          Elastic IP of the instance
EC2_SSH_KEY       private key for the deploy user
EC2_KNOWN_HOSTS   the server's host key, so the workflow can verify it
```

## Estimated Cost

Rough monthly cost in ap-southeast-2. Check the AWS Pricing Calculator for
current prices.

```txt
EC2 t4g.micro                         ~8 USD
Public IPv4 address (Elastic IP)      ~3.65 USD
EBS gp3 (8 GB root + 10 GB data)      ~2 USD
Snapshots, S3, data transfer          ~1 USD at current traffic
Total                                 ~13-15 USD/month
```

Moving to `t4g.small` adds about 8 USD/month.

## Migration Status

Done:

- [x] Switch EF Core from SQL Server to MySQL (`MySql.EntityFrameworkCore`)
- [x] Reset migrations to a single MySQL `InitialCreate`
- [x] Remove the local SQL Server Docker setup
- [x] Connect to S3 from the backend (`/api/dev/s3-test`, development only)

Code changes:

- [ ] Rewrite image upload in `SetupEndpoints.cs` for S3 (replace Azure SAS)
- [ ] Store S3 object keys instead of image URLs, and return presigned URLs
- [ ] Remove the `Azure.Storage.Blobs` package and `Azure:*` config
- [ ] Change the Data Protection keys path in `Program.cs` from
      `/home/DataProtection-Keys` to `/data/keys`
- [ ] Remove `App:PublicHost` handling if nginx passes the host through correctly
- [ ] Remove `frontend/functions/` (Cloudflare Pages proxy)

Infrastructure:

- [ ] EC2 instance, Elastic IP, IAM role, and security group
- [ ] EBS data volume mounted at `/data`
- [ ] MySQL, nginx, systemd service, and the config file
- [ ] Cloudflare Origin CA certificate
- [ ] Backups: Data Lifecycle Manager policy and nightly `mysqldump`
- [ ] GitHub Actions SSH deploy workflow

Cutover:

- [ ] Delete the Azure workflows (`deploy-backend.yml`,
      `main_setuprank-backend.yml`) before merging into `main`
- [ ] Point `thesetuprank.com` at the Elastic IP and remove the Cloudflare
      Pages custom domain
- [ ] After about a week, delete the Azure resources (App Service, Azure SQL,
      Blob Storage) and the Cloudflare Pages project

## Local Development

### Database (MySQL)

Locally, MySQL 8.4 runs through Homebrew.

Install and start MySQL:

```bash
brew install mysql@8.4
brew services start mysql@8.4
```

`mysql@8.4` is keg-only, so add `/opt/homebrew/opt/mysql@8.4/bin` to your
`PATH` to use the `mysql` command.

Create the database and an app user (run `mysql -u root`):

```sql
CREATE DATABASE thesetuprank CHARACTER SET utf8mb4;
CREATE USER 'thesetuprank'@'localhost' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON thesetuprank.* TO 'thesetuprank'@'localhost';
```

Store the connection string in user-secrets (run from `backend/`):

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "server=localhost;port=3306;database=thesetuprank;user=thesetuprank;password=<password>"
```

Stop MySQL:

```bash
brew services stop mysql@8.4
```

### S3

Locally, the backend uses the `thesetuprank` AWS CLI profile (set in
`appsettings.Development.json`). Sign in before running the backend:

```bash
aws login --profile thesetuprank
```

### Migrations

When the backend starts, it applies pending EF Core migrations automatically.

To manually apply migrations:

```bash
dotnet ef database update
```

To add a new migration after changing a model:

```bash
dotnet ef migrations add MigrationName
```

The migration history was reset when the database moved from SQL Server to
MySQL. `Migrations/` now starts from a single `InitialCreate` migration
generated for MySQL.
