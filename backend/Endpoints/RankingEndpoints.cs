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
        // rating: changed 800 for all setups at the beginning of the week
        // wins & losses:  only includes this week
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
                        DateTime now = DateTime.UtcNow;
                        int daysFromMonday = ((int)now.DayOfWeek + 6) % 7;
                        DateTime weekStart = now.Date.AddDays(-daysFromMonday);

                        // fetch the top 20 setups based on the Ranking
                        var setups = await db
                            .Setups.Where(s => s.IsActive == true)
                            .OrderByDescending(s => s.Rating)
                            .Take(20)
                            .Select(s => new SetupListResDto
                            {
                                Id = s.Id,
                                ImageUrl = imageStorage.GetImageUrl(s.ImageUrl),
                                Name = s.Name,
                                Description = s.Description,
                                Rating = s.Rating,
                                FeaturedAt = s.FeaturedAt,
                                CreatedAt = s.CreatedAt,
                                Wins = db.Battles.Count(b =>
                                    b.CreatedAt >= weekStart
                                    && b.SubmittedAt.HasValue
                                    && b.WinnerId == s.Id
                                ),
                                Losses = db.Battles.Count(b =>
                                    b.CreatedAt >= weekStart
                                    && b.SubmittedAt.HasValue
                                    && b.LoserId == s.Id
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
