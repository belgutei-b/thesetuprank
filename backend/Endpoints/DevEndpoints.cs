using Amazon.S3;
using Amazon.S3.Model;

namespace backend.Endpoints;

public static class DevEndpoints
{
    public static void MapDevEndpoints(this WebApplication app)
    {
        app.MapGet("/api/dev/s3-test", async (IAmazonS3 s3, IConfiguration config) =>
        {
            var bucket = config["S3:BucketName"];
            var key = $"dev-test/{Guid.NewGuid()}.txt";

            // 1. write
            await s3.PutObjectAsync(new PutObjectRequest
            {
                BucketName = bucket,
                Key = key,
                ContentBody = $"hello from .NET at {DateTime.UtcNow:O}",
            });

            // 2. read it back
            using var res = await s3.GetObjectAsync(bucket, key);
            using var reader = new StreamReader(res.ResponseStream);
            var body = await reader.ReadToEndAsync();

            return Results.Ok(new { bucket, key, body });
        }).AllowAnonymous();
    }
}