namespace HttpServices.Data;

public sealed class NullPersonalDataProtector
    : IPersonalDataProtector {
    [return: NotNullIfNotNull("data")]
    public string? Protect(string? data) => data;

    [return: NotNullIfNotNull("data")]
    public string? Unprotect(string? data) => data;
}
