using Role = IdentityService.Data.Model.Role;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddRedisDistributedCache("cache");

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

builder.Services.AddSingleton<ICacheService, CacheService>();
builder.Services.AddSingleton<IEmailSender<User>, IdentityNoOpEmailSender>();

builder.Services.AddScoped<IContactHandler, ContactHandler>();
builder.Services.AddScoped<IApiClientHandler, ApiClientHandler>();
builder.Services.AddScoped<IUserAccountHandler, UserAccountHandler>();
builder.Services.AddScoped<ISignInHandler, SignInHandler>();

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
               ?? throw new InvalidOperationException("Jwt settings are missing from the configuration.");
var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => options.TokenValidationParameters = new() {
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidateIssuer = true,
    ValidIssuer = jwtSettings.Issuer,
    ValidateAudience = true,
    ValidAudience = jwtSettings.Audience,
    IssuerSigningKey = securityKey,
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing from the configuration.");
builder.Services.AddDbContext<AuthDbContext>(options => options.UseSqlServer(connectionString));

builder.Services.AddDataProtection();
builder.Services.AddIdentity<User, Role>(options => {
    options.SignIn.RequireConfirmedAccount = true;
    options.Stores.SchemaVersion = IdentitySchemaVersions.Version2;
    options.Stores.MaxLengthForKeys = 48;
    options.Stores.ProtectPersonalData = false;
    options.SignIn.RequireConfirmedAccount = true;
    options.SignIn.RequireConfirmedEmail = true;
    options.User.RequireUniqueEmail = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 4;
}).AddEntityFrameworkStores<AuthDbContext>()
.AddSignInManager()
.AddDefaultTokenProviders();

var app = builder.Build();

app.UseAuthentication();

app.MapHealthCheckEndpoints();
app.MapApiClientEndpoints();
app.MapUserAccountEndpoints();
app.MapSignInEndpoints();

app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();

app.Run();
