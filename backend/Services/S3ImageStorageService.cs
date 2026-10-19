using Amazon.S3;
using Amazon.S3.Model;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace backend.Services;

public interface IImageStorageService
{
    Task<string> UploadImageAsync(IFormFile file, CancellationToken ct = default);
    string GetImageUrl(string key);
}

public class S3ImageStorageService : IImageStorageService
{
    private const long MaxUploadBytes = 10 * 1024 * 1024; // 10MB
    private const long MaxInputPixels = 50_000_000; // guards against decompression bombs
    private const int MaxSide = 1600; // longest side of the stored image
    private const int WebpQuality = 80;
    private const string ImageCacheControl = "public, max-age=31536000, immutable";

    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;
    private readonly string _cloudFrontBaseUrl;

    public S3ImageStorageService(IAmazonS3 s3, IConfiguration config)
    {
        _s3 = s3;
        _bucketName =
            config["S3:BucketName"]
            ?? throw new InvalidOperationException("S3:BucketName is not configured");
        _cloudFrontBaseUrl =
            config["CloudFront:BaseUrl"]
            ?? throw new InvalidOperationException("CloudFront:BaseUrl is not configured");
    }

    public string GetImageUrl(string key) => $"{_cloudFrontBaseUrl}/{key}";

    // Validates the upload, converts it to WebP, and stores it in S3.
    // Returns the S3 key to save in the database.
    public async Task<string> UploadImageAsync(IFormFile file, CancellationToken ct = default)
    {
        // Checking the initial file type & size
        using var image = await LoadAndValidateAsync(file, ct);
        // Compress the image & make it WebP image
        using var webp = await ToWebpAsync(image, ct);

        var key = $"images/{Guid.NewGuid()}.webp";
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = webp,
            ContentType = "image/webp",
        };
        request.Headers.CacheControl = ImageCacheControl;

        await _s3.PutObjectAsync(request, ct);
        return key;
    }

    // Throws InvalidImageException for anything the user has to fix (the endpoint returns 400).
    private static async Task<Image> LoadAndValidateAsync(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0 || file.Length > MaxUploadBytes)
            throw new InvalidImageException(
                $"Image must be under {MaxUploadBytes / 1024 / 1024} MB"
            );

        try
        {
            // reads only the header: the real format and dimensions, without decoding pixels
            await using (var header = file.OpenReadStream())
            {
                var info = await Image.IdentifyAsync(header, ct);
                if (info.Metadata.DecodedImageFormat is not (JpegFormat or PngFormat or WebpFormat))
                    throw new InvalidImageException("Only JPEG, PNG or WebP images are allowed");
                if ((long)info.Width * info.Height > MaxInputPixels)
                    throw new InvalidImageException("Image dimensions are too large");
            }

            await using var input = file.OpenReadStream();
            return await Image.LoadAsync(input, ct);
        }
        catch (ImageFormatException) // not an image, or a corrupted one
        {
            throw new InvalidImageException("File is not a valid image");
        }
    }

    // Rotates phone photos upright, shrinks them to fit MaxSide (keeping their
    // shape), strips metadata (including GPS location), and encodes as WebP.
    private static async Task<MemoryStream> ToWebpAsync(Image image, CancellationToken ct)
    {
        image.Mutate(x =>
        {
            x.AutoOrient();
            // only shrink: smaller photos keep their size
            if (image.Width > MaxSide || image.Height > MaxSide)
                x.Resize(
                    new ResizeOptions
                    {
                        Size = new Size(MaxSide, MaxSide),
                        Mode = ResizeMode.Max, // fits inside MaxSide x MaxSide, keeps the aspect ratio
                    }
                );
        });
        image.Metadata.ExifProfile = null;
        image.Metadata.XmpProfile = null;

        var output = new MemoryStream();
        await image.SaveAsync(output, new WebpEncoder { Quality = WebpQuality }, ct);
        output.Position = 0; // rewind so S3 reads from the start
        return output;
    }
}
