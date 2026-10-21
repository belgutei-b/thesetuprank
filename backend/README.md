# Backend

This is the ASP.NET Core Web API for The Setup Rank. It uses Entity Framework
Core with a MySQL database, Google OAuth for sign-in, and S3 + CloudFront for
images. It runs on AWS at https://thesetuprank.com.

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
                    -> S3 (uploads, via IAM role)
       /*      -> /var/www/thesetuprank (React build)

Images: browser -> CloudFront -> private S3 bucket (Origin Access Control)
```

```txt
DNS / TLS / CDN:  Cloudflare
Server:           AWS EC2 t4g.micro (arm64), Amazon Linux 2023, ap-southeast-2
Web server:       nginx (static frontend + reverse proxy)
Backend:          ASP.NET Core (.NET 10), systemd service
Database:         MySQL 8.4 on the same instance, data on a dedicated EBS volume
Image storage:    private S3 bucket, served through CloudFront
Auth provider:    Google OAuth
Deploys:          manual, deploy.sh on the server (no CI/CD)
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
~/rate-setup/                   git clone of the repo, used for building
/opt/thesetuprank/backend/      published backend
/var/www/thesetuprank/          frontend build (contents of frontend/build/client)
/etc/thesetuprank/backend.env   production config and secrets (root only, chmod 600)
/etc/ssl/cloudflare/            Cloudflare Origin CA certificate and key
/data/                          dedicated EBS volume
/data/mysql/                    MySQL data directory
/data/keys/                     ASP.NET Core Data Protection keys
```

### Backend Service

The backend runs as a systemd service under its own `thesetuprank` user, which
can't log in and has no `sudo`.

`/etc/systemd/system/thesetuprank-backend.service`:

```ini
[Unit]
Description=The Setup Rank backend
After=network.target mysqld.service
Requires=mysqld.service

[Service]
User=thesetuprank
WorkingDirectory=/opt/thesetuprank/backend
ExecStart=/usr/bin/dotnet /opt/thesetuprank/backend/backend.dll
EnvironmentFile=/etc/thesetuprank/backend.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Logs: `sudo journalctl -u thesetuprank-backend -f`.

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
CloudFront__BaseUrl=https://...
```

The AWS region and bucket name come from `appsettings.json`. There are no AWS
access keys on the server: the instance has an IAM role that can upload to the
bucket's `images/` folder, and the AWS SDK picks up its credentials
automatically.

### nginx

- `/api/*` is proxied to Kestrel on `127.0.0.1:5000`, with `X-Forwarded-For`
  and `X-Forwarded-Proto` set. The backend trusts forwarded headers from
  loopback only.
- `/assets/*` (hashed Vite files) is cached forever.
- `index.html` is `no-cache`, so a new deploy shows up straight away.
- Every other path falls back to `index.html` for client-side routes.
- `www.thesetuprank.com` redirects to `thesetuprank.com`.

### DNS and TLS (Cloudflare)

- `thesetuprank.com`: `A` record to the Elastic IP, proxied.
- `www.thesetuprank.com`: proxied, redirects to `thesetuprank.com`.
- SSL/TLS mode: **Full (strict)**, with "Always Use HTTPS" on.
- nginx uses a Cloudflare Origin CA certificate (free, 15-year validity, no
  renewal job needed).
- Cloudflare caches JS and CSS files at the edge. Only `index.html` and API
  requests reach the instance.

Google OAuth redirect URI: `https://thesetuprank.com/api/signin-google`.

### Security Group

```txt
443   Cloudflare IP ranges only (https://www.cloudflare.com/ips/)
22    SSH, key authentication only (password and root login disabled)
```

Nothing else is open. Port 80 isn't needed because Cloudflare redirects HTTP to
HTTPS. Port 3306 is never opened, and MySQL listens on `127.0.0.1` only.

### Server Access

Cloudflare only proxies HTTP, so SSH goes straight to the Elastic IP:

```bash
ssh -i ~/.ssh/thesetuprank.pem ec2-user@<elastic-ip>
```

## Production Database

MySQL 8.4 runs on the EC2 instance, with its data directory on a dedicated EBS
volume mounted at `/data`.

Why not Amazon RDS: traffic is small, and the smallest RDS instance costs more
per month than this whole server. Keeping the data on its own volume means it
survives if the instance is replaced, and the volume can be resized on its own.
RDS is the next step if the site ever needs high availability.

Because the database is self-hosted, these are handled manually:

- **Security**: `bind-address = 127.0.0.1`, no port 3306 in the security group,
  and a dedicated `thesetuprank` MySQL user with access to the `thesetuprank`
  database only.
- **Memory**: `innodb_buffer_pool_size` kept small and `performance_schema`
  turned off to fit in 1 GB of RAM.
- **Updates**: OS and MySQL updates are applied manually with `dnf`.
- **Backups**: none, on purpose. Losing the data is acceptable for a portfolio
  site. If it gets real traffic, add daily EBS snapshots (Data Lifecycle
  Manager) and a nightly `mysqldump` to S3.

## Image Storage (S3 + CloudFront)

Images are stored in a private S3 bucket (`thesetuprank-bucket`) with Block
Public Access on. A CloudFront distribution reads the bucket through Origin
Access Control, so CloudFront is the only way to load them.

Upload flow (`POST /api/setups`, up to 4 photos, handled one at a time by
`Services/S3ImageStorageService.cs`):

```txt
Browser --multipart--> POST /api/setups
  -> validate: under 10 MB, JPEG/PNG/WebP detected from the file content, at most 50 MP
  -> process: fix phone rotation, shrink to fit 1600x1600, strip EXIF/GPS metadata
  -> encode as WebP and upload to S3 as images/<guid>.webp
  -> save the S3 key and display order as an Image row
```

Serving flow:

```txt
GET /api/... -> backend returns {CloudFront:BaseUrl}/{key} for each image
             -> browser loads the image from CloudFront
```

- The database stores the S3 key, not a URL, so the image domain can change
  without touching the data.
- Objects are uploaded with `Cache-Control: public, max-age=31536000, immutable`.
  Keys are never reused, so the images can be cached forever.

## Deployment

There's no CI/CD. To ship a change, push to `main`, then on the server:

```bash
cd ~/rate-setup && git pull --ff-only && ./deploy.sh
```

`deploy.sh` (in the repo root) builds both apps on the instance, copies the
output into place, and restarts the backend:

```txt
1. dotnet publish backend/backend.csproj -c Release
2. npm ci && npm run build   (in frontend/, output in frontend/build/client)
3. rsync backend publish output  -> /opt/thesetuprank/backend/
4. rsync frontend/build/client/  -> /var/www/thesetuprank/
5. sudo systemctl restart thesetuprank-backend, and print the logs if it fails
```

The server has the .NET 10 SDK and Node 22 installed for the builds. EF Core
migrations run automatically when the service starts. Builds take a few minutes
on a `t4g.micro`, and the site stays up until the restart.

## Estimated Cost

Rough monthly cost in ap-southeast-2. Check the AWS Pricing Calculator for
current prices.

```txt
EC2 t4g.micro                         ~8 USD
Public IPv4 address (Elastic IP)      ~3.65 USD
EBS gp3 (root + data volume)          ~2 USD
S3, CloudFront, data transfer         ~1 USD at current traffic
Total                                 ~13-15 USD/month
```

Moving to `t4g.small` adds about 8 USD/month.

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

Stop MySQL:

```bash
brew services stop mysql@8.4
```

### Config (user-secrets)

Locally, config lives in user-secrets (run from `backend/`):

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "server=localhost;port=3306;database=thesetuprank;user=thesetuprank;password=<password>"
dotnet user-secrets set "Jwt:Key" "<random string, at least 32 bytes>"
dotnet user-secrets set "Authentication:Google:ClientId" "<google client id>"
dotnet user-secrets set "Authentication:Google:ClientSecret" "<google client secret>"
dotnet user-secrets set "CloudFront:BaseUrl" "https://<distribution>.cloudfront.net"
dotnet user-secrets set "App:FrontendUrl" "http://localhost:5173"
```

`App:FrontendUrl` is where the backend sends you after Google sign-in in
development (the Vite dev server).

### S3

Locally, the backend uses the `thesetuprank` AWS CLI profile (set in
`appsettings.Development.json`). Sign in before running the backend:

```bash
aws login --profile thesetuprank
```

### Running

```bash
dotnet run --launch-profile http
```

The API runs on http://localhost:5065, and Swagger UI is at
http://localhost:5065/swagger.

### OpenAPI

The OpenAPI document is generated from the endpoints and served at
`/openapi/v1.json` and `/openapi/v1.yaml`. `openapi.yaml` in this folder is a
snapshot. Regenerate it after changing an endpoint or a DTO, with the backend
running (from the repo root):

```bash
curl -s http://localhost:5065/openapi/v1.yaml -o backend/openapi.yaml
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

The migration history starts from a single MySQL `InitialCreate` migration.
