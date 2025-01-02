namespace HttpServices.Abstractions.Contracts.Client;

public sealed record RegisterClientRequest : IValidatable {
    public required string Name { get; set; }

    public Result Validate(IMap? context = null) {
        var result = Result.Success();
        if (string.IsNullOrWhiteSpace(Name))
            result += new ValidationError("Name is required.", nameof(Name));
        return result;
    }
}