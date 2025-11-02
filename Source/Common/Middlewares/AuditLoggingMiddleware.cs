
namespace VttTools.Middlewares;

public class AuditLoggingMiddleware(
    RequestDelegate next,
    ILogger<AuditLoggingMiddleware> logger) {

    public async Task InvokeAsync(HttpContext context, IAuditLogService auditLogService) {
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
            _ = Task.Run(async () => {
                try {
                    await CreateAuditLogAsync(
                        context,
                        requestBody,
                        responseBody,
                        statusCode,
                        (int)stopwatch.ElapsedMilliseconds,
                        auditLogService);
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
        HttpContext context,
        string? requestBody,
        string? responseBody,
        int statusCode,
        int DurationInMilliseconds,
        IAuditLogService auditLogService) {

        var user = context.User;
        Guid? userId = null;
        if (user?.Identity?.IsAuthenticated == true) {
            var userIdClaim = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var id)) {
                userId = id;
            }
        }

        var userEmail = user?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        var auditLog = new AuditLog {
            Timestamp = DateTime.UtcNow,
            UserId = userId,
            UserEmail = userEmail,
            Action = DetermineAction(context.Request.Method, context.Request.Path),
            HttpMethod = context.Request.Method,
            Path = context.Request.Path,
            QueryString = BodySanitizer.SanitizeQueryString(
                context.Request.QueryString.HasValue
                    ? context.Request.QueryString.Value
                    : null),
            StatusCode = statusCode,
            IpAddress = context.Connection.RemoteIpAddress?.ToString(),
            UserAgent = context.Request.Headers.UserAgent.ToString(),
            RequestBody = requestBody,
            ResponseBody = responseBody,
            DurationInMilliseconds = DurationInMilliseconds,
            Result = DetermineResult(statusCode)
        };

        await auditLogService.AddAsync(auditLog);
    }

    private static string DetermineAction(string method, PathString path) {
        var pathSegments = path.ToString().Split('/', StringSplitOptions.RemoveEmptyEntries);
        var action = pathSegments.Length > 0 ? pathSegments[^1] : "Unknown";

        return $"{method} {action}";
    }

    private static string DetermineResult(int statusCode) => statusCode switch {
        >= 200 and < 300 => "Success",
        >= 400 and < 500 => "Failure",
        >= 500 => "Error",
        _ => "Unknown"
    };

    private static bool ShouldCaptureBody(string method) => method is "POST" or "PUT" or "PATCH" or "DELETE";
}
