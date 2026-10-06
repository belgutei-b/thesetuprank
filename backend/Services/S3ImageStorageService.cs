using Amazon.S3;
using Amazon.S3.Model;

namespace backend.Services;

public interface IImageStorageService
{
    Task<string> UploadImageAsync(IFormFile file, CancellationToken ct = default);
    string GetImageUrl(string key);
}

public class S3ImageStorageService : IImageStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;
    private readonly string _cloudFrontBaseUrl;

    public S3ImageStorageService(IAmazonS3 s3, IConfiguration config)
    {
        _s3 = s3;
        _bucketName =
            config["S3:BucketName"]
            ?? throw new InvalidOperationException("missing S3 bucket name");
        _cloudFrontBaseUrl =
            config["CloudFront:BaseUrl"]
            ?? throw new InvalidOperationException("missing CloudFront base url");
    }

    public string GetImageUrl(string key) => $"{_cloudFrontBaseUrl}/{key}";

    public async Task<string> UploadImageAsync(IFormFile file, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var key = $"images/{Guid.NewGuid()}{extension}";

        await using var stream = file.OpenReadStream();

        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = file.ContentType,
        };

        await _s3.PutObjectAsync(request, ct);

        return key;
    }
}
