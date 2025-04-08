namespace WebApi.EntityFrameworkCore.Utilities;

public sealed class NullPersonalDataProtector
    : IPersonalDataProtector {
    [return: NotNullIfNotNull(nameof(data))]
    public string? Protect(string? data) => data;

    [return: NotNullIfNotNull(nameof(data))]
    public string? Unprotect(string? data) => data;
}