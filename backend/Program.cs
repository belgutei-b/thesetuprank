using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(o =>
{
    o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(o =>
{
    o.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
    o.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;

    o.Events.OnTicketReceived = ctx =>
    {
        var claims = ctx.Principal?.Claims ?? [];
        var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? "";
        var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "";

        var jwt = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            issuer: "rate-setup",
            audience: "rate-setup",
            claims: [new Claim(ClaimTypes.Email, email), new Claim(ClaimTypes.Name, name)],
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
        ));

        ctx.Response.Redirect($"http://localhost:5173/#token={jwt}");
        ctx.HandleResponse();
        return Task.CompletedTask;
    };
})
.AddJwtBearer(o =>
{
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

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/auth/login", ctx =>
    ctx.ChallengeAsync(GoogleDefaults.AuthenticationScheme,
        new AuthenticationProperties { RedirectUri = "/" }));

app.MapGet("/api/auth/me", (HttpContext ctx) =>
    Results.Ok(new
    {
        name = ctx.User.FindFirst(ClaimTypes.Name)?.Value,
        email = ctx.User.FindFirst(ClaimTypes.Email)?.Value,
    })
).RequireAuthorization(p => p.AddAuthenticationSchemes("Bearer").RequireAuthenticatedUser());

app.Run();
