namespace WebApi.Contracts;

public record RegisterTenantRequest : IValidatable {
    public required string Name { get; set; }

    public virtual Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error($"The '{nameof(Name)}' is required.", nameof(Name));
        return result;
    }
}