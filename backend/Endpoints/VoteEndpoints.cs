using System.Security.Claims;
using backend.Data;
using backend.Dtos;
using backend.Dtos.Vote;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class VoteEndpoints
{
    public static void MapVoteEndpoints(this WebApplication app)
    {
        app.MapGet("/api/vote", async (AppDbContext db, HttpContext ctx, ILogger<Program> logger) =>
        {
            try
            {
                var userId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Guid? voterId = Guid.TryParse(userId, out var parsed) ? parsed : null;


                // choosing 2 setups randomly
                var setups = await db.Setups
                    .Where(s => s.IsActive)
                    .OrderBy(s => Guid.NewGuid())
                    .Take(2)
                    .ToListAsync();

                logger.LogInformation(userId);
                var battle = new backend.Models.Battle
                {
                    Setup1Id = setups[0].Id,
                    Setup2Id = setups[1].Id,
                    VoterId = voterId,
                };

                db.Battles.Add(battle);
                await db.SaveChangesAsync();

                var setupA = new backend.Dtos.SetupBriefDto
                {
                    Id = setups[0].Id,
                    Name = setups[0].Name,
                    Description = setups[0].Description,
                    ImageUrl = setups[0].ImageUrl,
                    Rating = setups[0].Rating
                };

                var setupB = new backend.Dtos.SetupBriefDto
                {
                    Id = setups[1].Id,
                    Name = setups[1].Name,
                    Description = setups[1].Description,
                    ImageUrl = setups[1].ImageUrl,
                    Rating = setups[1].Rating
                };

                return Results.Ok(new VoteGetDto
                {
                    BattleId = battle.Id,
                    SetupA = setupA,
                    SetupB = setupB
                });
            }
            catch (Exception ex)
            {

                logger.LogError(ex, "GET /api/vote Failed");
                return Results.Problem("An unexpected error occurred.");
            }
        }).AllowAnonymous();

        // SubmittedAt & VoterId
        app.MapPost("/api/vote", async (VoteSubmitReqDto request, AppDbContext db, HttpContext ctx, ILogger<Program> logger) =>
        {
            try
            {

                var battleId = request.BattleId;
                var winnerId = request.WinnerId;
                var loserId = request.LoserId;

                // current rating of winner and loser
                var battle = await db.Battles
                    .Include(b => b.Setup1)
                    .Include(b => b.Setup2)
                    .FirstOrDefaultAsync(b => b.Id == battleId)
                    ?? throw new Exception("Battle not found");

                var winner = (winnerId == battle.Setup1Id) ? battle.Setup1 : battle.Setup2;

                logger.LogInformation("winner: " + winner.Rating);

                var loser = (loserId == battle.Setup1Id) ? battle.Setup1 : battle.Setup2;
                logger.LogInformation("loser: " + loser.Rating);

                // calculate rank change of each setup

                var winnerExpectedScore = 1.0 / (1 + Math.Pow(10, -(winner.Rating - loser.Rating) / 400.0));
                var loserExpectedScore = 1.0 / (1 + Math.Pow(10, -(loser.Rating - winner.Rating) / 400.0));


                // K can be adjusted
                var K = 20;

                var winnerOldRating = winner.Rating;
                logger.LogInformation("winnerExpectedScore: {Score:F4}", winnerExpectedScore);

                var winnerNewRating = winner.Rating + K * (1.0 - winnerExpectedScore);

                var loserOldRating = loser.Rating;
                var loserNewRating = loser.Rating + K * (0.0 - loserExpectedScore);

                // update the ranks of setups
                winner.Rating = (int)Math.Round(winnerNewRating);
                loser.Rating = (int)Math.Round(loserNewRating);

                battle.SubmittedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();

                logger.LogInformation(
                    (winnerNewRating - winnerOldRating).ToString()
                );

                logger.LogInformation(
(loserNewRating - loserOldRating).ToString()
                );
                // return rank change
                return Results.Ok(new VoteSubmitResDto
                {
                    BattleId = battleId,
                    WinnerDiff = (int)Math.Round(winnerNewRating - winnerOldRating),
                    LoserDiff = (int)Math.Round(loserNewRating - loserOldRating),
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "POST /api/vote Failed");
                return Results.Problem("An unexpected error occurred.");
            }
        }).AllowAnonymous();
    }
}
