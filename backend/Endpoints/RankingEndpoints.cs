using backend.Data;
using backend.Dtos;
using backend.Dtos.Ranking;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class RankingEndpoints
{
    public static void MapRankingEndpoints(this WebApplication app)
    {
        // rating: starts with 800 for all setups
        // wins & losses
        app.MapGet(
                "/api/ranking",
                async (
                    AppDbContext db,
                    HttpContext ctx,
                    IImageStorageService imageStorage,
                    ILogger<Program> logger
                ) =>
                {
                    try
                    {
                        // fetch the top 20 setups based on the Ranking
                        var setups = await db
                            .Setups.Include(s => s.Images)
                            .Where(s => s.IsActive == true)
                            .OrderByDescending(s => s.Rating)
                            .Take(20)
                            .Select(s => new SetupListResDto
                            {
                                Id = s.Id,
                                ImageKeys = s
                                    .Images.OrderBy(img => img.pos)
                                    .Select(i => imageStorage.GetImageUrl(i.Key))
                                    .ToArray(),
                                Name = s.Name,
                                Description = s.Description,
                                Rating = s.Rating,
                                FeaturedAt = s.FeaturedAt,
                                CreatedAt = s.CreatedAt,
                                Wins = db.Battles.Count(b =>
                                    b.SubmittedAt.HasValue && b.WinnerId == s.Id
                                ),
                                Losses = db.Battles.Count(b =>
                                    b.SubmittedAt.HasValue && b.LoserId == s.Id
                                ),
                            })
                            .ToListAsync();

                        var numberOfSetups = await db
                            .Setups.Where(s => s.IsActive == true)
                            .CountAsync();

                        return Results.Ok(new { numberOfSetups, setups });
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "GET /api/ranking FAILED");
                        return Results.Problem("An unexpected error occurred.");
                    }
                }
            )
            .AllowAnonymous()
            .Produces<RankingResDto>(200);
    }
}
