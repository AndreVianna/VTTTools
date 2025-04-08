namespace WebApi.EntityFrameworkCore.Utilities;

public class NullLookupProtector : ILookupProtector {
    public string Protect(string keyId, string? data) => data ?? string.Empty;
    public string Unprotect(string keyId, string? data) => data ?? string.Empty;
}