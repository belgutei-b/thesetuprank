using System.Security.Claims;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using backend.Data;
using backend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

/***
 * BLOG Storage todos
 * 1. Tighten CORS for azure storage account
 * 2. Disable: BLOB anonymous access
 *      - all upload and retrieval will go through the backend in the future
 * 3. Add upload image size limit
 * 4. create DEV container in storage account (use different containers for prod and dev)
 * 5. validate blob url
 */
public static class SetupEndpoints
{
    private const int MaxNameLength = 40;
    private const int MaxDescriptionLength = 400;

    public static void MapSetupEndpoints(this WebApplication app)
    {
        // authenticated user's setups
        app.MapGet("/api/setups", async (AppDbContext db, HttpContext ctx, ILogger<Program> logger) =>
        {
            try
            {
                var userId = (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value) ?? throw new Exception("null userId");
                var user = new Guid(userId);

                var setups = await db.Setups
                    .Where(s => s.IsActive)
                    .Where(u => u.CreatedBy.Equals(user))
                    .ToListAsync();

                var setupIds = setups.Select(s => s.Id).ToList();

                var setupRet = new List<SetupListResDto>();
                for (var i = 0; i < setups.Count; i++)
                {
                    setupRet.Add(new SetupListResDto
                    {
                        Id = setups[i].Id,
                        ImageUrl = setups[i].ImageUrl,
                        Name = setups[i].Name,
                        Description = setups[i].Description,
                        Rating = setups[i].Rating,
                        FeaturedAt = setups[i].FeaturedAt,
                        CreatedAt = setups[i].CreatedAt,
                        Wins = 0,
                        Losses = 0,
                    });
                }

                var battles = await db.Battles
                    .Where(b => b.SubmittedAt.HasValue)
                    .Where(b => setupIds.Contains(b.Setup1Id) || setupIds.Contains(b.Setup2Id))
                    .ToListAsync();

                for (int i = 0; i < setupRet.Count; i++)
                {
                    int winCount = battles.FindAll(battle => battle.WinnerId == setupRet[i].Id).Count;
                    setupRet[i].Wins = winCount;

                    int lossCount = battles.FindAll(battle => battle.LoserId == setupRet[i].Id).Count;
                    setupRet[i].Losses = lossCount;
                }
                return Results.Ok(setupRet);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "POST /api/setups/ FAILED");
                return Results.Problem("An unexpected error occurred.");
            }
        })
        .Produces<List<SetupListResDto>>(200);

        // setup upload flow
        // 1. frontend calls POST /api/setups/upload-url
        // 2. backend generates uploadUrl, imageUrl -> sends to frontend
        // 3. frontend uploads the image directly to Azure
        // 4. frontend calls POST /api/setups with { description, imageUrl }
        // 5. backend saves the entries to the db

        // db is accessible in the api endpoints because (dependency injection)
        // it was registered in Program.cs by builder.Services.AddDbContext
        app.MapPost("/api/setups", async (AppDbContext db, HttpContext ctx, SetupPostDto setupPostDto, ILogger<Program> logger) =>
        {
            try
            {
                // check imageUrl
                // if (!setupPostDto.ImageUrl.StartsWith("https://setupimages.blob.core.windows.net/setupcontainer/"))
                // {
                //     throw new Exception("Invalid image url");
                // }

                // check length of the name (40 chars) & description(400 chars)

                if (setupPostDto.Name.Length > MaxNameLength)
                {
                    throw new Exception("Length of name exceeds 40 chars");
                }

                if (setupPostDto.Description.Length > MaxDescriptionLength)
                {
                    throw new Exception("Length of description exceeds 400 chars");
                }

                var userId = (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value) ?? throw new Exception("null userId");

                var newSetup = new backend.Models.Setup
                {
                    CreatedBy = new Guid(userId),
                    ImageUrl = setupPostDto.ImageUrl,
                    Name = setupPostDto.Name,
                    Description = setupPostDto.Description,
                };

                db.Setups.Add(newSetup);

                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    setupId = newSetup.Id,
                    imageUrl = newSetup.ImageUrl,
                    description = newSetup.Description,
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "POST /api/setups/ FAILED");
                return Results.Problem("An unexpected error occurred.");
            }
        });

        // TODO: 2 setup per user limit is not enforced
        // no upload size limit
        // doesn't remove the url if nothing is uploaded in 15 minutes
        app.MapPost("/api/setups/upload-url", (IConfiguration config, ILogger<Program> logger) =>
        {
            // generate azure blob storage
            // uploadUrl: temporary SAS URL for the frontend to upload the image
            // imageUrl: permanent public URL of the image after it is uploaded
            try
            {
                var connectionString = config["Azure:BlobConnectionString"];
                var containerName = config["Azure:ContainerName"];

                if (string.IsNullOrWhiteSpace(connectionString)) { throw new InvalidOperationException("Connection string missin"); }
                if (string.IsNullOrWhiteSpace(containerName)) { throw new InvalidOperationException("Container Name Missing"); }

                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                var blobName = $"{Guid.NewGuid()}.jpg";
                var blobClient = containerClient.GetBlobClient(blobName);

                // SAS: shared access signature with write permission
                // expires in 15 minutes
                var sasUri = blobClient.GenerateSasUri(BlobSasPermissions.Write, DateTimeOffset.UtcNow.AddMinutes(15));

                // both sasUri and blobClient points to same blob in Azure
                // sasUri has only write permission and will expire in 15 minutes
                return Results.Ok(new SetupUploadImageDto
                {
                    UploadUrl = sasUri.ToString(),
                    ImageUrl = blobClient.Uri.ToString()
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "POST /api/setups/upload-url FAILED");
                return Results.Problem("An unexpected error occurred.");
            }
        })
        .Produces<SetupUploadImageDto>(200)
        .Produces(401) // doesn't add any logic / will be caught in Program.cs
        .Produces(500);

        app.MapGet("/api/setups/{setupId:guid}", async (AppDbContext db, HttpContext ctx, ILogger<Program> logger, Guid setupId) =>
        {
            try
            {
                var userId = (ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value) ?? throw new Exception("null userId");
                var user = new Guid(userId);

                var setup = await db.Setups
                    .Where(s => s.IsActive)
                    .Where(s => s.Id == setupId)
                    .Where(s => s.CreatedBy == user)
                    .SingleOrDefaultAsync() ?? throw new Exception("Setup not found");

                var setupRet = new SetupListResDto
                {
                    Id = setup.Id,
                    ImageUrl = setup.ImageUrl,
                    Name = setup.Name,
                    Description = setup.Description,
                    FeaturedAt = setup.FeaturedAt,
                    CreatedAt = setup.CreatedAt,
                    Wins = 0,
                    Losses = 0,
                };

                var wins = await db.Battles
                    .CountAsync(b => b.WinnerId == setupId);
                setupRet.Wins = wins;

                var losses = await db.Battles
                    .CountAsync(b => b.LoserId == setupId);
                setupRet.Losses = losses;

                return Results.Ok(setupRet);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "GET /api/setups/setupId FAILED");
                return Results.Problem("An unexpected error occurred.");
            }
        });


        // Unauthenticated users can report setup
        app.MapPost("/api/setups/report/{setupId:guid}", async (AppDbContext db, HttpContext ctx, ILogger<Program> logger, Guid setupId) =>
        {
            try
            {
                var setup = await db.Setups
                    .Where(s => s.Id == setupId)
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
        }).AllowAnonymous();
    }
}
