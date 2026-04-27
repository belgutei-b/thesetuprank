using backend.Data;
using backend.Dtos;

namespace backend.Endpoints;

public static class SetupEndpoints
{
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
        app.MapPost("/api/setups", async (AppDbContext db, HttpContext ctx, SetupDto setupDto) =>
        {
            return Results.Ok();
        });

        app.MapPost("/api/setups/upload-url", async () =>
        {
            // generate azure blob storage
            // uploadUrl: temporary SAS URL for the frontend to upload the image
            // imageUrl: permanent public URL of the image after it is uploaded
        })
        .Produces<SetupUploadImageDto>(200)
        .Produces(401) // doesn't add any logic / will be caught in Program.cs
        .Produces(500);

    }
}
