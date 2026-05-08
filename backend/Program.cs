using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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

var builder = WebApplication.CreateBuilder(args);

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
    sqlOptions => sqlOptions.EnableRetryOnFailure()
));

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

    // after google redirects back
    // OnTicketReceived fires
    o.Events.OnTicketReceived = async ctx =>
    {
        var claims = ctx.Principal?.Claims ?? [];
        var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? "";
        var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "";
        var imageUrl = claims.FirstOrDefault(c => c.Type == "picture")?.Value ?? "";

        // create user if first time signing in
        var db = ctx.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new backend.Models.User
            {
                Email = email,
                Name = name,
                IsActive = true,
                ImageUrl = imageUrl,
                Handle = name,
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }


        var jwt = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            issuer: "rate-setup",
            audience: "rate-setup",
            claims: [new Claim(ClaimTypes.Email, email), new Claim(ClaimTypes.Name, name), new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())],
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
        ));

        // in production
        // Secure = true
        bool isCookieSecure = builder.Environment.IsProduction();

        ctx.Response.Cookies.Append("auth_token", jwt, new CookieOptions
        {
            HttpOnly = true, // client side js can't access it
            SameSite = SameSiteMode.Lax,
            Secure = isCookieSecure, // over https only
            Expires = DateTimeOffset.UtcNow.AddDays(7),
        });

        // since front-end and backend is in the same origin, "/" works
        var frontendUrl = builder.Configuration["App:FrontendUrl"] ?? "/";
        ctx.Response.Redirect(frontendUrl);
        ctx.HandleResponse();
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
        ValidIssuer = "rate-setup",
        ValidateAudience = true,
        ValidAudience = "rate-setup",
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
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}


// Swagger UI pointing to your YAML
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/openapi.yaml", "Rate Setup API");
});

// cors only in development
if (app.Environment.IsDevelopment())
{
    app.UseCors();
}

app.UseForwardedHeaders();
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

app.Run();
