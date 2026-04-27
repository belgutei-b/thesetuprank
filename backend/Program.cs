using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Endpoints;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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

        ctx.Response.Redirect($"http://localhost:5173/#token={jwt}");
        ctx.HandleResponse();
    };
})
.AddJwtBearer(o =>
{
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

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
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

app.UseCors();
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

app.MapGet("/api/auth/me", (HttpContext ctx) =>
    Results.Ok(new
    {
        name = ctx.User.FindFirst(ClaimTypes.Name)?.Value,
        email = ctx.User.FindFirst(ClaimTypes.Email)?.Value,
        id = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
    })
);

app.MapSetupEndpoints();

app.Run();
