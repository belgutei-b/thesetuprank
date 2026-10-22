using System.Security.Claims;
using backend.Data;
using backend.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class SetupEndpoints
{
    private const int MaxNameLength = 40;
    private const int MaxDescriptionLength = 400;
    private const int MaxImageNumber = 4;
    private const int MaxSetupNumber = 8;

    public static void MapSetupEndpoints(this WebApplication app)
    {
        // Setups of authenticated user
        app.MapGet(
                "/api/setups",
                async (
                    AppDbContext db,
                    HttpContext ctx,
                    IImageStorageService imageStorage,
                    ILogger<Program> logger
                ) =>
                {
                    try
                    {
                        var userId =
                            (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value)
                            ?? throw new Exception("null userId");
                        var user = new Guid(userId);

                        var setups = await db
                            .Setups.Include(s => s.Images)
                            .Where(s => s.IsActive)
                            .Where(u => u.CreatedBy.Equals(user))
                            .ToListAsync();

                        var setupIds = setups.Select(s => s.Id).ToList();

                        var setupRet = new List<SetupListResDto>();
                        for (var i = 0; i < setups.Count; i++)
                        {
                            setupRet.Add(
                                new SetupListResDto
                                {
                                    Id = setups[i].Id,
                                    ImageKeys = setups[i]
                                        .Images.OrderBy(img => img.pos)
                                        .Select(img => imageStorage.GetImageUrl(img.Key))
                                        .ToArray(),
                                    Name = setups[i].Name,
                                    Description = setups[i].Description,
                                    Rating = setups[i].Rating,
                                    FeaturedAt = setups[i].FeaturedAt,
                                    CreatedAt = setups[i].CreatedAt,
                                    Wins = 0,
                                    Losses = 0,
                                }
                            );
                        }

                        var battles = await db
                            .Battles.Where(b => b.SubmittedAt.HasValue)
                            .Where(b =>
                                setupIds.Contains(b.Setup1Id) || setupIds.Contains(b.Setup2Id)
                            )
                            .ToListAsync();

                        for (int i = 0; i < setupRet.Count; i++)
                        {
                            int winCount = battles
                                .FindAll(battle => battle.WinnerId == setupRet[i].Id)
                                .Count;
                            setupRet[i].Wins = winCount;

                            int lossCount = battles
                                .FindAll(battle => battle.LoserId == setupRet[i].Id)
                                .Count;
                            setupRet[i].Losses = lossCount;
                        }
                        return Results.Ok(setupRet);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "GET /api/setups/ FAILED");
                        return Results.Problem("An unexpected error occurred.");
                    }
                }
            )
            .Produces<List<SetupListResDto>>(200);

        // Setup upload
        // 1. frontend calls POST /api/setups
        // 2. backend uploads the image to S3 bucket
        // 3. backend saves the entries to the db
        app.MapPost(
                "/api/setups",
                async (
                    AppDbContext db,
                    HttpContext ctx,
                    IImageStorageService imageStorage,
                    [FromForm] SetupPostDto setupPostDto,
                    ILogger<Program> logger
                ) =>
                {
                    try
                    {
                        // retrieving the userId & user
                        var userId =
                            (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value)
                            ?? throw new Exception("null userId");
                        var user = new Guid(userId);

                        // check if the number of setup uploaded by user exceeds the limit
                        var numberOfSetups = await db.Setups.CountAsync(u =>
                            u.CreatedBy.Equals(user)
                        );
                        if (numberOfSetups >= MaxSetupNumber)
                        {
                            throw new Exception(
                                $"Number of uploaded setups exceeds ${MaxSetupNumber}"
                            );
                        }

                        // check length of the name (40 chars) & description(400 chars)
                        if (setupPostDto.Name.Length > MaxNameLength)
                        {
                            throw new Exception($"Length of name exceeds {MaxNameLength} chars");
                        }
                        if (setupPostDto.Description.Length > MaxDescriptionLength)
                        {
                            throw new Exception(
                                $"Length of description exceeds {MaxDescriptionLength} chars"
                            );
                        }
                        // check the number of images
                        if (setupPostDto.SetupImages.Count > MaxImageNumber)
                        {
                            throw new Exception($"Upload up to {MaxImageNumber} images per setup");
                        }

                        var newSetup = new backend.Models.Setup
                        {
                            CreatedBy = new Guid(userId),
                            Name = setupPostDto.Name,
                            Description = setupPostDto.Description,
                        };

                        // compress & upload the images to S3 Bucket
                        var i = 0;
                        foreach (var setupImage in setupPostDto.SetupImages)
                        {
                            var imageKey = await imageStorage.UploadImageAsync(setupImage);
                            var newImage = new backend.Models.Image { Key = imageKey, pos = i };
                            newSetup.Images.Add(newImage);
                            i++;
                        }

                        db.Setups.Add(newSetup);
                        await db.SaveChangesAsync();

                        return Results.Ok(
                            new
                            {
                                setupId = newSetup.Id,
                                imageKeys = newSetup
                                    .Images.OrderBy(i => i.pos)
                                    .Select(i => imageStorage.GetImageUrl(i.Key)),
                                description = newSetup.Description,
                            }
                        );
                    }
                    catch (InvalidImageException ex)
                    {
                        // Returns 400
                        return Results.BadRequest(ex.Message);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "POST /api/setups/ FAILED");
                        return Results.Problem("An unexpected error occurred.");
                    }
                }
            )
            .DisableAntiforgery();

        // Get setup by ID
        app.MapGet(
            "/api/setups/{setupId:guid}",
            async (
                AppDbContext db,
                HttpContext ctx,
                ILogger<Program> logger,
                IImageStorageService imageStorage,
                Guid setupId
            ) =>
            {
                try
                {
                    var userId =
                        (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value)
                        ?? throw new Exception("null userId");
                    var user = new Guid(userId);

                    var setup =
                        await db
                            .Setups.Include(s => s.Images)
                            .Where(s => s.IsActive)
                            .Where(s => s.Id == setupId)
                            .Where(s => s.CreatedBy == user)
                            .SingleOrDefaultAsync()
                        ?? throw new Exception("Setup not found");

                    var setupRet = new SetupListResDto
                    {
                        Id = setup.Id,
                        ImageKeys = setup
                            .Images.OrderBy(i => i.pos)
                            .Select(s => imageStorage.GetImageUrl(s.Key))
                            .ToArray(),
                        Name = setup.Name,
                        Description = setup.Description,
                        FeaturedAt = setup.FeaturedAt,
                        CreatedAt = setup.CreatedAt,
                        Rating = setup.Rating,
                        Wins = 0,
                        Losses = 0,
                    };

                    var wins = await db.Battles.CountAsync(b => b.WinnerId == setupId);
                    setupRet.Wins = wins;

                    var losses = await db.Battles.CountAsync(b => b.LoserId == setupId);
                    setupRet.Losses = losses;

                    return Results.Ok(setupRet);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "GET /api/setups/setupId FAILED");
                    return Results.Problem("An unexpected error occurred.");
                }
            }
        );

        // Report setup
        // Even unauthenticated users also can report
        app.MapPost(
                "/api/setups/report/{setupId:guid}",
                async (AppDbContext db, HttpContext ctx, ILogger<Program> logger, Guid setupId) =>
                {
                    try
                    {
                        var setup = await db
                            .Setups.Where(s => s.Id == setupId)
                            .SingleOrDefaultAsync();

                        if (setup is null)
                        {
                            return Results.NotFound();
                        }

                        setup.ReportCount += 1;

                        await db.SaveChangesAsync();

                        return Results.Ok();
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "POST /api/setups/report/setupId FAILED");
                        return Results.Problem("An unexpected error occurred.");
                    }
                }
            )
            .AllowAnonymous();
    }
}
