var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var redisConnection = builder.Configuration.GetConnectionString("Redis")
                   ?? throw new InvalidOperationException("Redis connection string is missing from the configuration.");
builder.Services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConnection));
builder.Services.AddSingleton<ICacheService, CacheService>();
builder.Services.AddSingleton<IJwtService, JwtService>();

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
               ?? throw new InvalidOperationException("Jwt settings are missing from the configuration.");

var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => options.TokenValidationParameters = new() {
    ValidateIssuer = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = jwtSettings.Issuer,
    IssuerSigningKey = securityKey,
});

builder.Services.AddAuthorization();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing from the configuration.");
builder.Services.AddDbContext<AuthDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentityCore<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services.AddSingleton<IEmailSender<ApplicationUser>, IdentityNoOpEmailSender>();

builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

// Middleware to validate client credentials
app.Use((context, next) => ValidateJwtToken(context, jwtSettings, next));

app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultEndpoints();
app.MapAuthEndpoints();

app.UseExceptionHandler();
if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();

app.Run();

return;

static async Task ValidateJwtToken(HttpContext context, JwtSettings settings, Func<Task> next) {
    try {
        var token = context.Request.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "");
        if (string.IsNullOrWhiteSpace(token)) {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return;
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(settings.Key);
        tokenHandler.ValidateToken(token,
                                   new() {
                                       ValidateIssuer = true,
                                       ValidateLifetime = true,
                                       ValidateIssuerSigningKey = true,
                                       ValidIssuer = settings.Issuer,
                                       IssuerSigningKey = new SymmetricSecurityKey(key),
                                   },
                                   out _);
        await next();
    }
    catch (SecurityTokenException) {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
    }
}
