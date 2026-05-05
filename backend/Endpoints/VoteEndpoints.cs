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
        // TODO: 2 setups has to be uploaded this week
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

                return Results.Ok(new VoteGetResDto
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
        })
        .AllowAnonymous()
        .Produces<VoteGetResDto>(200);

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

                // todo: ensure that currently submittedAt is null (not duplicated request)
                // todo: validate the ids first
                var winner = (winnerId == battle.Setup1Id) ? battle.Setup1 : battle.Setup2;
                var loser = (loserId == battle.Setup1Id) ? battle.Setup1 : battle.Setup2;

                // calculate rank change of each setup

                var winnerExpectedScore = 1.0 / (1 + Math.Pow(10, -(winner.Rating - loser.Rating) / 400.0));
                var loserExpectedScore = 1.0 / (1 + Math.Pow(10, -(loser.Rating - winner.Rating) / 400.0));


                // K can be adjusted
                var K = 20;

                var winnerOldRating = winner.Rating;

                var winnerNewRating = winner.Rating + K * (1.0 - winnerExpectedScore);

                var loserOldRating = loser.Rating;
                var loserNewRating = loser.Rating + K * (0.0 - loserExpectedScore);

                // update the ranks of setups
                winner.Rating = (int)Math.Round(winnerNewRating);
                loser.Rating = (int)Math.Round(loserNewRating);

                battle.SubmittedAt = DateTime.UtcNow;
                battle.WinnerId = winner.Id;
                battle.LoserId = loser.Id;
                await db.SaveChangesAsync();

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
        })
        .AllowAnonymous()
        .Produces<VoteSubmitResDto>(200);

        // number of votes since the beginning of the week (Monday 00:00 UTC)
        app.MapGet("/api/vote/count", async (AppDbContext db, ILogger<Program> logger) =>
        {
            try
            {
                DateTime now = DateTime.UtcNow;
                int daysFromMonday = ((int)now.DayOfWeek + 6) % 7;
                // AddDays method gives the day in midnight -> hour and minute is zero
                DateTime timeCutoff = now.Date.AddDays(-daysFromMonday);

                var count = await db.Battles
                    .Where(u => u.SubmittedAt.HasValue && u.SubmittedAt >= timeCutoff)
                    .CountAsync();

                return Results.Ok(new VoteCountResDto { Count = count });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "GET /api/vote/count Failed");
                return Results.Problem("An unexpected error occurred.");
            }
        })
        .AllowAnonymous()
        .Produces<VoteCountResDto>(200);
    }
}
