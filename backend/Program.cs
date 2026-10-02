using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Auth;
using backend.Data;
using backend.Endpoints;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.DataProtection;
using Amazon.S3;

var builder = WebApplication.CreateBuilder(args);

// Persist Data Protection keys on the App Service /home mount so the OAuth
// correlation cookie survives container restarts.
if (builder.Environment.IsProduction())
{
    var keysDir = new DirectoryInfo("/home/DataProtection-Keys");
    keysDir.Create();
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(keysDir)
        .SetApplicationName("thesetuprank-backend");
}

var jwtKey = builder.Configuration["Jwt:Key"]
             ?? throw new InvalidOperationException("Jwt:Key is not configured");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Database connection string DefaultConnection is missing.");
}

builder.Services.AddDbContext<AppDbContext>(options => options.UseMySQL(connectionString,
    sqlOptions => sqlOptions.EnableRetryOnFailure()
));

builder.Services.AddScoped<AppAuthService>();

builder.Services.AddAuthentication(o =>
    {
        o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        o.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddGoogle(o =>
    {
        // todo: maybe handle if Google:ClientId doens't exist
        o.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        o.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        o.CallbackPath = "/api/signin-google";

        o.Scope.Add("profile");
        o.Scope.Add("email");
        o.ClaimActions.MapJsonKey("urn:google:picture", "picture");
        o.ClaimActions.MapJsonKey("urn:google:email_verified", "email_verified");

        o.Events.OnRemoteFailure = ctx =>
        {
            Console.Error.WriteLine($"[OAuth] OnRemoteFailure: {ctx.Failure?.GetType().Name}: {ctx.Failure?.Message}");
            Console.Error.WriteLine(ctx.Failure?.ToString());
            return Task.CompletedTask;
        };

        o.Events.OnAccessDenied = ctx =>
        {
            Console.Error.WriteLine("[OAuth] OnAccessDenied");
            return Task.CompletedTask;
        };

        o.Events.OnTicketReceived = async ctx =>
        {
            var auth = ctx.HttpContext.RequestServices.GetRequiredService<AppAuthService>();
            await auth.HandleGoogleTicketReceivedAsync(ctx);
        };
    })
    .AddJwtBearer(o =>
    {
        o.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                ctx.Token = ctx.Request.Cookies["auth_token"];
                return Task.CompletedTask;
            }
        };
        // handles every subsequent API request after google login
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "thesetuprank",
            ValidateAudience = true,
            ValidAudience = "thesetuprank",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
        };
    });

// all endpoints require auth by default
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .AddAuthenticationSchemes("Bearer")
        .RequireAuthenticatedUser()
        .Build();
});

// cors only in development
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(p => p
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
    });
}

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto |
                               ForwardedHeaders.XForwardedHost;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
builder.Services.AddAWSService<IAmazonS3>();

var app = builder.Build();

// Pipeline tap: log every request & any exception bubbling up.
app.Use(async (ctx, next) =>
{
    Console.Error.WriteLine($"[Pipeline] -> {ctx.Request.Method} {ctx.Request.Path}{ctx.Request.QueryString}");
    try
    {
        await next();
        Console.Error.WriteLine(
            $"[Pipeline] <- {ctx.Request.Method} {ctx.Request.Path} status={ctx.Response.StatusCode}");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"[Pipeline] !! UNHANDLED {ex.GetType().Name}: {ex.Message}");
        Console.Error.WriteLine(ex.ToString());
        throw;
    }
});

// Apply pending database migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}


// Swagger UI pointing to your YAML
app.UseSwaggerUI(c => { c.SwaggerEndpoint("/openapi.yaml", "Rate Setup API"); });

// cors only in development
if (app.Environment.IsDevelopment())
{
    app.UseCors();
}

app.UseForwardedHeaders();

// In production, force Request.Host/Scheme to the public hostname so OAuth
// redirect_uri is built correctly even if SWA doesn't forward X-Forwarded-Host.
var publicHost = builder.Configuration["App:PublicHost"];
if (!string.IsNullOrEmpty(publicHost))
{
    app.Use((ctx, next) =>
    {
        ctx.Request.Host = new HostString(publicHost);
        ctx.Request.Scheme = "https";
        return next();
    });
}

app.UseAuthentication();
app.UseAuthorization();

// Public endpoint
// no authorization required by AllowAnonymous
app.MapGet("/api/auth/login", ctx =>
    ctx.ChallengeAsync(GoogleDefaults.AuthenticationScheme,
        new AuthenticationProperties { RedirectUri = "/" })
).AllowAnonymous();

// http://localhost:5065/swagger/index.html
app.MapGet("/openapi.yaml", async context =>
{
    context.Response.ContentType = "application/yaml";
    await context.Response.SendFileAsync("wwwroot/openapi.yaml");
}).AllowAnonymous();

app.MapSetupEndpoints();
app.MapAuthEndpoints();
app.MapVoteEndpoints();
app.MapRankingEndpoints();
app.MapSavesEndpoints();

// test endpoint to check the S3 connection
if (app.Environment.IsDevelopment())
{
    app.MapDevEndpoints();
}

app.Run();