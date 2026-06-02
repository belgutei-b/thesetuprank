using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Auth;

public sealed class AppAuthService(
    AppDbContext db,
    IConfiguration configuration,
    IWebHostEnvironment environment)
{
    public async Task HandleGoogleTicketReceivedAsync(TicketReceivedContext ctx)
    {
        // Step 1: read and validate Google's identity claims from ctx.Principal.
        var principal = ctx.Principal;
        if (principal is null)
        {
            throw new InvalidOperationException("Missing google's identity claims");
        }
        
        // Step 2: find or create the local user by GoogleSubjectId, not email.
        var oauthUser = ReadGoogleUserInfo(principal);
        
        // Step 3: update local display fields such as Email, Name, and ImageUrl.
        var dbUser = await FindUserByGoogleSubjectIdAsync(oauthUser.GoogleSubjectId)
                     ?? await CreateUserFromGoogleAsync(oauthUser);

        // Step 4: create this app's own JWT with the local user id as NameIdentifier.
        string jwtToken = CreateAppJwt(dbUser);
        
        // Step 5: append the JWT as an HttpOnly Secure cookie.
        AppendAuthCookie(ctx.Response, jwtToken);
        
        // Step 6: redirect the browser back to the frontend.
        ctx.Response.Redirect(GetFrontendRedirectUrl()); 
        ctx.HandleResponse();
    }

    // private: callable only from within the same class
    // static: method does not need data from the current object
    private static GoogleOAuthUserInfo ReadGoogleUserInfo(ClaimsPrincipal principal)
    {
        foreach (var claim in principal.Claims)
        {
            Console.WriteLine($"{claim.Type}: {claim.Value}");
        }

        var email = principal.FindFirstValue(ClaimTypes.Email);
        var googleSubjectId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var name = principal.FindFirstValue(ClaimTypes.Name);
        var imageUrl = principal.FindFirstValue("urn:google:picture");
        var emailVerified = principal.FindFirstValue("urn:google:email_verified");
        
        // Reject the login if GoogleSubjectId is missing.
        // Reject the login if email is missing or email_verified is false.
        if (email is null ||
            googleSubjectId is null ||
            !string.Equals(emailVerified, "true", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Missing identity claims");
        }

        GoogleOAuthUserInfo googleOAuthUserInfo = new (
            googleSubjectId,
            email,
            name,
            imageUrl);
        
        return googleOAuthUserInfo;
    }

    // Task: representing a work that will finish later
    // it is same as async function returning with await
    private Task<User?> FindUserByGoogleSubjectIdAsync(string googleSubjectId)
    {
        // Query db.Users by the stable Google subject id.
        return db.Users.FirstOrDefaultAsync(user => user.GoogleSubjectId == googleSubjectId);
    }

    private async Task<User> CreateUserFromGoogleAsync(GoogleOAuthUserInfo googleUser)
    {
        // Create your own local User row.
        
        var user = new User
        {
            GoogleSubjectId = googleUser.GoogleSubjectId,
            Email = googleUser.Email,
            Name = googleUser.Name,
            ImageUrl = googleUser.ImageUrl,
            // Handle can be changed later by the user
            Handle = googleUser.Name ?? "",
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return user;
    }

    private string CreateAppJwt(User user)
    {
        // Create a JWT
        
        var jwtKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing");
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        var token = new JwtSecurityToken(
            issuer: "thesetuprank",
            audience: "thesetuprank",
            claims:
            [
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            ],
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token); 
    }

    private void AppendAuthCookie(HttpResponse response, string jwt)
    {
        // Store the app JWT in an HttpOnly cookie.
        //
        // Production settings should normally be:
        // - HttpOnly = true
        // - Secure = true
        // - SameSite = Lax if frontend/backend share site
        // - SameSite = None only if truly cross-site, and then Secure must be true
        response.Cookies.Append("auth_token", jwt, new CookieOptions
        {
            HttpOnly = true, // browser js can't read the value
            Secure = environment.IsProduction(), // is https only
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(7),
            Path = "/"
        });
    }

    public void DeleteAuthCookie(HttpResponse response)
    {
        // Delete the auth cookie using matching cookie options/path.
        throw new NotImplementedException();
    }

    private string GetFrontendRedirectUrl()
    {
        return configuration["App:FrontendUrl"] ?? "/";
    }
}
