namespace backend.Auth;

public sealed record GoogleOAuthUserInfo(
    string GoogleSubjectId,
    string Email,
    string? Name,
    string? ImageUrl
    );
