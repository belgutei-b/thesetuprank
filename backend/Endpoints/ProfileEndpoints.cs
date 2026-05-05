using System.Security.Claims;
using backend.Data;
using backend.Dtos.Profile;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class ProfileEndpoints
{
    public static void MapProfileEndpoints(this WebApplication app)
    {
        app.MapGet("/api/profile", async (AppDbContext db, HttpContext ctx, ILogger<Program> logger) =>
        {
            try
            {
                var userId = (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value) ?? throw new Exception("null userId");
                var userGuid = new Guid(userId);

                // personal information (email, handle, createdAt)
                // Q: how to pick just one item and it is not turned into list
                var personalInformation = await db.Users
                    .Where(u => u.Id == userGuid)
                    .Select(u => new PersonalInformation
                    {
                        Id = u.Id,
                        Email = u.Handle,
                        Handle = u.Handle,
                    })
                    .FirstAsync();


                // Q: how to make parallel db queries

                // own setups
                // TODO: create a library function that takes user's Id
                // Q: what is a convention for creating library functions

                // saved setups (return last 20, need pagination)
                // TODO; create a library function that takes user's Id

                return Results.Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "GET /api/profile FAILED");
                return Results.Problem("An unexpected error occurred.");
            }
        });

    }

}
