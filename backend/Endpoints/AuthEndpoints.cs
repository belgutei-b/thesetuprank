using System;
using System.Security.Claims;
using backend.Auth;
using backend.Data;

namespace backend.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapGet("/api/auth/me", (AppDbContext db, HttpContext ctx, ILogger<Program> logger) =>
        {
            try
            {
                logger.LogInformation("received auth request");
                var name = ctx.User.FindFirst(ClaimTypes.Name)?.Value;
                var email = ctx.User.FindFirst(ClaimTypes.Email)?.Value;
                var id = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                return Results.Ok(new
                {
                    id,
                    name,
                    email,
                });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        app.MapPost("/api/auth/logout", (HttpContext ctx, AppAuthService auth) =>
        {
            try
            {
                auth.DeleteAuthCookie(ctx.Response);
                return Results.Ok();
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        }).AllowAnonymous();
    }
}