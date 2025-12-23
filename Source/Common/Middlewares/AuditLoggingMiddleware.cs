using VttTools.Audit.Model.Payloads;

namespace VttTools.Middlewares;

public class AuditLoggingMiddleware(
    RequestDelegate next,
    IServiceProvider serviceProvider,
    IOptions<AuditLoggingOptions> options,
    ILogger<AuditLoggingMiddleware> logger) {

    private readonly AuditLoggingOptions _options = options.Value;

    public async Task InvokeAsync(HttpContext context) {
        if (!_options.Enabled || IsPathExcluded(context.Request.Path)) {
            await next(context);
            return;
        }
        var stopwatch = Stopwatch.StartNew();
        var originalResponseBody = context.Response.Body;

        await using var responseBodyStream = new MemoryStream();
        context.Response.Body = responseBodyStream;

        string? requestBody = null;
        string? responseBody = null;
        var statusCode = 0;

        try {
            requestBody = await CaptureRequestBodyAsync(context);
            await next(context);
            statusCode = context.Response.StatusCode;
            responseBody = await CaptureResponseBodyAsync(originalResponseBody, responseBodyStream);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Unhandled exception in request pipeline");
            statusCode = 500;
            throw;
        }
        finally {
            stopwatch.Stop();

            var user = context.User;
            Guid? userId = null;
            if (user?.Identity?.IsAuthenticated == true) {
                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdClaim, out var id)) {
                    userId = id;
                }
            }
            var userEmail = user?.FindFirst(ClaimTypes.Email)?.Value;
            var httpMethod = context.Request.Method;
            var path = context.Request.Path;
            var queryString = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : null;
            var ipAddress = context.Connection.RemoteIpAddress?.ToString();
            var userAgent = context.Request.Headers.UserAgent.ToString();
            var durationMs = (int)stopwatch.ElapsedMilliseconds;

            await Task.Run(async () => {
                try {
                    await using var scope = serviceProvider.CreateAsyncScope();
                    var scopedAuditLogService = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

                    await CreateAuditLogAsync(
                        userId,
                        userEmail,
                        httpMethod,
                        path,
                        queryString,
                        ipAddress,
                        userAgent,
                        requestBody,
                        responseBody,
                        statusCode,
                        durationMs,
                        scopedAuditLogService);
                }
                catch (Exception ex) {
                    logger.LogError(ex, "Failed to create audit log entry");
                }
            });
        }
    }

    private static async Task<string?> CaptureRequestBodyAsync(HttpContext context) {
        var request = context.Request;

        if (!ShouldCaptureBody(request.Method))
            return null;

        if (!request.Body.CanSeek)
            request.EnableBuffering();

        request.Body.Position = 0;
        using var reader = new StreamReader(request.Body, leaveOpen: true);
        var body = await reader.ReadToEndAsync();
        request.Body.Position = 0;

        return BodySanitizer.SanitizeRequestBody(body);
    }

    private static async Task<string?> CaptureResponseBodyAsync(Stream originalResponseBody, MemoryStream responseBodyStream) {
        responseBodyStream.Position = 0;
        await responseBodyStream.CopyToAsync(originalResponseBody);

        responseBodyStream.Position = 0;
        using var reader = new StreamReader(responseBodyStream);
        var body = await reader.ReadToEndAsync();

        return BodySanitizer.SanitizeResponseBody(body);
    }

    private static Task CreateAuditLogAsync(
        Guid? userId,
        string? userEmail,
        string httpMethod,
        PathString path,
        string? queryString,
        string? ipAddress,
        string? userAgent,
        string? requestBody,
        string? responseBody,
        int statusCode,
        int durationMs,
        IAuditLogService auditLogService) {

        var (action, entityType, entityId) = DeriveActionAndEntity(httpMethod, path, statusCode);

        var httpPayload = new HttpAuditPayload {
            HttpMethod = httpMethod,
            Path = path,
            QueryString = BodySanitizer.SanitizeQueryString(queryString),
            StatusCode = statusCode,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            RequestBody = requestBody,
            ResponseBody = responseBody,
            DurationMs = durationMs,
            Result = DetermineResult(statusCode),
        };

        var auditLog = new AuditLog {
            Timestamp = DateTime.UtcNow,
            UserId = userId,
            UserEmail = userEmail,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            ErrorMessage = statusCode >= 400 ? $"HTTP {statusCode}" : null,
            Payload = JsonSerializer.Serialize(httpPayload, JsonDefaults.Options),
        };

        return auditLogService.AddAsync(auditLog);
    }

    private static (string Action, string? EntityType, string? EntityId) DeriveActionAndEntity(
        string method,
        PathString path,
        int statusCode) {

        var pathSegments = path.ToString().Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (pathSegments.Length == 0)
            return ($"HTTP:{method}", null, null);

        var startIndex = pathSegments[0].Equals("api", StringComparison.OrdinalIgnoreCase) ? 1 : 0;

        if (startIndex >= pathSegments.Length)
            return ($"HTTP:{method}", null, null);

        // Extract entity type from first meaningful segment
        var entitySegment = pathSegments[startIndex];
        var entityType = NormalizeEntityType(entitySegment);

        // Extract entity ID if present (typically a GUID after the entity segment)
        string? entityId = null;
        if (startIndex + 1 < pathSegments.Length) {
            var potentialId = pathSegments[startIndex + 1];
            if (Guid.TryParse(potentialId, out _)) {
                entityId = potentialId;
            }
        }

        // Determine the operation verb
        var verb = DetermineVerb(method, entityId, statusCode);

        // Build action string: "{EntityType}:{Verb}:ByUser"
        var action = $"{entityType}:{verb}:ByUser";

        return (action, entityType, entityId);
    }

    private static string NormalizeEntityType(string segment) {
        // Capitalize first letter and handle plurals
        var normalized = segment.TrimEnd('s'); // Simple plural handling
        if (normalized.Length > 0) {
            normalized = char.ToUpperInvariant(normalized[0]) + normalized[1..];
        }
        return normalized switch {
            "Asset" => "Asset",
            "Resource" => "Resource",
            "Job" => "Job",
            "User" => "User",
            "GameSession" => "GameSession",
            "Campaign" => "Campaign",
            "Adventure" => "Adventure",
            "Encounter" => "Encounter",
            "World" => "World",
            "Auth" => "User", // Auth endpoints affect User entity
            "Account" => "User", // Account endpoints affect User entity
            "Admin" => "Admin",
            "Audit" => "AuditLog",
            _ => segment
        };
    }

    private static string DetermineVerb(string method, string? entityId, int statusCode)
        => statusCode >= 400
            ? "FailedAccess"
            : method.ToUpperInvariant() switch {
                "POST" => "Created",
                "PUT" => "Updated",
                "PATCH" => "Updated",
                "DELETE" => "Deleted",
                "GET" when entityId is not null => "Viewed",
                "GET" => "Listed",
                _ => "Accessed"
            };

    private static string DetermineResult(int statusCode) => statusCode switch {
        >= 200 and < 300 => "Success",
        >= 400 and < 500 => "Failure",
        >= 500 => "Error",
        _ => "Unknown"
    };

    private static bool ShouldCaptureBody(string method) => method is "POST" or "PUT" or "PATCH" or "DELETE";

    private bool IsPathExcluded(PathString path) {
        if (_options.ExcludedPaths.Count == 0)
            return false;

        var pathString = path.ToString();
        return _options.ExcludedPaths.Any(excluded =>
            pathString.Equals(excluded, StringComparison.OrdinalIgnoreCase) ||
            pathString.StartsWith(excluded, StringComparison.OrdinalIgnoreCase));
    }
}
