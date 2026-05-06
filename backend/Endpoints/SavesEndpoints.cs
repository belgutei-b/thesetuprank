using System.Security.Claims;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class SavesEndpoints
{
    public static void MapSavesEndpoints(this WebApplication app)
    {
        app.MapPost("/api/saves/{setupId:guid}", async (AppDbContext db, HttpContext ctx, ILogger<Program> logger, Guid setupId) =>
        {
            try
            {
                var rawUserId = (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value) ?? throw new Exception("null userId");

                Guid userId = new(rawUserId);

                // check if it exists
                var entryCount = await db.SavedSetups
                    .Where(s => s.SetupId == setupId && s.UserId == userId)
                    .CountAsync();

                if (entryCount > 0)
                {
                    return Results.Conflict("Already saved");
                }

                // add it to the db
                db.SavedSetups.Add(new Models.SavedSetup
                {
                    UserId = userId,
                    SetupId = setupId
                });

                await db.SaveChangesAsync();

                return Results.Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "POST /api/save/rawSetupId Failed");
                return Results.Problem("An unexpected error occurred.");
            }
        });

        // unsave setup
        app.MapDelete("/api/saves/{setupId:guid}", async (AppDbContext db, HttpContext ctx, ILogger<Program> logger, Guid setupId) =>
        {
            return Results.Ok();
        });

        // current authenticated users all saved setups
        // currently returns the first 20 setups
        // TODO: need to add pagination to this endpoint
        app.MapGet("/api/saves", async (AppDbContext db, HttpContext ctx, ILogger<Program> logger) =>
        {
            try
            {
                var rawUserId = (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value) ?? throw new Exception("null userId");

                Guid userId = new(rawUserId);

                var setups = await db.SavedSetups
                    .Where(s => s.UserId == userId)
                    .OrderBy(s => s.CreatedAt)
                    .Take(20)
                    .Include(s => s.Setup)
                    .ToListAsync();

                return Results.Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "GET /api/save Failed");
                return Results.Problem("An unexpected error occurred.");
            }
        });

        // TODO: DELETE /api/save
    }
}
