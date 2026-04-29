using System.Security.Claims;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using backend.Data;
using backend.Dtos;

namespace backend.Endpoints;

public static class SetupEndpoints
{
    private const int MaxNameLength = 40;
    private const int MaxDescriptionLength = 400;

    public static void MapSetupEndpoints(this WebApplication app)
    {
        app.MapGet("/api/setups", async (AppDbContext db, HttpContext ctx) =>
        {
            return Results.Ok();
        });

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
                if (!setupPostDto.ImageUrl.StartsWith("https://setupimages.blob.core.windows.net/setupcontainer/"))
                {
                    throw new Exception("Invalid image url");
                }

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

    }
}
