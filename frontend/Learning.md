### Endpoint protection

```c#
// all endpoints require auth by default
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .AddAuthenticationSchemes("Bearer")
        .RequireAuthenticatedUser()
        .Build();
});
```

- now every endpoint is protected and needs Bearer scheme
- to allow unauthenticated access to some endpoints, add `AllowAnonymous()` to the endpoint
