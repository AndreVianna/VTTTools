
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
                        (int)stopwatch.ElapsedMilliseconds,
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

    private static async Task CreateAuditLogAsync(
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
        int durationInMilliseconds,
        IAuditLogService auditLogService) {

        var auditLog = new AuditLog {
            Timestamp = DateTime.UtcNow,
            UserId = userId,
            UserEmail = userEmail,
            Action = DetermineAction(httpMethod, path),
            HttpMethod = httpMethod,
            Path = path,
            QueryString = BodySanitizer.SanitizeQueryString(queryString),
            StatusCode = statusCode,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            RequestBody = requestBody,
            ResponseBody = responseBody,
            DurationInMilliseconds = durationInMilliseconds,
            Result = DetermineResult(statusCode)
        };

        await auditLogService.AddAsync(auditLog);
    }

    private static string DetermineAction(string method, PathString path) {
        var pathSegments = path.ToString().Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (pathSegments.Length == 0)
            return $"{method} Unknown";

        var startIndex = pathSegments[0].Equals("api", StringComparison.OrdinalIgnoreCase) ? 1 : 0;

        if (startIndex >= pathSegments.Length)
            return $"{method} Unknown";

        var actionSegments = new List<string>();
        for (var i = startIndex; i < pathSegments.Length; i++) {
            var segment = pathSegments[i];

            if (Guid.TryParse(segment, out _)) {
                actionSegments.Add("{guid}");
            }
            else if (int.TryParse(segment, out _)) {
                actionSegments.Add("{int}");
            }
            else {
                actionSegments.Add(segment);
            }
        }

        var action = string.Join('/', actionSegments);
        return $"{method} {action}";
    }

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
