namespace VttTools.Extensions;

public static class HttpContextExtensions {
    private const string _internalServiceKey = "IsInternalService";
    private const string _internalServiceNameKey = "InternalServiceName";

    public static bool IsInternalService(this HttpContext context)
        => context.Items.TryGetValue(_internalServiceKey, out var value) && value is true;

    public static string? GetInternalServiceName(this HttpContext context)
        => context.Items.TryGetValue(_internalServiceNameKey, out var value) ? value as string : null;

    public static void SetInternalService(this HttpContext context, string serviceName) {
        context.Items[_internalServiceKey] = true;
        context.Items[_internalServiceNameKey] = serviceName;
    }
}
