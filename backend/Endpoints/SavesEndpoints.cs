using System.Security.Claims;
using backend.Data;
using backend.Dtos;
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
            var rawUserId = (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            if (rawUserId is null) return Results.Unauthorized();

            try
            {
                Guid userId = new(rawUserId);

                // because (UserId, SetupId) is a unique pair
                // it will affect up to 1 row
                var numberOfDeletedRows = await db.SavedSetups
                    .Where(s => s.UserId == userId && s.SetupId == setupId)
                    .ExecuteDeleteAsync();

                if (numberOfDeletedRows == 0)
                {
                    return Results.NotFound();
                }

                return Results.Ok();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "DELETE /api/save/setupId Failed");
                return Results.Problem("An unexpected error occurred.");
            }
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

                var savedSetups = await db.SavedSetups
                    .Where(s => s.UserId == userId)
                    .OrderBy(s => s.CreatedAt)
                    .Take(20)
                    .Include(s => s.Setup)
                    .ToListAsync();

                var setupIds = savedSetups.Select(s => s.SetupId).ToList();

                var battles = await db.Battles
                    .Where(b => b.SubmittedAt.HasValue)
                    .Where(b => setupIds.Contains(b.Setup1Id) || setupIds.Contains(b.Setup2Id))
                    .ToListAsync();

                var result = savedSetups.Select(s => new SetupListResDto
                {
                    Id = s.Setup.Id,
                    ImageUrl = s.Setup.ImageUrl,
                    Name = s.Setup.Name,
                    Description = s.Setup.Description,
                    Rating = s.Setup.Rating,
                    FeaturedAt = s.Setup.FeaturedAt,
                    CreatedAt = s.Setup.CreatedAt,
                    Wins = battles.Count(b => b.WinnerId == s.SetupId),
                    Losses = battles.Count(b => b.LoserId == s.SetupId),
                }).ToList();

                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "GET /api/saves Failed");
                return Results.Problem("An unexpected error occurred.");
            }
        })
        .Produces<List<SetupListResDto>>(200);

        // TODO: DELETE /api/save
    }
}
